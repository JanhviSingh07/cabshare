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

  // ✅ Alag function — login pe bhi call hoga, save ke baad bhi
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
    return <p className="text-center mt-10">Loading...</p>;
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-gray-100 px-4">

      <Toaster />

      {/* HEADER */}
      {user && (
        <div className="flex justify-between items-center mb-6">
          <h2>🚖 CabShare</h2>
          <button onClick={() => auth.signOut()}>Logout</button>
        </div>
      )}

      <Routes>

        {/* NOT LOGGED IN */}
        {!user && (
          <Route path="*" element={<Auth />} />
        )}

        {/* FORCE PROFILE — jab tak sab fields nahi bhari, yahan raho */}
        {user && !profileComplete && (
          <>
            <Route
              path="/profile"
              element={
                <Profile onProfileSaved={() => checkProfile(user)} />
              }
            />
            <Route path="*" element={<Navigate to="/profile" />} />
          </>
        )}

        {/* NORMAL FLOW — sab fields bhar di toh yahan aao */}
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
              element={
                <Profile onProfileSaved={() => checkProfile(user)} />
              }
            />
          </>
        )}

      </Routes>
    </div>
  );
}

export default App;