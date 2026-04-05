import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "➕ Create Ride",
      desc: "Offer a ride to others going your way",
      path: "/create-ride",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      title: "🔍 Find Ride",
      desc: "Search for available rides",
      path: "/search-ride",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      title: "📩 Ride Requests",
      desc: "Manage incoming join requests",
      path: "/requests",
      color: "bg-yellow-500 hover:bg-yellow-600"
    },
    {
      title: "📊 My Ride",
      desc: "Check your ride and contacts",
      path: "/status", // ✅ CORRECT
      color: "bg-purple-500 hover:bg-purple-600"
    }
  ];

  return (
    <div className="min-h-screen text-white max-w-5xl mx-auto px-2">

      <div className="grid sm:grid-cols-2 gap-6 mt-6">

        {cards.map((item, i) => (
          <div
            key={i}
            className="bg-slate-900/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg hover:scale-105 transition"
          >
            <h2 className="text-xl font-semibold mb-2">{item.title}</h2>
            <p className="text-gray-400 mb-4">{item.desc}</p>

            <button
              onClick={() => navigate(item.path)}
              className={`${item.color} w-full py-2 rounded-lg font-medium transition`}
            >
              Go
            </button>
          </div>
        ))}

        {/* PROFILE */}
        <div className="sm:col-span-2 bg-slate-900/60 backdrop-blur-lg p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-2">👤 Profile</h2>
          <p className="text-gray-400 mb-4">
            View and update your personal details
          </p>

          <button
            onClick={() => navigate("/profile")}
            className="bg-indigo-500 hover:bg-indigo-600 w-full py-2 rounded-lg font-medium transition"
          >
            Go to Profile
          </button>
        </div>

      </div>
    </div>
  );
}

export default Home;