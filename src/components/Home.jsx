import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen text-white">

      {/* 🎯 MAIN ACTIONS */}
      <div className="grid md:grid-cols-2 gap-6 mt-6">

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

        {/* PROFILE */}
        <div className="md:col-span-2 bg-slate-900/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:scale-105 transition">
          <h2 className="text-xl font-semibold mb-2">👤 Profile</h2>
          <p className="text-gray-400 mb-4">
            View and update your personal details
          </p>

          <button
            onClick={() => navigate("/profile")}
            className="bg-indigo-500 hover:bg-indigo-600 w-full py-2 rounded-lg"
          >
            Go to Profile
          </button>
        </div>

      </div>
    </div>
  );
}

export default Home;