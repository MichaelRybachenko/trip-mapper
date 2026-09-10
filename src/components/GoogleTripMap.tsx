import React, { useEffect, useState, useMemo } from 'react';
import {
  APIProvider,
  Map as GoogleMap,
  AdvancedMarker,
  InfoWindow,
  useMap
} from '@vis.gl/react-google-maps';
import { ItineraryStop, SuggestedPlace } from '../types';
import { Maximize2, ExternalLink } from 'lucide-react';

interface GoogleTripMapProps {
  apiKey: string;
  stops: ItineraryStop[];
  savedPlaces: SuggestedPlace[];
  selectedStopId?: string | null;
  activeFilter: 'all' | 'stays' | 'transit' | 'places';
  onSelectStop?: (stop: ItineraryStop) => void;
  onExploreCity?: (city: string) => void;
  onSelectPlace?: (place: SuggestedPlace) => void;
}

// Sub-component to manage map bounds, center flyTo, and route lines
const MapController: React.FC<{
  stops: ItineraryStop[];
  savedPlaces: SuggestedPlace[];
  selectedStopId?: string | null;
  activeFilter: string;
}> = ({ stops, savedPlaces, selectedStopId, activeFilter }) => {
  const map = useMap();

  // Fit bounds when stops change
  useEffect(() => {
    if (!map || stops.length === 0) return;

    if (window.google && window.google.maps) {
      const bounds = new window.google.maps.LatLngBounds();
      let hasValidCoords = false;

      stops.forEach((s) => {
        if (typeof s.lat === 'number' && typeof s.lng === 'number' && !isNaN(s.lat) && !isNaN(s.lng)) {
          bounds.extend({ lat: s.lat, lng: s.lng });
          hasValidCoords = true;
        }
      });

      if (activeFilter === 'all' || activeFilter === 'places') {
        savedPlaces.forEach((p) => {
          if (typeof p.lat === 'number' && typeof p.lng === 'number') {
            bounds.extend({ lat: p.lat, lng: p.lng });
            hasValidCoords = true;
          }
        });
      }

      if (hasValidCoords) {
        map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
      }
    }
  }, [map, stops, savedPlaces, activeFilter]);

  // Pan to selected stop
  useEffect(() => {
    if (!map || !selectedStopId) return;
    const stop = stops.find((s) => s.id === selectedStopId);
    if (stop && typeof stop.lat === 'number' && typeof stop.lng === 'number') {
      map.panTo({ lat: stop.lat, lng: stop.lng });
      map.setZoom(13);
    }
  }, [map, selectedStopId, stops]);

  // Render Polylines for trip routes using google.maps.Polyline
  useEffect(() => {
    if (!map || !window.google || !window.google.maps || stops.length < 2) return;
    if (activeFilter !== 'all' && activeFilter !== 'transit') return;

    const polylines: google.maps.Polyline[] = [];

    for (let i = 0; i < stops.length - 1; i++) {
      const p1 = stops[i];
      const p2 = stops[i + 1];
      if (p1.lat && p1.lng && p2.lat && p2.lng) {
        const isFerry = p1.type === 'ferry' || p2.type === 'ferry';
        const isDrive = p1.type === 'car' || p2.type === 'car';
        const isFlight = p1.type === 'flight' || p2.type === 'flight';

        let strokeColor = '#6366f1';
        let strokeOpacity = 0.8;
        let strokeWeight = 3;
        let icons: google.maps.IconSequence[] | undefined = undefined;

        if (isFerry) {
          strokeColor = '#0284c7';
          strokeWeight = 3;
          icons = [{
            icon: {
              path: 'M 0,-1 0,1',
              strokeOpacity: 1,
              scale: 3,
            },
            offset: '0',
            repeat: '12px'
          }];
          strokeOpacity = 0;
        } else if (isDrive) {
          strokeColor = '#f59e0b';
          strokeWeight = 4;
          strokeOpacity = 0.9;
        } else if (isFlight) {
          strokeColor = '#818cf8';
          strokeWeight = 2;
          icons = [{
            icon: {
              path: 'M 0,-1 0,1',
              strokeOpacity: 1,
              scale: 2,
            },
            offset: '0',
            repeat: '16px'
          }];
          strokeOpacity = 0;
        }

        const poly = new window.google.maps.Polyline({
          path: [
            { lat: p1.lat, lng: p1.lng },
            { lat: p2.lat, lng: p2.lng },
          ],
          geodesic: isFlight,
          strokeColor,
          strokeOpacity,
          strokeWeight,
          icons,
          map,
        });

        polylines.push(poly);
      }
    }

    return () => {
      polylines.forEach((p) => p.setMap(null));
    };
  }, [map, stops, activeFilter]);

  return null;
};

