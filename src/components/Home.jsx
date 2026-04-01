import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

function Home() {
  const navigate = useNavigate();
  const user = auth.currentUser;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6">

      {/* 🔝 HEADER */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-2xl font-bold">🚖 CabShare</h1>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-300">
            {user?.displayName}
          </span>

          <button
            onClick={() => {
              auth.signOut();
              window.location.href = "/";
            }}
            className="bg-red-500 hover:bg-red-600 px-4 py-1 rounded-lg text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      {/* 🎯 MAIN ACTIONS */}
      <div className="grid md:grid-cols-2 gap-6">

        {/* CREATE RIDE */}
        <div className="bg-slate-900/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:scale-105 transition">
          <h2 className="text-xl font-semibold mb-2">➕ Create Ride</h2>
          <p className="text-gray-400 mb-4">
            Offer a ride to others going your way
          </p>

          <button
            onClick={() => navigate("/create-ride")}
            className="bg-green-500 hover:bg-green-600 w-full py-2 rounded-lg"
          >
            Create Ride
          </button>
        </div>

        {/* SEARCH RIDE */}
        <div className="bg-slate-900/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:scale-105 transition">
          <h2 className="text-xl font-semibold mb-2">🔍 Find Ride</h2>
          <p className="text-gray-400 mb-4">
            Search for available rides
          </p>

          <button
            onClick={() => navigate("/search-ride")}
            className="bg-blue-500 hover:bg-blue-600 w-full py-2 rounded-lg"
          >
            Search Ride
          </button>
        </div>

        {/* REQUESTS */}
        <div className="bg-slate-900/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:scale-105 transition">
          <h2 className="text-xl font-semibold mb-2">📩 Ride Requests</h2>
          <p className="text-gray-400 mb-4">
            Manage incoming join requests
          </p>

          <button
            onClick={() => navigate("/requests")}
            className="bg-yellow-500 hover:bg-yellow-600 w-full py-2 rounded-lg"
          >
            View Requests
          </button>
        </div>

        {/* STATUS */}
        <div className="bg-slate-900/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:scale-105 transition">
          <h2 className="text-xl font-semibold mb-2">📊 My Ride</h2>
          <p className="text-gray-400 mb-4">
            Check your ride and contacts
          </p>

          <button
            onClick={() => navigate("/status")}
            className="bg-purple-500 hover:bg-purple-600 w-full py-2 rounded-lg"
          >
            View Status
          </button>
        </div>

      </div>

    </div>
  );
}

export default Home;