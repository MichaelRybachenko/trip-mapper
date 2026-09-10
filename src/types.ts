export type StopType = 'flight' | 'stay' | 'transit' | 'car' | 'sight' | 'ferry' | 'activity';

export interface ItineraryStop {
  id: string;
  type: StopType;
  title: string;
  subtitle?: string;
  date: string;
  time?: string;
  endDate?: string;
  endTime?: string;
  city: string;
  country: string;
  address?: string;
  lat: number;
  lng: number;
  confirmationCode?: string;
  pin?: string;
  phone?: string;
  carrier?: string;
  flightNumber?: string;
  terminal?: string;
  layover?: string;
  notes?: string;
  houseRules?: string;
  categoryTag?: string;
}

export interface RouteLeg {
  id: string;
  fromStopId: string;
  toStopId: string;
  type: 'flight' | 'ferry' | 'drive' | 'train';
  fromCity: string;
  toCity: string;
  coordinates: [number, number][]; // [lat, lng]
  label?: string;
}

export interface SuggestedPlace {
  id: string;
  tripId?: string;
  city: string;
  name: string;
  category: 'food' | 'sight' | 'culture' | 'hidden_gem' | 'daytrip' | 'nature' | 'practical';
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  description: string;
  whyVisit: string;
  tags: string[];
  localTip?: string;
  estimatedTime?: string;
  isSaved?: boolean;
  groundingUri?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedActions?: string[];
}

export interface TripData {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  stops: ItineraryStop[];
  savedPlaces: SuggestedPlace[];
  rawItinerary?: string;
  notes?: string;
}

export interface UserProfile {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  isAnonymous: boolean;
}
