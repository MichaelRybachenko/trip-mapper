import React, { useState } from 'react';
import { ItineraryStop, SuggestedPlace } from '../types';
import { 
  Plane, 
  Home, 
  Car, 
  Ship, 
  Landmark, 
  Clock, 
  MapPin, 
  Key, 
  Phone, 
  Sparkles, 
  ChevronRight, 
  ExternalLink,
  Copy,
  Check,
  Search,
  Filter
} from 'lucide-react';

interface TimelineViewProps {
  stops: ItineraryStop[];
  selectedStopId?: string | null;
  onSelectStop: (stop: ItineraryStop) => void;
  onExploreCity: (city: string) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({
  stops,
  selectedStopId,
  onSelectStop,
  onExploreCity,
}) => {
  const [copiedPin, setCopiedPin] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPin(id);
    setTimeout(() => setCopiedPin(null), 2000);
  };

  const filteredStops = stops.filter((stop) => {
    const matchesSearch =
      stop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stop.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (stop.address && stop.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (stop.notes && stop.notes.toLowerCase().includes(searchTerm.toLowerCase()));

    if (typeFilter === 'all') return matchesSearch;
    if (typeFilter === 'stay') return matchesSearch && stop.type === 'stay';
    if (typeFilter === 'flight') return matchesSearch && stop.type === 'flight';
    if (typeFilter === 'car') return matchesSearch && stop.type === 'car';
    if (typeFilter === 'ferry') return matchesSearch && stop.type === 'ferry';
    return matchesSearch;
  });

  const getStopIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return <Plane className="w-4 h-4 text-indigo-600" />;
      case 'stay':
        return <Home className="w-4 h-4 text-emerald-600" />;
      case 'ferry':
        return <Ship className="w-4 h-4 text-sky-600" />;
      case 'car':
        return <Car className="w-4 h-4 text-amber-600" />;
      case 'sight':
        return <Landmark className="w-4 h-4 text-rose-600" />;
      default:
        return <Clock className="w-4 h-4 text-violet-600" />;
    }
  };

  const getBadgeStyle = (type: string) => {
    switch (type) {
      case 'flight':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'stay':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'ferry':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      case 'car':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'sight':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-violet-50 text-violet-700 border-violet-200';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search & Filter Bar */}
      <div className="p-3.5 border-b border-slate-200 bg-white/70 backdrop-blur-sm sticky top-0 z-10 space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search stops, addresses, cities, flights..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs text-slate-600">
          <button
            onClick={() => setTypeFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
              typeFilter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            All Stops ({stops.length})
          </button>
          <button
            onClick={() => setTypeFilter('stay')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
              typeFilter === 'stay'
                ? 'bg-emerald-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Stays ({stops.filter((s) => s.type === 'stay').length})
          </button>
          <button
            onClick={() => setTypeFilter('flight')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
              typeFilter === 'flight'
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Flights ({stops.filter((s) => s.type === 'flight').length})
          </button>
          <button
            onClick={() => setTypeFilter('car')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
              typeFilter === 'car'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Car & Road ({stops.filter((s) => s.type === 'car').length})
          </button>
          <button
            onClick={() => setTypeFilter('ferry')}
            className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
              typeFilter === 'ferry'
                ? 'bg-sky-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            Ferry
          </button>
        </div>
      </div>

      {/* Timeline List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {filteredStops.length === 0 ? (
          <div className="text-center py-12 px-4">
            <p className="text-sm font-semibold text-slate-700">No stops match your filter</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the search keyword or category.</p>
          </div>
        ) : (
          filteredStops.map((stop, index) => {
            const isSelected = selectedStopId === stop.id;

            return (
              <div
                key={stop.id}
                id={`timeline-${stop.id}`}
                onClick={() => onSelectStop(stop)}
                className={`relative group rounded-2xl p-4 transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-indigo-50/70 border-indigo-400 shadow-md ring-2 ring-indigo-500/20'
                    : 'bg-white hover:bg-slate-50/90 border-slate-200/80 shadow-xs hover:border-slate-300'
                }`}
              >
                {/* Header line */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded-xl bg-slate-100 border border-slate-200 shadow-xs">
                      {getStopIcon(stop.type)}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${getBadgeStyle(
                        stop.type
                      )}`}
                    >
                      {stop.categoryTag || stop.type}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100/90 px-2 py-0.5 rounded-md">
                    {stop.date}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h3 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-indigo-600 transition-colors">
                  {stop.title}
                </h3>
                {stop.subtitle && (
                  <p className="text-xs font-medium text-slate-600 mt-0.5 leading-relaxed">
                    {stop.subtitle}
                  </p>
                )}

                {/* Time & City Badges */}
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 mt-2">
                  {stop.time && (
                    <span className="flex items-center gap-1 font-medium bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {stop.time}
                      {stop.endTime ? ` → ${stop.endTime}` : ''}
                    </span>
                  )}
                  <span className="flex items-center gap-1 font-medium bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-md">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {stop.city}, {stop.country}
                  </span>
                </div>

                {/* Address */}
                {stop.address && (
                  <div className="text-xs text-slate-500 mt-2 flex items-start gap-1 leading-relaxed">
                    <span className="text-slate-400 shrink-0">📍</span>
                    <span className="line-clamp-2">{stop.address}</span>
                  </div>
                )}

                {/* PIN Code / Access Key Badge */}
                {stop.pin && (
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-lg text-xs font-mono font-bold">
                      <Key className="w-3 h-3 text-amber-600" />
                      <span>{stop.pin}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(stop.pin || '', stop.id);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 bg-white border border-slate-200 rounded-md transition-colors"
                      title="Copy access PIN code"
                    >
                      {copiedPin === stop.id ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}

                {/* Phone Contact */}
                {stop.phone && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-slate-600">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span className="font-mono">{stop.phone}</span>
                  </div>
                )}

                {/* House rules or special notes */}
                {stop.houseRules && (
                  <div className="mt-2 text-[11px] text-amber-800 bg-amber-50/70 border border-amber-200/60 p-2 rounded-lg leading-relaxed">
                    <span className="font-semibold">House Rules:</span> {stop.houseRules}
                  </div>
                )}

                {stop.notes && (
                  <p className="mt-2 text-xs text-slate-600 italic bg-slate-50/80 p-2 rounded-lg border border-slate-200/60 leading-relaxed">
                    {stop.notes}
                  </p>
                )}

                {/* Quick Action Footer */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      (stop.address || stop.title) + ', ' + stop.city
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onExploreCity(stop.city);
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50/80 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Explore {stop.city}</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
