import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div style={{ padding: "30px" }}>
      <h2>Welcome</h2>

      <button onClick={() => navigate("/create-ride")} style={{ marginRight: "15px" }}>
        Create Ride
      </button>

      <button onClick={() => navigate("/search-ride")}>
        Search Ride
      </button>

      <hr />

      <button onClick={() => navigate("/requests")}>
        View Ride Requests (Owner)
      </button>

      <button onClick={() => navigate("/status")} style={{ marginLeft: "15px" }}>
        My Ride Status
      </button>
    </div>
  );
}

export default Home;
