import React, { useState } from 'react';
import { TripData, UserProfile } from '../types';
import { 
  Compass, 
  Sparkles, 
  Upload, 
  Cloud, 
  CloudCheck, 
  LogIn, 
  LogOut, 
  User, 
  Calendar, 
  MapPin, 
  Share2,
  Check
} from 'lucide-react';
import { loginWithGoogle, loginAsGuest, logoutUser } from '../lib/firebase';

interface HeaderProps {
  trip: TripData;
  user: UserProfile | null;
  isSaving: boolean;
  onOpenImport: () => void;
  onResetTrip: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  trip,
  user,
  isSaving,
  onOpenImport,
  onResetTrip,
}) => {
  const [showShareNotification, setShowShareNotification] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Compute stats
  const totalStops = trip.stops.length;
  const staysCount = trip.stops.filter((s) => s.type === 'stay').length;
  const uniqueCountries = Array.from(new Set(trip.stops.map((s) => s.country))).length;

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setShowShareNotification(true);
      setTimeout(() => setShowShareNotification(false), 2500);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      await loginWithGoogle();
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setAuthLoading(true);
    try {
      await loginAsGuest();
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200/80 px-4 py-3 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* App Branding & Trip Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-700 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                Trip Mapper & Vacation Planner
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold bg-indigo-50 border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                Gemini & Maps Grounded
              </span>
            </div>
            <p className="text-xs text-slate-500 line-clamp-1">
              <span className="font-semibold text-slate-700">{trip.title}</span> • {trip.startDate} – {trip.endDate} • {totalStops} stops across {uniqueCountries} countries
            </p>
          </div>
        </div>

        {/* Action Controls & Firebase Status */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Cloud Sync Status */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-600">
            <Cloud className={`w-3.5 h-3.5 ${isSaving ? 'animate-pulse text-indigo-600' : 'text-emerald-600'}`} />
            <span className="hidden sm:inline">{isSaving ? 'Syncing...' : 'Cloud Synced'}</span>
          </div>

          {/* Import / Paste Button */}
          <button
            onClick={onOpenImport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all hover:scale-102"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-600" />
            <span>Import TripIt</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-1.5 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-1"
            title="Copy share link"
          >
            {showShareNotification ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline text-emerald-700">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </>
            )}
          </button>

          {/* Auth Button / Profile */}
          {user ? (
            <div className="flex items-center gap-2 pl-1 border-l border-slate-200">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'User'}
                  className="w-7 h-7 rounded-full border border-slate-200 object-cover"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <span className="text-xs font-semibold text-slate-700 hidden lg:inline">
                {user.displayName || (user.isAnonymous ? 'Guest Traveler' : user.email?.split('@')[0])}
              </span>
              <button
                onClick={() => logoutUser()}
                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                title="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
              <button
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-xs transition-colors"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign in</span>
              </button>
              <button
                onClick={handleGuestSignIn}
                disabled={authLoading}
                className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium transition-colors"
              >
                Guest
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