export const GoogleTripMap: React.FC<GoogleTripMapProps> = ({
  apiKey,
  stops,
  savedPlaces,
  selectedStopId,
  activeFilter,
  onSelectStop,
  onExploreCity,
  onSelectPlace,
}) => {
  const [selectedPin, setSelectedPin] = useState<{
    type: 'stop' | 'place';
    data: ItineraryStop | SuggestedPlace;
  } | null>(null);

  // Filter stops based on active tab
  const visibleStops = useMemo(() => {
    return stops.filter((stop) => {
      if (typeof stop.lat !== 'number' || typeof stop.lng !== 'number') return false;
      if (activeFilter === 'stays') return stop.type === 'stay';
      if (activeFilter === 'transit') return stop.type !== 'stay' && stop.type !== 'sight';
      if (activeFilter === 'places') return false;
      return true;
    });
  }, [stops, activeFilter]);

  // Filter saved places
  const visiblePlaces = useMemo(() => {
    if (activeFilter === 'stays' || activeFilter === 'transit') return [];
    return savedPlaces.filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number');
  }, [savedPlaces, activeFilter]);

  // Close info window when selected stop changes externally
  useEffect(() => {
    if (selectedStopId) {
      const match = stops.find((s) => s.id === selectedStopId);
      if (match) {
        setSelectedPin({ type: 'stop', data: match });
      }
    }
  }, [selectedStopId, stops]);

  return (
    <div className="w-full h-full relative" style={{ minHeight: '420px', height: '100%' }}>
      <APIProvider
        apiKey={apiKey}
        libraries={['places', 'geometry']}
        language="en"
      >
        <GoogleMap
          id="google-trip-map-instance"
          style={{ width: '100%', height: '100%' }}
          defaultCenter={{ lat: 41.9028, lng: 12.4964 }}
          defaultZoom={5}
          mapId="DEMO_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeControl={false}
          streetViewControl={true}
          fullscreenControl={false}
        >
          <MapController
            stops={stops}
            savedPlaces={savedPlaces}
            selectedStopId={selectedStopId}
            activeFilter={activeFilter}
          />

          {/* Advanced Markers for Stops */}
          {visibleStops.map((stop, index) => {
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

            return (
              <AdvancedMarker
                key={stop.id}
                position={{ lat: stop.lat!, lng: stop.lng! }}
                title={stop.title}
                onClick={() => {
                  setSelectedPin({ type: 'stop', data: stop });
                  if (onSelectStop) onSelectStop(stop);
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: isSelected ? '38px' : '32px',
                    height: isSelected ? '38px' : '32px',
                    backgroundColor: pinColor,
                    border: '2.5px solid white',
                    borderRadius: '9999px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
                    fontSize: isSelected ? '16px' : '13px',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span>{iconEmoji}</span>
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      right: '-4px',
                      background: '#0f172a',
                      color: 'white',
                      fontSize: '10px',
                      fontWeight: 700,
                      width: '16px',
                      height: '16px',
                      borderRadius: '9999px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1.5px solid white',
                    }}
                  >
                    {index + 1}
                  </div>
                </div>
              </AdvancedMarker>
            );
          })}

          {/* Advanced Markers for Saved Places */}
          {visiblePlaces.map((place) => (
            <AdvancedMarker
              key={place.id}
              position={{ lat: place.lat!, lng: place.lng! }}
              title={place.name}
              onClick={() => {
                setSelectedPin({ type: 'place', data: place });
                if (onSelectPlace) onSelectPlace(place);
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '28px',
                  height: '28px',
                  backgroundColor: '#8b5cf6',
                  border: '2px solid white',
                  borderRadius: '9999px',
                  boxShadow: '0 3px 10px rgba(139, 92, 246, 0.45)',
                  fontSize: '12px',
                  cursor: 'pointer',
                }}
              >
                <span>⭐</span>
              </div>
            </AdvancedMarker>
          ))}

          {/* Info Window for Selected Stop */}
          {selectedPin && selectedPin.type === 'stop' && (
            <InfoWindow
              position={{
                lat: (selectedPin.data as ItineraryStop).lat!,
                lng: (selectedPin.data as ItineraryStop).lng!,
              }}
              onCloseClick={() => setSelectedPin(null)}
            >
              {(() => {
                const stop = selectedPin.data as ItineraryStop;
                return (
                  <div className="p-1 text-slate-800 text-sm max-w-xs">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
                        {stop.categoryTag || stop.type}
                      </span>
                      <span className="text-xs font-medium text-slate-500">{stop.date}</span>
                    </div>
                    <h4 className="font-bold text-sm leading-snug text-slate-900 mb-0.5">{stop.title}</h4>
                    {stop.subtitle && <p className="text-xs text-slate-600 mb-1">{stop.subtitle}</p>}
                    {stop.time && (
                      <div className="text-xs font-semibold text-slate-700 mb-1">
                        🕒 {stop.time}{stop.endTime ? ` → ${stop.endTime}` : ''}
                      </div>
                    )}
                    {stop.address && <div className="text-xs text-slate-500 mb-2 leading-relaxed">📍 {stop.address}</div>}
                    {stop.pin && (
                      <div className="text-xs font-mono font-bold bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 rounded mb-2 inline-block">
                        🔑 {stop.pin}
                      </div>
                    )}
                    {stop.notes && (
                      <p className="text-xs text-slate-600 italic bg-slate-50 p-1.5 rounded mb-2 border border-slate-100">
                        {stop.notes}
                      </p>
                    )}

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 mt-1">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((stop.address || stop.title) + ', ' + stop.city)}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                      >
                        Google Maps <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={() => {
                          if (onExploreCity) onExploreCity(stop.city);
                        }}
                        className="text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md transition-colors"
                      >
                        ✨ Explore {stop.city}
                      </button>
                    </div>
                  </div>
                );
              })()}
            </InfoWindow>
          )}

          {/* Info Window for Selected Place */}
          {selectedPin && selectedPin.type === 'place' && (
            <InfoWindow
              position={{
                lat: (selectedPin.data as SuggestedPlace).lat!,
                lng: (selectedPin.data as SuggestedPlace).lng!,
              }}
              onCloseClick={() => setSelectedPin(null)}
            >
              {(() => {
                const place = selectedPin.data as SuggestedPlace;
                return (
                  <div className="p-1 text-slate-800 text-sm max-w-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      {place.category} • {place.city}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900 mt-1 mb-0.5">{place.name}</h4>
                    <p className="text-xs text-slate-600 mb-1.5 leading-relaxed">{place.description}</p>
                    {place.localTip && (
                      <div className="text-xs bg-amber-50 border border-amber-100 p-1.5 rounded text-amber-900 mb-1.5">
                        💡 <b>Tip:</b> {place.localTip}
                      </div>
                    )}
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.name + ' ' + (place.address || place.city))}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 mt-1"
                    >
                      Open in Google Maps <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                );
              })()}
            </InfoWindow>
          )}
        </GoogleMap>
      </APIProvider>
    </div>
  );
};
