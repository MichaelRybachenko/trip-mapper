import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { ItineraryStop, SuggestedPlace } from '../types';
import { GoogleTripMap } from './GoogleTripMap';
import { 
  Maximize2,
  Map as MapIcon,
  Key,
  Layers
} from 'lucide-react';

interface TripMapProps {
  stops: ItineraryStop[];
  savedPlaces: SuggestedPlace[];
  selectedStopId?: string | null;
  onSelectStop?: (stop: ItineraryStop) => void;
  onExploreCity?: (city: string) => void;
  onSelectPlace?: (place: SuggestedPlace) => void;
}

export const TripMap: React.FC<TripMapProps> = ({
  stops,
  savedPlaces,
  selectedStopId,
  onSelectStop,
  onExploreCity,
  onSelectPlace,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const routesLayerRef = useRef<L.LayerGroup | null>(null);
  const placesLayerRef = useRef<L.LayerGroup | null>(null);

  // Check for Google Maps key in env or localStorage
  const [googleMapsKey, setGoogleMapsKey] = useState<string>(() => {
    return (
      (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) ||
      localStorage.getItem('trip_gmaps_key') ||
      ''
    );
  });

  const [mapEngine, setMapEngine] = useState<'google' | 'osm'>(() => {
    const savedEngine = localStorage.getItem('trip_map_engine');
    if (savedEngine === 'google' || savedEngine === 'osm') return savedEngine;
    return 'google';
  });

  const [showKeyInput, setShowKeyInput] = useState(false);
  const [keyDraft, setKeyDraft] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'stays' | 'transit' | 'places'>('all');
  const [mapReady, setMapReady] = useState(false);

  // Initialize Leaflet map if in OSM mode or while fallback
  useEffect(() => {
    if (mapEngine !== 'osm' && googleMapsKey) return;
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Centered around Mediterranean & Europe
    const map = L.map(mapContainerRef.current, {
      center: [41.9028, 12.4964],
      zoom: 5,
      zoomControl: false,
    });

    // Modern tile layer
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; OpenStreetMap',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    routesLayerRef.current = L.layerGroup().addTo(map);
    placesLayerRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;
    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      setMapReady(false);
    };
  }, [mapEngine, googleMapsKey]);

  // Update Leaflet markers when in OSM mode
  useEffect(() => {
    if (mapEngine !== 'osm' && googleMapsKey) return;
    const map = mapInstanceRef.current;
    if (!map || !mapReady) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((m: L.Marker) => m.remove());
    markersRef.current = {};

    if (routesLayerRef.current) routesLayerRef.current.clearLayers();
    if (placesLayerRef.current) placesLayerRef.current.clearLayers();

    const bounds = L.latLngBounds([]);

    // 1. Plot Stops
    stops.forEach((stop, index) => {
      if (typeof stop.lat !== 'number' || typeof stop.lng !== 'number') return;
      if (isNaN(stop.lat) || isNaN(stop.lng)) return;

      const isStay = stop.type === 'stay';
      const isTransit = stop.type === 'flight' || stop.type === 'ferry' || stop.type === 'transit' || stop.type === 'car';

      if (activeFilter === 'stays' && !isStay) return;
      if (activeFilter === 'transit' && !isTransit) return;

      const latLng = L.latLng(stop.lat, stop.lng);
      bounds.extend(latLng);

      let pinColor = '#4f46e5';
      let iconEmoji = '✈️';

      if (stop.type === 'stay') {
        pinColor = '#059669';
        iconEmoji = '🏡';
      } else if (stop.type === 'ferry') {
        pinColor = '#0284c7';
        iconEmoji = '🚢';
      } else if (stop.type === 'car') {
        pinColor = '#d97706';
        iconEmoji = '🚗';
      } else if (stop.type === 'sight') {
        pinColor = '#e11d48';
        iconEmoji = '🏛️';
      } else if (stop.type === 'transit') {
        pinColor = '#7c3aed';
        iconEmoji = '⏱️';
      }

      const isSelected = selectedStopId === stop.id;

      const customIcon = L.divIcon({
        className: 'custom-div-icon',
        html: `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: ${isSelected ? '38px' : '30px'};
            height: ${isSelected ? '38px' : '30px'};
            background-color: ${pinColor};
            border: 2.5px solid white;
            border-radius: 9999px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            font-size: ${isSelected ? '16px' : '13px'};
            cursor: pointer;
            transition: all 0.2s ease;
            position: relative;
          ">
            <span>${iconEmoji}</span>
            <div style="
              position: absolute;
              bottom: -5px;
              right: -5px;
              background: #0f172a;
              color: white;
              font-size: 10px;
              font-weight: 700;
              width: 16px;
              height: 16px;
              border-radius: 9999px;
              display: flex;
              align-items: center;
              justify-content: center;
              border: 1.5px solid white;
            ">${index + 1}</div>
          </div>
        `,
        iconSize: [isSelected ? 38 : 30, isSelected ? 38 : 30],
        iconAnchor: [isSelected ? 19 : 15, isSelected ? 19 : 15],
      });

      const marker = L.marker(latLng, { icon: customIcon });

      const popupContent = document.createElement('div');
      popupContent.className = 'p-3 text-slate-800 text-sm max-w-xs';
      popupContent.innerHTML = `
        <div class="flex items-center gap-1.5 mb-1">
          <span class="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white" style="background-color: ${pinColor}">
            ${stop.categoryTag || stop.type}
          </span>
          <span class="text-xs font-medium text-slate-500">${stop.date}</span>
        </div>
        <h4 class="font-bold text-base leading-snug text-slate-900 mb-0.5">${stop.title}</h4>
        ${stop.subtitle ? `<p class="text-xs text-slate-600 mb-1.5">${stop.subtitle}</p>` : ''}
        ${stop.time ? `<div class="text-xs font-semibold text-slate-700 mb-1">🕒 ${stop.time}${stop.endTime ? ` → ${stop.endTime}` : ''}</div>` : ''}
        ${stop.address ? `<div class="text-xs text-slate-500 mb-2 leading-relaxed">📍 ${stop.address}</div>` : ''}
        ${stop.pin ? `<div class="text-xs font-mono font-bold bg-amber-50 border border-amber-200 text-amber-800 px-2 py-1 rounded mb-2 inline-block">🔑 ${stop.pin}</div>` : ''}
        ${stop.notes ? `<p class="text-xs text-slate-600 italic bg-slate-50 p-1.5 rounded mb-2 border border-slate-100">${stop.notes}</p>` : ''}
        
        <div class="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 mt-2">
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((stop.address || stop.title) + ', ' + stop.city)}" 
             target="_blank" 
             rel="noreferrer" 
             class="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            Google Maps ↗
          </a>
          <button id="btn-explore-${stop.id}" class="text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md transition-colors flex items-center gap-1">
            ✨ Explore ${stop.city}
          </button>
        </div>
      `;

      const exploreBtn = popupContent.querySelector(`#btn-explore-${stop.id}`);
      if (exploreBtn) {
        exploreBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          if (onExploreCity) onExploreCity(stop.city);
        });
      }

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        if (onSelectStop) onSelectStop(stop);
      });

      marker.addTo(map);
      markersRef.current[stop.id] = marker;
    });

    // 2. Draw Routes
    if (routesLayerRef.current && stops.length > 1 && (activeFilter === 'all' || activeFilter === 'transit')) {
      for (let i = 0; i < stops.length - 1; i++) {
        const p1 = stops[i];
        const p2 = stops[i + 1];
        if (p1.lat && p1.lng && p2.lat && p2.lng) {
          const coords: [number, number][] = [
            [p1.lat, p1.lng],
            [p2.lat, p2.lng],
          ];

          const isFerry = p1.type === 'ferry' || p2.type === 'ferry';
          const isDrive = p1.type === 'car' || p2.type === 'car';
          const isFlight = p1.type === 'flight' || p2.type === 'flight';

          let strokeColor = '#6366f1';
          let dashArray = '6, 6';
          let weight = 2.5;

          if (isFerry) {
            strokeColor = '#0284c7';
            dashArray = '3, 6';
            weight = 3;
          } else if (isDrive) {
            strokeColor = '#f59e0b';
            dashArray = undefined;
            weight = 3.5;
          } else if (isFlight) {
            strokeColor = '#818cf8';
            dashArray = '8, 8';
            weight = 2;
          }

          const line = L.polyline(coords, {
            color: strokeColor,
            weight: weight,
            opacity: 0.75,
            dashArray: dashArray,
          });

          line.addTo(routesLayerRef.current);
        }
      }
    }

    // 3. Draw Places
    if (placesLayerRef.current && (activeFilter === 'all' || activeFilter === 'places')) {
      savedPlaces.forEach((place) => {
        if (!place.lat || !place.lng) return;
        const latLng = L.latLng(place.lat, place.lng);
        bounds.extend(latLng);

        const placeIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `
            <div style="
              display: flex;
              align-items: center;
              justify-content: center;
              width: 26px;
              height: 26px;
              background: #8b5cf6;
              border: 2px solid white;
              border-radius: 9999px;
              box-shadow: 0 3px 8px rgba(139, 92, 246, 0.4);
              font-size: 11px;
              cursor: pointer;
            ">
              <span>⭐</span>
            </div>
          `,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const placeMarker = L.marker(latLng, { icon: placeIcon });
        placeMarker.bindPopup(`
          <div class="p-3 text-slate-800 text-sm max-w-xs">
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
              ${place.category} • ${place.city}
            </span>
            <h4 class="font-bold text-sm text-slate-900 mt-1 mb-0.5">${place.name}</h4>
            <p class="text-xs text-slate-600 mb-1.5 leading-relaxed">${place.description}</p>
            ${place.localTip ? `<div class="text-xs bg-amber-50 border border-amber-100 p-1.5 rounded text-amber-900 mb-1.5">💡 <b>Local Tip:</b> ${place.localTip}</div>` : ''}
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + place.address)}" 
               target="_blank" 
               rel="noreferrer" 
               class="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1">
              Open in Google Maps ↗
            </a>
          </div>
        `);

        placeMarker.on('click', () => {
          if (onSelectPlace) onSelectPlace(place);
        });

        placeMarker.addTo(placesLayerRef.current);
      });
    }

    if (bounds.isValid() && stops.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [stops, savedPlaces, activeFilter, mapReady, mapEngine, googleMapsKey]);

  // Leaflet Pan to stop
  useEffect(() => {
    if (mapEngine !== 'osm' && googleMapsKey) return;
    const map = mapInstanceRef.current;
    if (!map || !selectedStopId) return;

    const stop = stops.find((s) => s.id === selectedStopId);
    if (stop && stop.lat && stop.lng) {
      map.flyTo([stop.lat, stop.lng], 13, { duration: 1.2 });
      const marker = markersRef.current[selectedStopId];
      if (marker) {
        setTimeout(() => {
          marker.openPopup();
        }, 500);
      }
    }
  }, [selectedStopId, stops, mapEngine, googleMapsKey]);

  const handleResetView = () => {
    if (mapInstanceRef.current) {
      const bounds = L.latLngBounds([]);
      stops.forEach((s) => {
        if (s.lat && s.lng) bounds.extend([s.lat, s.lng]);
      });
      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40] });
      }
    }
  };

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = keyDraft.trim();
    if (cleanKey) {
      setGoogleMapsKey(cleanKey);
      localStorage.setItem('trip_gmaps_key', cleanKey);
      setMapEngine('google');
      localStorage.setItem('trip_map_engine', 'google');
      setShowKeyInput(false);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm bg-slate-100 flex flex-col">
      {/* Map Filter & Controls Floating Header */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-md p-1.5 rounded-xl shadow-md border border-slate-200">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
            activeFilter === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All ({stops.length})
        </button>
        <button
          onClick={() => setActiveFilter('stays')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
            activeFilter === 'stays'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🏡</span> Stays ({stops.filter((s) => s.type === 'stay').length})
        </button>
        <button
          onClick={() => setActiveFilter('transit')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
            activeFilter === 'transit'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>✈️</span> Transit ({stops.filter((s) => s.type !== 'stay' && s.type !== 'sight').length})
        </button>
        <button
          onClick={() => setActiveFilter('places')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 ${
            activeFilter === 'places'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>⭐</span> Saved ({savedPlaces.length})
        </button>
      </div>

      {/* Top-Right Action Controls (Engine switch + Key configuration + Reset View) */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
        {/* Toggle between Google Maps & Classic Vector Map */}
        <div className="flex items-center bg-white/95 backdrop-blur-md p-0.5 rounded-xl shadow-md border border-slate-200 text-xs">
          <button
            onClick={() => {
              setMapEngine('google');
              localStorage.setItem('trip_map_engine', 'google');
              if (!googleMapsKey) {
                setShowKeyInput(true);
              }
            }}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all flex items-center gap-1 ${
              mapEngine === 'google'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MapIcon className="w-3.5 h-3.5" />
            <span>Google Maps</span>
          </button>
          <button
            onClick={() => {
              setMapEngine('osm');
              localStorage.setItem('trip_map_engine', 'osm');
            }}
            className={`px-2 py-1 rounded-lg font-medium transition-all ${
              mapEngine === 'osm'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            OSM
          </button>
        </div>

        {/* Configure Key button */}
        <button
          onClick={() => setShowKeyInput(!showKeyInput)}
          title="Google Maps API Key configuration"
          className={`p-1.5 rounded-xl shadow-md border backdrop-blur-md transition-all ${
            googleMapsKey
              ? 'bg-white/95 text-blue-600 border-slate-200 hover:bg-blue-50'
              : 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100'
          }`}
        >
          <Key className="w-4 h-4" />
        </button>

        {mapEngine === 'osm' && (
          <button
            onClick={handleResetView}
            title="Fit full trip route"
            className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 px-3 py-1.5 rounded-xl shadow-md border border-slate-200 text-xs font-semibold transition-all hover:scale-105"
          >
            <Maximize2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Fit All</span>
          </button>
        )}
      </div>

      {/* Google Maps API Key Modal / Banner Drawer */}
      {showKeyInput && (
        <div className="absolute top-14 right-3 z-[1100] w-80 bg-white/98 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-slate-200 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <MapIcon className="w-3.5 h-3.5 text-blue-600" />
              Google Maps Configuration
            </h4>
            <button
              onClick={() => setShowKeyInput(false)}
              className="text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          </div>
          <p className="text-[11px] text-slate-600 mb-3 leading-relaxed">
            Enter your Google Maps Platform key or free <a href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold underline">Maps Demo Key</a> for vector rendering, Advanced Markers, and Street View.
          </p>
          <form onSubmit={handleSaveKey} className="space-y-2">
            <input
              type="text"
              placeholder="AIzaSy..."
              value={keyDraft}
              onChange={(e) => setKeyDraft(e.target.value)}
              className="w-full text-xs px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-1.5 px-3 rounded-lg transition-colors"
              >
                Use Key
              </button>
              {googleMapsKey && (
                <button
                  type="button"
                  onClick={() => {
                    setGoogleMapsKey('');
                    localStorage.removeItem('trip_gmaps_key');
                    setKeyDraft('');
                  }}
                  className="text-xs text-rose-600 hover:text-rose-700 py-1.5 px-2 font-medium"
                >
                  Clear
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Main Map View Area */}
      {mapEngine === 'google' && googleMapsKey ? (
        <GoogleTripMap
          apiKey={googleMapsKey}
          stops={stops}
          savedPlaces={savedPlaces}
          selectedStopId={selectedStopId}
          activeFilter={activeFilter}
          onSelectStop={onSelectStop}
          onExploreCity={onExploreCity}
          onSelectPlace={onSelectPlace}
        />
      ) : mapEngine === 'google' && !googleMapsKey ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-slate-50 relative">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 mb-3 shadow-sm">
            <MapIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Google Maps Platform Ready
          </h3>
          <p className="text-xs text-slate-600 max-w-sm mb-4 leading-relaxed">
            Connect your Google Maps Platform API key or generate a free <a href="https://mapsplatform.google.com/maps-demo-key?utm_campaign=gmp_mcp_codeassist_v1_aistudio" target="_blank" rel="noreferrer" className="text-blue-600 font-semibold underline">Maps Demo Key</a> (no credit card or billing required).
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowKeyInput(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-4 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Enter API Key</span>
            </button>
            <button
              onClick={() => setMapEngine('osm')}
              className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-medium py-2 px-3 rounded-xl transition-all"
            >
              Use Carto/OSM Map
            </button>
          </div>
        </div>
      ) : (
        /* Leaflet Canvas */
        <div ref={mapContainerRef} className="w-full h-full z-0 flex-1" />
      )}

      {/* Subtle Legend Bar at bottom */}
      <div className="absolute bottom-2 left-3 z-[1000] hidden sm:flex items-center gap-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 shadow-sm">
        <span className="flex items-center gap-1 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block"></span> Flight</span>
        <span className="flex items-center gap-1 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span> Airbnb/Stay</span>
        <span className="flex items-center gap-1 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-sky-600 inline-block"></span> Ferry</span>
        <span className="flex items-center gap-1 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Car Rental</span>
        <span className="flex items-center gap-1 font-medium"><span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"></span> Saved Place</span>
      </div>
    </div>
  );
};
