import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import Auth from "./components/Auth";
import Home from "./components/Home";
import CreateRide from "./components/CreateRide";
import SearchRide from "./components/SearchRide";
import RideRequests from "./components/RideRequests";
import RideStatus from "./components/RideStatus";
import { useEffect, useState } from "react";
import { auth } from "./firebase";
import Profile from "./components/Profile";



function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🔄 LOADER SCREEN (better UX)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p className="text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">

      {/* 🔥 TOAST (GLOBAL) */}
      <Toaster position="top-center" />

      {/* 🔥 HEADER */}
      {user && (
        <div className="flex justify-between items-center mb-6">

          <h2 className="text-xl font-bold">🚖 CabShare</h2>

          <div className="flex items-center gap-3">
            <p className="text-sm text-gray-300">
              {user.displayName || user.email}
            </p>

            <button
              onClick={() => {
                auth.signOut();
              }}
              className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-lg transition"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* 🔀 ROUTES */}
      <Routes>
        {!user ? (
          <>
            <Route path="*" element={<Auth />} />
          </>
        ) : (
          <>
          <Route path="/profile" element={<Profile />} />
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/create-ride" element={<CreateRide />} />
            <Route path="/search-ride" element={<SearchRide />} />
            <Route path="/requests" element={<RideRequests />} />
            <Route path="/status" element={<RideStatus />} />
          </>
          
        )}
      </Routes>
    </div>
  );
}

export default App;