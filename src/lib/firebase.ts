import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInAnonymously,
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { TripData, SuggestedPlace } from '../types';

// Initialize Firebase SDK
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Provisioned named database or default
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

/**
 * Sign in with Google Popup
 */
export async function loginWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.warn('Google sign-in popup failed, falling back to guest mode', error);
    // Allow fallback to anonymous sign in so user is always authenticated
    const anon = await signInAnonymously(auth);
    return anon.user;
  }
}

/**
 * Sign in as Guest (Anonymous Firebase Auth)
 */
export async function loginAsGuest(): Promise<User | null> {
  try {
    const res = await signInAnonymously(auth);
    return res.user;
  } catch (error) {
    console.error('Anonymous sign-in error:', error);
    return null;
  }
}

/**
 * Log out
 */
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

/**
 * Save or update trip in Firestore with offline localStorage safety
 */
export async function saveTripToCloud(trip: TripData, userId?: string): Promise<boolean> {
  try {
    // Always backup to local storage first
    localStorage.setItem(`trip_${trip.id}`, JSON.stringify(trip));

    if (!userId && auth.currentUser) {
      userId = auth.currentUser.uid;
    }

    if (userId) {
      const tripRef = doc(db, 'trips', trip.id);
      await setDoc(tripRef, {
        id: trip.id,
        userId: userId,
        title: trip.title,
        description: trip.description,
        startDate: trip.startDate,
        endDate: trip.endDate,
        rawItinerary: trip.rawItinerary || '',
        stops: JSON.stringify(trip.stops),
        savedPlaces: JSON.stringify(trip.savedPlaces),
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Could not sync trip to Firestore, saved locally:', err);
    return false;
  }
}

/**
 * Save a place to Firestore
 */
export async function savePlaceToCloud(tripId: string, place: SuggestedPlace, userId?: string): Promise<boolean> {
  try {
    if (!userId && auth.currentUser) {
      userId = auth.currentUser.uid;
    }
    if (userId) {
      const placeRef = doc(db, 'trips', tripId, 'savedPlaces', place.id);
      await setDoc(placeRef, {
        ...place,
        userId,
        tripId,
        createdAt: new Date().toISOString()
      }, { merge: true });
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Error saving place to Firestore:', err);
    return false;
  }
}
