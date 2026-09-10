import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Initialize Google GenAI
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Resilient model caller: tries gemini-3.6-flash first (as recommended), then falls back to gemini-3.8-flash
async function generateWithModelFallback(params: {
  contents: any;
  config?: any;
}) {
  const ai = getGenAI();
  const modelsToTry = ['gemini-3.6-flash', 'gemini-3.8-flash'];
  let lastError: any;
  for (const model of modelsToTry) {
    try {
      return await ai.models.generateContent({
        ...params,
        model,
      });
    } catch (err: any) {
      console.warn(`Model ${model} attempt failed:`, err?.message || err);
      lastError = err;
    }
  }
  throw lastError;
}

// -------------------------------------------------------------
// 1. Health check
// -------------------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// -------------------------------------------------------------
// 2. Parse Raw Itinerary (TripIt / Booking confirmation)
// -------------------------------------------------------------
app.post('/api/gemini/parse-itinerary', async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || typeof rawText !== 'string' || !rawText.trim()) {
      return res.status(400).json({ error: 'rawText is required' });
    }

    const ai = getGenAI();

    const prompt = `You are a world-class travel data parser and itinerary cartographer.
Analyze the following raw travel booking / TripIt itinerary text and extract every single chronological event, flight, layover, hotel check-in/out, ferry, car rental pickup/dropoff, and activity.

For EVERY event, accurately determine:
- type: 'flight' | 'stay' | 'transit' | 'car' | 'sight' | 'ferry'
- title: concise descriptive title (e.g., "Flight SFO → LHR", "Check In Airbnb - Yue", "Seajets Ferry PIR → JNX")
- subtitle: helpful summary (airline + flight number, or check-in note)
- date: format as e.g. "Wed, Sep 16"
- time: e.g. "4:35 PM PDT" or "11:00 AM"
- city: city name (e.g., "San Francisco", "London", "Athens", "Piraeus", "Naxos", "Venice", "Florence", "Montepulciano", "Pesaro", "Rome", "Terracina", "Manchester")
- country: e.g., "Greece", "Italy", "United Kingdom", "United States"
- address: full street address or airport/station name
- lat: accurate latitude number for this specific place or airport
- lng: accurate longitude number for this specific place or airport
- carrier: airline / ferry / car rental company if applicable
- flightNumber: e.g., "BA 284", "GQ 401"
- terminal: terminal information if any
- pin: lockbox/access PIN if mentioned (e.g., "PIN: 7893", "PIN: 3312")
- phone: phone contact number if mentioned
- notes: key details, house rules, layover duration, car rental instructions
- houseRules: house rules if stated
- categoryTag: clean short tag (e.g., "Transatlantic Flight", "Airbnb", "Seaside Villa", "Car Rental", "Ancient Landmark")

Also provide:
- tripTitle: an inspiring, concise title for this trip
- description: a 1-2 sentence trip overview
- startDate: YYYY-MM-DD
- endDate: YYYY-MM-DD

RAW ITINERARY TEXT:
${rawText}
`;

    const response = await generateWithModelFallback({
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            tripTitle: { type: Type.STRING },
            description: { type: Type.STRING },
            startDate: { type: Type.STRING },
            endDate: { type: Type.STRING },
            stops: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  type: { type: Type.STRING },
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  date: { type: Type.STRING },
                  time: { type: Type.STRING },
                  endDate: { type: Type.STRING },
                  endTime: { type: Type.STRING },
                  city: { type: Type.STRING },
                  country: { type: Type.STRING },
                  address: { type: Type.STRING },
                  lat: { type: Type.NUMBER },
                  lng: { type: Type.NUMBER },
                  carrier: { type: Type.STRING },
                  flightNumber: { type: Type.STRING },
                  terminal: { type: Type.STRING },
                  pin: { type: Type.STRING },
                  phone: { type: Type.STRING },
                  notes: { type: Type.STRING },
                  houseRules: { type: Type.STRING },
                  categoryTag: { type: Type.STRING },
                },
                required: ['title', 'type', 'date', 'city', 'country', 'lat', 'lng'],
              },
            },
          },
          required: ['tripTitle', 'stops'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    // Ensure ids exist
    if (Array.isArray(parsed.stops)) {
      parsed.stops = parsed.stops.map((s: any, idx: number) => ({
        ...s,
        id: s.id || `stop-${Date.now()}-${idx + 1}`,
      }));
    }

    return res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error('Error parsing itinerary with Gemini:', err);
    return res.status(500).json({
      error: 'Failed to parse itinerary',
      details: err.message,
    });
  }
});

let mapsQuotaAvailable = true;
let mapsQuotaCheckTimestamp = 0;

