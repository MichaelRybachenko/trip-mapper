import React, { useState, useEffect } from 'react';
import { TripData, ItineraryStop, SuggestedPlace, UserProfile } from './types';
import { DEFAULT_TRIP } from './data/tripitData';
import { Header } from './components/Header';
import { TripMap } from './components/TripMap';
import { TimelineView } from './components/TimelineView';
import { PlacesConcierge } from './components/PlacesConcierge';
import { ConciergeChat } from './components/ConciergeChat';
import { ImportModal } from './components/ImportModal';
import { auth, saveTripToCloud, savePlaceToCloud } from './lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  Calendar, 
  MapPin, 
  Sparkles, 
  MessageSquare, 
  Map as MapIcon, 
  List, 
  ChevronLeft, 
  ChevronRight,
  Info
} from 'lucide-react';

export default function App() {
  const [trip, setTrip] = useState<TripData>(() => {
    const saved = localStorage.getItem('active_trip');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.warn('Failed to parse cached trip:', e);
      }
    }
    return DEFAULT_TRIP;
  });

  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'timeline' | 'places' | 'chat'>('timeline');
  const [activeCity, setActiveCity] = useState<string>('Piraeus / Athens');
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [mobileView, setMobileView] = useState<'map' | 'panel'>('panel');

  // Firebase auth state subscription
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          isAnonymous: firebaseUser.isAnonymous,
        });
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // Save changes to localStorage & Cloud Firestore
  useEffect(() => {
    localStorage.setItem('active_trip', JSON.stringify(trip));
    if (user) {
      setIsSaving(true);
      const timer = setTimeout(() => {
        saveTripToCloud(trip, user.uid).finally(() => {
          setIsSaving(false);
        });
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [trip, user]);

  // Handle stop selection
  const handleSelectStop = (stop: ItineraryStop) => {
    setSelectedStopId(stop.id);
    if (stop.city) {
      setActiveCity(stop.city);
    }
  };

  // Switch to Places Concierge for a given city
  const handleExploreCity = (city: string) => {
    setActiveCity(city);
    setActiveTab('places');
    setMobileView('panel');
  };

  // Toggle save place
  const handleToggleSavePlace = async (place: SuggestedPlace) => {
    setTrip((prev) => {
      const exists = prev.savedPlaces.some((p) => p.id === place.id || p.name === place.name);
      let updatedSavedPlaces: SuggestedPlace[];

      if (exists) {
        updatedSavedPlaces = prev.savedPlaces.filter(
          (p) => p.id !== place.id && p.name !== place.name
        );
      } else {
        updatedSavedPlaces = [...prev.savedPlaces, { ...place, isSaved: true }];
      }

      return {
        ...prev,
        savedPlaces: updatedSavedPlaces,
      };
    });

    if (user) {
      savePlaceToCloud(trip.id, place, user.uid);
    }
  };

  // Focus place on map
  const handleFocusPlaceOnMap = (place: SuggestedPlace) => {
    if (place.lat && place.lng) {
      // Find closest stop or set city
      setActiveCity(place.city);
      setMobileView('map');
    }
  };

  // Custom place add
  const handleAddCustomPlace = (newPlace: SuggestedPlace) => {
    setTrip((prev) => ({
      ...prev,
      savedPlaces: [...prev.savedPlaces, newPlace],
    }));
  };

  // Update trip after import
  const handleTripParsed = (parsed: Partial<TripData>) => {
    setTrip((prev) => ({
      ...prev,
      ...parsed,
      id: `trip-${Date.now()}`,
    }));
    if (parsed.stops && parsed.stops.length > 0) {
      setSelectedStopId(parsed.stops[0].id);
      if (parsed.stops[0].city) {
        setActiveCity(parsed.stops[0].city);
      }
    }
    setActiveTab('timeline');
  };

  // Reset to default
  const handleResetTrip = () => {
    setTrip(DEFAULT_TRIP);
    setSelectedStopId(null);
    setActiveCity('Piraeus / Athens');
    setActiveTab('timeline');
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 text-slate-800">
      {/* Top Application Navigation */}
      <Header
        trip={trip}
        user={user}
        isSaving={isSaving}
        onOpenImport={() => setIsImportModalOpen(true)}
        onResetTrip={handleResetTrip}
      />

      {/* Main Workspace (Split Desktop / Tabbed Mobile) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Side: Interactive Panels (Timeline, Vacation Concierge, AI Chat) */}
        <div
          className={`w-full md:w-[460px] lg:w-[520px] shrink-0 bg-white border-r border-slate-200 flex flex-col h-full z-10 transition-all ${
            mobileView === 'map' ? 'hidden md:flex' : 'flex'
          }`}
        >
          {/* Panel Tab Navigation */}
          <div className="flex items-center border-b border-slate-200 bg-slate-50/70 p-1.5 gap-1 shrink-0">
            <button
              onClick={() => setActiveTab('timeline')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'timeline'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Itinerary Timeline ({trip.stops.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('places')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'places'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Suggestions & Places</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'chat'
                  ? 'bg-white text-indigo-700 shadow-xs border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-purple-600" />
              <span>AI Concierge</span>
            </button>
          </div>

          {/* Active Panel Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'timeline' && (
              <TimelineView
                stops={trip.stops}
                selectedStopId={selectedStopId}
                onSelectStop={handleSelectStop}
                onExploreCity={handleExploreCity}
              />
            )}

            {activeTab === 'places' && (
              <PlacesConcierge
                stops={trip.stops}
                savedPlaces={trip.savedPlaces}
                activeCity={activeCity}
                onSelectCity={(city) => setActiveCity(city)}
                onToggleSavePlace={handleToggleSavePlace}
                onFocusPlaceOnMap={handleFocusPlaceOnMap}
                onAddCustomPlace={handleAddCustomPlace}
              />
            )}

            {activeTab === 'chat' && <ConciergeChat trip={trip} />}
          </div>
        </div>

        {/* Right Side: Interactive Leaflet Map */}
        <div
          className={`flex-1 h-full relative overflow-hidden bg-slate-100 ${
            mobileView === 'panel' ? 'hidden md:block' : 'block'
          }`}
        >
          <TripMap
            stops={trip.stops}
            savedPlaces={trip.savedPlaces}
            selectedStopId={selectedStopId}
            onSelectStop={handleSelectStop}
            onExploreCity={handleExploreCity}
            onSelectPlace={handleFocusPlaceOnMap}
          />
        </div>
      </div>

      {/* Mobile Sticky View Switcher (Map vs Details) */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-[1500] bg-slate-900/90 backdrop-blur-md text-white px-2 py-1.5 rounded-2xl shadow-xl flex items-center gap-1 border border-slate-700">
        <button
          onClick={() => setMobileView('panel')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
            mobileView === 'panel' ? 'bg-indigo-600 text-white' : 'text-slate-300'
          }`}
        >
          <List className="w-3.5 h-3.5" />
          <span>Trip Details</span>
        </button>
        <button
          onClick={() => setMobileView('map')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
            mobileView === 'map' ? 'bg-indigo-600 text-white' : 'text-slate-300'
          }`}
        >
          <MapIcon className="w-3.5 h-3.5" />
          <span>Interactive Map</span>
        </button>
      </div>

      {/* Import / Paste Modal */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onTripParsed={handleTripParsed}
      />
    </div>
  );
}
