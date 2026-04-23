import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Auth from "./components/Auth";
import Home from "./components/Home";
import CreateRide from "./components/CreateRide";
import SearchRide from "./components/SearchRide";
import RideRequests from "./components/RideRequests";
import RideStatus from "./components/RideStatus";
import Profile from "./components/Profile";
import { useEffect, useState } from "react";
import { auth, db } from "./firebase";
import { doc, getDoc } from "firebase/firestore";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileComplete, setProfileComplete] = useState(false);

  const checkProfile = async (u) => {
    const snap = await getDoc(doc(db, "profiles", u.uid));
    if (
      snap.exists() &&
      snap.data().name &&
      snap.data().phone &&
      snap.data().gender &&
      snap.data().college &&
      snap.data().regNo
    ) {
      setProfileComplete(true);
    } else {
      setProfileComplete(false);
    }
  };

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      setUser(u);
      if (u) await checkProfile(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🚖</div>
          <p className="text-gray-400 animate-pulse text-sm tracking-wide">
            Loading CabShare...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Toaster />

      {/* NAVBAR */}
      {user && (
        <nav className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-50">
          <div className="flex items-center gap-2">
            <span className="text-xl">🚖</span>
            <span className="text-lg font-bold text-black tracking-tight">
              CabShare
            </span>
          </div>
          <button
            onClick={() => auth.signOut()}
            className="text-sm text-gray-600 hover:text-black border border-gray-300 hover:border-gray-800 px-4 py-1.5 rounded-full transition font-medium"
          >
            Logout
          </button>
        </nav>
      )}

      <Routes>
        {!user && (
          <Route path="*" element={<Auth />} />
        )}

        {user && !profileComplete && (
          <>
            <Route
              path="/profile"
              element={<Profile onProfileSaved={() => checkProfile(user)} />}
            />
            <Route path="*" element={<Navigate to="/profile" />} />
          </>
        )}

        {user && profileComplete && (
          <>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/create-ride" element={<CreateRide />} />
            <Route path="/search-ride" element={<SearchRide />} />
            <Route path="/requests" element={<RideRequests />} />
            <Route path="/status" element={<RideStatus />} />
            <Route
              path="/profile"
              element={<Profile onProfileSaved={() => checkProfile(user)} />}
            />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;