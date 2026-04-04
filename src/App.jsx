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
import { auth } from "./firebase";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔄 AUTH STATE LISTENER
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // 🔄 LOADING SCREEN
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <p className="text-lg animate-pulse">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white px-4 sm:px-6 overflow-x-hidden">

      {/* 🔥 GLOBAL TOASTER */}
      <Toaster position="top-center" />

      {/* 🔥 HEADER (ONLY ON LOGIN) */}
      {user && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-6">

          {/* APP NAME */}
          <h2 className="text-xl font-bold">🚖 CabShare</h2>

          {/* USER INFO + LOGOUT */}
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">

            <p className="text-sm text-gray-300 text-center sm:text-left">
              {user.displayName || user.email}
            </p>

            <button
              onClick={() => auth.signOut()}
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
          <Route path="*" element={<Auth />} />
        ) : (
          <>
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/home" element={<Home />} />
            <Route path="/create-ride" element={<CreateRide />} />
            <Route path="/search-ride" element={<SearchRide />} />
            <Route path="/requests" element={<RideRequests />} />
            <Route path="/status" element={<RideStatus />} />
            <Route path="/profile" element={<Profile />} />
          </>
        )}
      </Routes>
    </div>
  );
}

export default App;