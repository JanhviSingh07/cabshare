import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

function Home() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  return (
    <div className="container">
      
      {/* HEADER */}
      <h1 style={{ textAlign: "center" }}>🚖 CabShare</h1>
      <p style={{ textAlign: "center", marginBottom: "10px" }}>
        Find or Share your ride easily
      </p>

      {/* 👤 USER INFO */}
      <div style={{ textAlign: "center", marginBottom: "20px", opacity: 0.8 }}>
        <p>👋 Welcome, <b>{user?.displayName}</b></p>
        <p style={{ fontSize: "14px" }}>{user?.email}</p>
      </div>

      {/* MAIN ACTIONS */}
      <div className="card">
        <h3>Main Actions</h3>

        <div className="button-group">
          <button
            className="btn-success"
            onClick={() => navigate("/create-ride")}
          >
            ➕ Create Ride
          </button>

          <button
            className="btn-primary"
            onClick={() => navigate("/search-ride")}
          >
            🔍 Find Ride
          </button>
        </div>
      </div>

      {/* SECONDARY ACTIONS */}
      <div className="card">
        <h3>Manage</h3>

        <div className="button-group">
          <button
            className="btn-primary"
            onClick={() => navigate("/requests")}
          >
            📩 Ride Requests
          </button>

          <button
            className="btn-primary"
            onClick={() => navigate("/status")}
          >
            📊 My Ride Status
          </button>
        </div>
      </div>

    </div>
  );
}

export default Home;