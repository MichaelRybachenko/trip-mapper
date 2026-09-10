import React, { useState } from 'react';
import { RAW_TRIPIT_TEXT } from '../data/tripitData';
import { TripData, ItineraryStop } from '../types';
import { 
  FileText, 
  Sparkles, 
  X, 
  Upload, 
  Check, 
  AlertCircle,
  HelpCircle,
  Copy
} from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTripParsed: (parsedTrip: Partial<TripData>) => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onTripParsed,
}) => {
  const [text, setText] = useState<string>(RAW_TRIPIT_TEXT);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleParse = async () => {
    if (!text.trim()) {
      setError('Please paste itinerary or flight confirmation text first.');
      return;
    }

    setIsParsing(true);
    setError(null);

    try {
      const response = await fetch('/api/gemini/parse-itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawText: text }),
      });

      const json = await response.json();
      if (json.success && json.data) {
        const { stops, tripTitle, description, startDate, endDate } = json.data;
        onTripParsed({
          title: tripTitle || 'Vacation Itinerary',
          description: description || 'Parsed vacation trip',
          startDate: startDate || '',
          endDate: endDate || '',
          stops: stops || [],
          rawItinerary: text,
        });
        onClose();
      } else {
        setError(json.error || 'Failed to parse text. Please try again.');
      }
    } catch (err: any) {
      console.error('Itinerary parse error:', err);
      setError('Network error while analyzing itinerary text.');
    } finally {
      setIsParsing(false);
    }
  };

  const handleLoadUserTripIt = () => {
    setText(RAW_TRIPIT_TEXT);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-[2000] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 leading-tight">
                Import & Parse Itinerary
              </h3>
              <p className="text-xs text-slate-500">
                Paste any TripIt text, flight confirmations, or hotel bookings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Paste Raw Itinerary Data
            </label>
            <button
              type="button"
              onClick={handleLoadUserTripIt}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
            >
              <Copy className="w-3 h-3" />
              <span>Load User TripIt Sample</span>
            </button>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={12}
            placeholder="Paste your TripIt email, booking confirmation, flight details, Airbnb addresses, dates, and times here..."
            className="w-full font-mono text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all leading-relaxed"
          />

          {error && (
            <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200/80 p-3 rounded-2xl space-y-1 text-xs text-slate-600">
            <span className="font-semibold text-slate-800">What Gemini does automatically:</span>
            <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-slate-600">
              <li>Extracts flights, layovers, Airbnbs, ferry trips, and car rentals.</li>
              <li>Calculates GPS coordinates and pins every location to the world map.</li>
              <li>Preserves access codes (like PIN numbers), check-in/out times, and house rules.</li>
              <li>Generates curated local recommendations for each destination.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isParsing}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleParse}
            disabled={isParsing || !text.trim()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isParsing ? 'animate-spin' : ''}`} />
            <span>{isParsing ? 'Analyzing Itinerary...' : 'Parse & Map Trip'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