// -------------------------------------------------------------
// 3. Suggest Places with Google Maps Grounding & Gemini
// -------------------------------------------------------------
app.post('/api/gemini/suggest-places', async (req, res) => {
  try {
    const { city, country, stayAddress, lat, lng, category, userPrompt } = req.body;
    if (!city) {
      return res.status(400).json({ error: 'City name is required' });
    }

    const ai = getGenAI();

    const queryContext = `City: ${city}, ${country || ''}.
Base Accommodation Address: ${stayAddress || 'Downtown'}.
Coordinates: ${lat ? `${lat}, ${lng}` : 'center'}.
Category Preference: ${category || 'all-round highlight spots, local dining, hidden gems, and scenic attractions'}.
${userPrompt ? `Specific Traveler Request: "${userPrompt}"` : ''}`;

    let responseText = '';
    let usedMapsGrounding = false;
    let mapsGroundingChunks: any[] = [];

    // Reset quota check after 5 minutes cooldown
    if (!mapsQuotaAvailable && Date.now() - mapsQuotaCheckTimestamp > 5 * 60 * 1000) {
      mapsQuotaAvailable = true;
    }

    // First attempt: Gemini with googleMaps tool for live grounded places (if quota available)
    if (mapsQuotaAvailable) {
      try {
      const groundedPrompt = `You are a local insider and vacation travel expert.
Using Google Maps data, suggest 5-7 exceptional, verified places to visit, dine, or explore in or around ${city} (${country || ''}).
Address or base accommodation: ${stayAddress || city}.

For each place, provide:
1. Exact Name
2. Category (food, sight, culture, hidden_gem, daytrip, nature)
3. Full Street Address or Location
4. Approximate latitude and longitude
5. Description (2-3 sentences)
6. Why visit & what makes it special
7. 3-4 descriptive tags (e.g., ["Seafood", "Sunset", "Michelin Guide"])
8. Local Insider Tip (what to order, best timing, parking, or secret view)
9. Estimated duration

Return your response as a JSON object with:
{
  "citySummary": "Brief evocative 1-2 sentence description of what makes this destination magical",
  "places": [
    {
      "name": "...",
      "category": "...",
      "address": "...",
      "lat": 0.0,
      "lng": 0.0,
      "rating": 4.8,
      "description": "...",
      "whyVisit": "...",
      "tags": ["..."],
      "localTip": "...",
      "estimatedTime": "..."
    }
  ],
  "localTips": [
    "Practical local travel advice (e.g. transport, tipping, timing)..."
  ]
}
${queryContext}`;

      const mapsConfig: any = {
        tools: [{ googleMaps: {} }] as any,
      };
      if (lat && lng && !isNaN(Number(lat)) && !isNaN(Number(lng))) {
        mapsConfig.toolConfig = {
          retrievalConfig: {
            latLng: {
              latitude: Number(lat),
              longitude: Number(lng),
            },
          },
        };
      }

      const groundedResp = await generateWithModelFallback({
        contents: groundedPrompt,
        config: mapsConfig,
      });

      if (groundedResp.text) {
        responseText = groundedResp.text;
        usedMapsGrounding = true;
      }
      if (groundedResp.candidates?.[0]?.groundingMetadata?.groundingChunks) {
        mapsGroundingChunks = groundedResp.candidates[0].groundingMetadata.groundingChunks;
      }
      } catch (groundingErr: any) {
        console.warn('Google Maps grounding tool call failed or unavailable, falling back to structured JSON generation:', groundingErr?.message || groundingErr);
        if (
          groundingErr?.message?.includes('RESOURCE_EXHAUSTED') ||
          groundingErr?.message?.includes('quota') ||
          groundingErr?.status === 'RESOURCE_EXHAUSTED' ||
          groundingErr?.code === 429
        ) {
          mapsQuotaAvailable = false;
          mapsQuotaCheckTimestamp = Date.now();
        }
      }
    }

    let parsedData: any = {};
    if (responseText) {
      // Clean markdown code fence if present
      let cleaned = responseText.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\s*/, '').replace(/```\s*$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
      }

      try {
        parsedData = JSON.parse(cleaned);
      } catch {
        // Find outermost JSON object
        const start = cleaned.indexOf('{');
        const end = cleaned.lastIndexOf('}');
        if (start !== -1 && end !== -1) {
          try {
            parsedData = JSON.parse(cleaned.slice(start, end + 1));
          } catch {
            parsedData = {};
          }
        }
      }
    }

    // Fallback if grounding didn't produce a valid places array
    if (!Array.isArray(parsedData.places) || parsedData.places.length === 0) {
      usedMapsGrounding = false;
      const fallbackPrompt = `You are an elite travel concierge. Suggest 5 to 6 remarkable, real places to visit, authentic restaurants, scenic walks, and hidden gems for vacationers staying in ${city}, ${country || ''}.
Base location: ${stayAddress || city}.
Focus: ${category || 'Top sights, local food, culture, and day trips'}.
${userPrompt ? `Special request: ${userPrompt}` : ''}
`;

      const standardResp = await generateWithModelFallback({
        contents: fallbackPrompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              citySummary: { type: Type.STRING },
              places: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING },
                    address: { type: Type.STRING },
                    lat: { type: Type.NUMBER },
                    lng: { type: Type.NUMBER },
                    rating: { type: Type.NUMBER },
                    description: { type: Type.STRING },
                    whyVisit: { type: Type.STRING },
                    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
                    localTip: { type: Type.STRING },
                    estimatedTime: { type: Type.STRING },
                  },
                  required: ['name', 'category', 'description', 'whyVisit', 'lat', 'lng'],
                },
              },
              localTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['citySummary', 'places'],
          },
        },
      });

      try {
        parsedData = JSON.parse(standardResp.text || '{}');
      } catch {
        parsedData = { citySummary: `Highlights in ${city}`, places: [], localTips: [] };
      }
    }

    // Attach unique IDs and city
    if (Array.isArray(parsedData.places)) {
      parsedData.places = parsedData.places.map((p: any, idx: number) => ({
        ...p,
        id: `sug-${Date.now()}-${idx + 1}`,
        city: city,
        isSaved: false,
      }));
    }

    return res.json({
      success: true,
      usedMapsGrounding,
      groundingChunks: mapsGroundingChunks,
      data: parsedData,
    });
  } catch (err: any) {
    console.error('Error suggesting places with Gemini:', err);
    return res.status(500).json({
      error: 'Failed to generate place suggestions',
      details: err.message,
    });
  }
});

// -------------------------------------------------------------
// 4. Multi-turn AI Travel Concierge Chat
// -------------------------------------------------------------
app.post('/api/gemini/chat', async (req, res) => {
  try {
    const { message, history, tripContext, role = 'concierge' } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const ai = getGenAI();

    let roleInstruction = 'You are a warm, knowledgeable personal vacation concierge.';
    if (role === 'local_guide') {
      roleInstruction = 'You are an enthusiastic local guide who knows the hidden alleys, secret vistas, cultural etiquette, and artisan traditions of Mediterranean Greece, Italy, and the UK.';
    } else if (role === 'foodie') {
      roleInstruction = 'You are an Italian & Greek culinary master and sommelier. You love recommending authentic trattorias, seafood tavernas, regional DOCG wines (like Vino Nobile in Montepulciano), cicchetti bars in Venice, and artisanal markets.';
    } else if (role === 'logistics') {
      roleInstruction = 'You are a master travel logistics coordinator. You specialize in ferry connections (Piraeus to Naxos), airport transfers, train connections, rental car driving in Tuscany and Rome (avoiding ZTL zones), and smooth check-ins.';
    }

    const contextSummary = tripContext
      ? `CURRENT TRIP CONTEXT:
Title: ${tripContext.title}
Dates: ${tripContext.startDate} to ${tripContext.endDate}
Destinations: San Francisco, London Heathrow, Athens/Mikrolimano Piraeus, Naxos Island, Venice Cannaregio, Florence, Montepulciano (Tuscany), Pesaro (Adriatic), Rome, Terracina (Riviera di Ulisse), and Manchester.
Current Stops Count: ${tripContext.stops?.length || 0}
Saved Places: ${(tripContext.savedPlaces || []).map((p: any) => `${p.name} (${p.city})`).slice(0, 10).join(', ')}`
      : 'User is planning a vacation trip.';

    const systemInstruction = `${roleInstruction}
${contextSummary}

GUIDELINES:
- Provide clear, actionable, friendly advice.
- When recommending spots, highlight why it's worth visiting and include practical tips (best time of day, dish to order, transit tip).
- At the end of helpful recommendations, provide 2 or 3 brief suggested follow-up prompts formatted on their own lines beginning with "SUGGESTION: " so the UI can display them as quick clickable chips.`;

    // Convert prior conversation history to contents format
    const contents: any[] = [];
    if (Array.isArray(history)) {
      for (const msg of history.slice(-8)) {
        contents.push({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        });
      }
    }
    // Add current user message
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });

    const response = await generateWithModelFallback({
      contents: contents,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const rawReply = response.text || '';

    // Extract quick suggestions
    const lines = rawReply.split('\n');
    const cleanedLines: string[] = [];
    const suggestedActions: string[] = [];

    for (const line of lines) {
      if (line.trim().startsWith('SUGGESTION:')) {
        suggestedActions.push(line.replace('SUGGESTION:', '').trim());
      } else {
        cleanedLines.push(line);
      }
    }

    return res.json({
      success: true,
      reply: cleanedLines.join('\n').trim(),
      suggestedActions,
    });
  } catch (err: any) {
    console.error('Error in concierge chat:', err);
    return res.status(500).json({
      error: 'Concierge chat failed',
      details: err.message,
    });
  }
});

// -------------------------------------------------------------
// Vite middleware / Static serving
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Trip Mapper Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
