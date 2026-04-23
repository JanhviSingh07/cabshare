import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Create Ride",
      desc: "Offer a ride to others going your way",
      path: "/create-ride",
    },
    {
      title: "Find Ride",
      desc: "Search for available rides near you",
      path: "/search-ride",
    },
    {
      title: "Ride Requests",
      desc: "Manage incoming join requests",
      path: "/requests",
    },
    {
      title: "My Ride",
      desc: "View your active ride and contacts",
      path: "/status",
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Hero */}
      <div className="bg-black text-white px-6 py-14">
        <h1 className="text-4xl font-extrabold leading-tight mb-3">
          Easy sharing.
        </h1>
        <p className="text-gray-400 text-base">
          Safe cab sharing for college students.
        </p>
      </div>

      {/* Cards */}
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {cards.map((item, i) => (
          <div
            key={i}
            onClick={() => navigate(item.path)}
            className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 border border-gray-200 px-5 py-4 rounded-2xl cursor-pointer transition-all duration-150 active:scale-[0.99]"
          >
            <div>
              <h2 className="text-base font-semibold text-gray-900">{item.title}</h2>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
            <span className="text-gray-400 text-xl">›</span>
          </div>
        ))}

        {/* Profile */}
        <div
          onClick={() => navigate("/profile")}
          className="flex items-center justify-between bg-gray-50 hover:bg-gray-100 border border-gray-200 px-5 py-4 rounded-2xl cursor-pointer transition-all duration-150 active:scale-[0.99]"
        >
          <div>
            <h2 className="text-base font-semibold text-gray-900">Profile</h2>
            <p className="text-sm text-gray-500">View and update your personal details</p>
          </div>
          <span className="text-gray-400 text-xl">›</span>
        </div>
      </div>
    </div>
  );
}

export default Home;