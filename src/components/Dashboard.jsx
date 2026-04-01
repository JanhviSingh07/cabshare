import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ marginTop: "30px" }}>
      <h2>What do you want to do?</h2>

      <button onClick={() => navigate("/create")} style={{ marginRight: "15px" }}>
        Create Ride
      </button>

      <button onClick={() => navigate("/search")}>
        Search Ride
      </button>
    </div>
  );
}

export default Dashboard;
