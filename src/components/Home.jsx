import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  // ✅ Clean data (no colors, no emojis overload)
  const cards = [
    {
      title: "Create Ride",
      desc: "Offer a ride to others going your way",
      path: "/create-ride",
    },
    {
      title: "Find Ride",
      desc: "Search for available rides",
      path: "/search-ride",
    },
    {
      title: "Ride Requests",
      desc: "Manage incoming join requests",
      path: "/requests",
    },
    {
      title: "My Ride",
      desc: "Check your ride and contacts",
      path: "/status",
    }
  ];

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-4">

      {/* HEADER */}
      <h1 className="text-2xl font-semibold mt-6 mb-4 tracking-wide">
        Dashboard
      </h1>

      {/* MAIN CARDS */}
      <div className="grid sm:grid-cols-2 gap-6">

        {cards.map((item, i) => (
          <div
            key={i}
            className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm hover:border-blue-500 hover:shadow-md transition"
          >
            <h2 className="text-lg font-semibold mb-2">
              {item.title}
            </h2>

            <p className="text-gray-400 mb-5 text-sm">
              {item.desc}
            </p>

            <button
              onClick={() => navigate(item.path)}
              className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-sm font-medium transition"
            >
              Open
            </button>
          </div>
        ))}

        {/* PROFILE CARD */}
        <div className="sm:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm hover:border-blue-500 transition">
          <h2 className="text-lg font-semibold mb-2">
            Profile
          </h2>

          <p className="text-gray-400 mb-5 text-sm">
            View and update your personal details
          </p>

          <button
            onClick={() => navigate("/profile")}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg text-sm font-medium transition"
          >
            Open Profile
          </button>
        </div>

      </div>
    </div>
  );
}

export default Home;