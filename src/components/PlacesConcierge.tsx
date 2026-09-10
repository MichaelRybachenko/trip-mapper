import React, { useState } from 'react';
import { SuggestedPlace, ItineraryStop } from '../types';
import { 
  Sparkles, 
  MapPin, 
  Star, 
  Clock, 
  Bookmark, 
  BookmarkCheck, 
  Compass, 
  Utensils, 
  Landmark, 
  Sun, 
  Plus, 
  ExternalLink,
  Search,
  RefreshCw,
  Tag,
  Check
} from 'lucide-react';

interface PlacesConciergeProps {
  stops: ItineraryStop[];
  savedPlaces: SuggestedPlace[];
  activeCity: string;
  onSelectCity: (city: string) => void;
  onToggleSavePlace: (place: SuggestedPlace) => void;
  onFocusPlaceOnMap: (place: SuggestedPlace) => void;
  onAddCustomPlace: (place: SuggestedPlace) => void;
}

export const PlacesConcierge: React.FC<PlacesConciergeProps> = ({
  stops,
  savedPlaces,
  activeCity,
  onSelectCity,
  onToggleSavePlace,
  onFocusPlaceOnMap,
  onAddCustomPlace,
}) => {
  // Extract unique cities from trip stops
  const availableCities = Array.from(
    new Set(
      stops
        .map((s) => s.city)
        .filter((c) => c && !c.includes('to') && !c.includes('Departure'))
    )
  );

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userPrompt, setUserPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiPlaces, setAiPlaces] = useState<SuggestedPlace[]>([]);
  const [citySummary, setCitySummary] = useState<string>('');
  const [cityTips, setCityTips] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Combine static curated places with dynamically generated AI places
  const allPlaces = [...savedPlaces, ...aiPlaces].filter((place, index, self) =>
    index === self.findIndex((p) => p.name.toLowerCase() === place.name.toLowerCase())
  );

  // Filter places for active city and category
  const filteredPlaces = allPlaces.filter((p) => {
    const matchesCity =
      !activeCity ||
      activeCity === 'All Destinations' ||
      p.city.toLowerCase().includes(activeCity.toLowerCase()) ||
      activeCity.toLowerCase().includes(p.city.toLowerCase());

    if (!matchesCity) return false;
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'saved') return p.isSaved;
    return p.category === selectedCategory;
  });

  // Call backend to generate AI suggestions with Maps Grounding & Gemini
  const handleGenerateSuggestions = async () => {
    if (!activeCity || activeCity === 'All Destinations') {
      setStatusMessage('Please select a specific destination above first');
      setTimeout(() => setStatusMessage(null), 3000);
      return;
    }

    setIsLoading(true);
    setStatusMessage('Consulting Google Maps & Gemini for top vacation spots...');

    try {
      // Find associated stop for address context
      const stopContext = stops.find((s) => s.city.toLowerCase().includes(activeCity.toLowerCase()));

      const res = await fetch('/api/gemini/suggest-places', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: activeCity,
          country: stopContext?.country || '',
          stayAddress: stopContext?.address || '',
          lat: stopContext?.lat,
          lng: stopContext?.lng,
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          userPrompt: userPrompt.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        if (data.data.places && Array.isArray(data.data.places)) {
          setAiPlaces(data.data.places);
        }
        if (data.data.citySummary) {
          setCitySummary(data.data.citySummary);
        }
        if (data.data.localTips) {
          setCityTips(data.data.localTips);
        }
        setStatusMessage(
          data.usedMapsGrounding
            ? '✨ Grounded with live Google Maps data!'
            : '✨ Generated curated vacation recommendations!'
        );
      } else {
        setStatusMessage('Could not fetch suggestions. Please try again.');
      }
    } catch (err) {
      console.error('Failed to suggest places:', err);
      setStatusMessage('Network error while getting suggestions.');
    } finally {
      setIsLoading(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food':
        return <Utensils className="w-3.5 h-3.5 text-amber-600" />;
      case 'sight':
        return <Landmark className="w-3.5 h-3.5 text-rose-600" />;
      case 'culture':
        return <Compass className="w-3.5 h-3.5 text-indigo-600" />;
      case 'nature':
        return <Sun className="w-3.5 h-3.5 text-emerald-600" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50/50">
      {/* City Switcher Bar */}
      <div className="p-3.5 border-b border-slate-200 bg-white sticky top-0 z-10 space-y-3 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-900">Destination Concierge</h3>
          </div>
          {statusMessage && (
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full animate-fade-in">
              {statusMessage}
            </span>
          )}
        </div>

        {/* Horizontal City Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => onSelectCity('All Destinations')}
            className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
              activeCity === 'All Destinations'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            All Destinations
          </button>
          {availableCities.map((city) => (
            <button
              key={city}
              onClick={() => onSelectCity(city)}
              className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                activeCity === city
                  ? 'bg-indigo-600 text-white shadow-sm scale-102'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {city}
            </button>
          ))}
        </div>

        {/* AI Query Box */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={`Ask AI: e.g. "Best sunset dinner near our stay in ${activeCity || 'Athens'}"`}
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateSuggestions()}
              className="w-full pl-3 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            {userPrompt && (
              <button
                onClick={() => setUserPrompt('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ×
              </button>
            )}
          </div>
          <button
            onClick={handleGenerateSuggestions}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-xs transition-all disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Searching...' : 'Suggest Places'}</span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto text-[11px] text-slate-600">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-2 py-1 rounded-lg font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All Categories
          </button>
          <button
            onClick={() => setSelectedCategory('saved')}
            className={`px-2 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
              selectedCategory === 'saved'
                ? 'bg-purple-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <BookmarkCheck className="w-3 h-3" /> Saved ({savedPlaces.length})
          </button>
          <button
            onClick={() => setSelectedCategory('food')}
            className={`px-2 py-1 rounded-lg font-medium transition-colors ${
              selectedCategory === 'food'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Dining & Wine
          </button>
          <button
            onClick={() => setSelectedCategory('sight')}
            className={`px-2 py-1 rounded-lg font-medium transition-colors ${
              selectedCategory === 'sight'
                ? 'bg-rose-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Sights & Landmarks
          </button>
          <button
            onClick={() => setSelectedCategory('culture')}
            className={`px-2 py-1 rounded-lg font-medium transition-colors ${
              selectedCategory === 'culture'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Culture & Art
          </button>
          <button
            onClick={() => setSelectedCategory('nature')}
            className={`px-2 py-1 rounded-lg font-medium transition-colors ${
              selectedCategory === 'nature'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Nature & Walks
          </button>
        </div>
      </div>

      {/* Places Scrollable Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Destination Highlight / City Intro Banner */}
        {citySummary && (
          <div className="p-3.5 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 border border-indigo-100/80 rounded-2xl">
            <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-indigo-900">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Insider Perspective on {activeCity}</span>
            </div>
            <p className="text-xs text-indigo-950 leading-relaxed">{citySummary}</p>
          </div>
        )}

        {/* Practical Local Tips */}
        {cityTips.length > 0 && (
          <div className="p-3 bg-amber-50/80 border border-amber-200/60 rounded-xl space-y-1">
            <h4 className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <span>💡 Local Concierge Advice for {activeCity}:</span>
            </h4>
            <ul className="text-[11px] text-amber-800 space-y-1 pl-3 list-disc">
              {cityTips.map((tip, idx) => (
                <li key={idx} className="leading-snug">{tip}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Place Cards */}
        {filteredPlaces.length === 0 ? (
          <div className="text-center py-10 px-4 bg-white rounded-2xl border border-slate-200/70">
            <Compass className="w-8 h-8 mx-auto text-indigo-300 mb-2" />
            <h4 className="text-sm font-bold text-slate-800">No places found for this category</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Click &quot;Suggest Places&quot; above to have Gemini and Google Maps scout out top restaurants, sights, and hidden gems!
            </p>
            <button
              onClick={handleGenerateSuggestions}
              disabled={isLoading}
              className="mt-3 px-3 py-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs transition-colors"
            >
              Generate Recommendations Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {filteredPlaces.map((place) => {
              const isSaved = place.isSaved || savedPlaces.some((sp) => sp.id === place.id || sp.name === place.name);

              return (
                <div
                  key={place.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Header line */}
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1 rounded-lg bg-slate-100 border border-slate-200/60">
                          {getCategoryIcon(place.category)}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {place.category}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-500">
                          • {place.city}
                        </span>
                      </div>

                      {/* Bookmark Toggle */}
                      <button
                        onClick={() => onToggleSavePlace(place)}
                        title={isSaved ? 'Remove from saved' : 'Save to trip itinerary'}
                        className={`p-1.5 rounded-lg border transition-all ${
                          isSaved
                            ? 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                            : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {isSaved ? (
                          <BookmarkCheck className="w-4 h-4 text-purple-600 fill-purple-600" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Name & Rating */}
                    <div className="flex items-baseline justify-between gap-2 mt-1">
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors leading-snug">
                        {place.name}
                      </h4>
                      {place.rating && (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 shrink-0">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                          <span>{place.rating}</span>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {place.description}
                    </p>

                    {/* Why Visit */}
                    {place.whyVisit && (
                      <div className="mt-2 text-xs text-indigo-900 bg-indigo-50/60 border border-indigo-100 p-2 rounded-xl">
                        <span className="font-semibold text-indigo-700">✨ Why Visit: </span>
                        {place.whyVisit}
                      </div>
                    )}

                    {/* Local Tip */}
                    {place.localTip && (
                      <div className="mt-2 text-xs text-amber-900 bg-amber-50/70 border border-amber-200/60 p-2 rounded-xl flex items-start gap-1.5">
                        <span className="text-amber-600 shrink-0">💡</span>
                        <div className="leading-relaxed">
                          <span className="font-semibold">Local Tip: </span>
                          {place.localTip}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {place.tags && place.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mt-2.5">
                        {place.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <button
                      onClick={() => onFocusPlaceOnMap(place)}
                      className="text-xs font-medium text-slate-600 hover:text-slate-900 flex items-center gap-1 bg-slate-100/80 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
                    >
                      <MapPin className="w-3 h-3 text-indigo-600" />
                      <span>Pin on Map</span>
                    </button>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        place.name + ' ' + (place.address || place.city)
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
                    >
                      <span>Directions</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
