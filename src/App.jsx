import { Routes, Route } from "react-router-dom";
import Auth from "./components/Auth";
import Home from "./components/Home";
import CreateRide from "./components/CreateRide";
import SearchRide from "./components/SearchRide";
import RideRequests from "./components/RideRequests";
import RideStatus from "./components/RideStatus";
import { useEffect, useState } from "react";
import { auth } from "./firebase";

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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">

      {/* 🔥 HEADER */}
      {user && (
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px"
        }}>
          <h2>🚖 CabShare</h2>

          <button
            className="btn-danger"
            onClick={() => {
              auth.signOut();
              window.location.href = "/";
            }}
          >
            Logout
          </button>
        </div>
      )}

      {/* ROUTES */}
      <Routes>
        {!user ? (
          <Route path="*" element={<Auth />} />
        ) : (
          <>
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