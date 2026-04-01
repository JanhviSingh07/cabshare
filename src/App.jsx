import { Routes, Route } from "react-router-dom";
import Auth from "./components/Auth";
import Home from "./components/Home";
import CreateRide from "./components/CreateRide";
import SearchRide from "./components/SearchRide";
import RideRequests from "./components/RideRequests";
import RideStatus from "./components/RideStatus";

function App() {
  return (
    <div style={{ padding: "20px" }}>
      <Routes>
        <Route path="/" element={<Auth />} />
        <Route path="/home" element={<Home />} />
        <Route path="/create-ride" element={<CreateRide />} />
        <Route path="/search-ride" element={<SearchRide />} />
        <Route path="/requests" element={<RideRequests />} />
        <Route path="/status" element={<RideStatus />} />
      </Routes>
    </div>
  );
}

export default App;
