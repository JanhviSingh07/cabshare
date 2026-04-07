import { useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  arrayUnion
} from "firebase/firestore";

function SearchRide() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [rides, setRides] = useState([]);
  const [ownerNames, setOwnerNames] = useState({});
  const [loading, setLoading] = useState(false);

  const locations = [
    "manipal",
    "ixe airport",
    
  ];

  // ✅ Aaj ki date YYYY-MM-DD format mein
  const today = new Date().toISOString().split("T")[0];

  const searchRides = async () => {
    if (!from || !to || !date) {
      return alert("Please select all fields");
    }

    if (from === to) {
      return alert("From and To cannot be the same");
    }

    // ✅ Past date block karo
    if (date < today) {
      return alert("Invalid date. Please select today or a future date.");
    }

    setLoading(true);

    try {
      const q = query(
        collection(db, "rides"),
        where("from", "==", from),
        where("to", "==", to),
        where("date", "==", date)
      );

      const snap = await getDocs(q);

      // ✅ Cancelled rides filter karo
      const results = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(ride => ride.status !== "cancelled");

      setRides(results);

      const names = {};
      for (let ride of results) {
        try {
          const psnap = await getDoc(doc(db, "profiles", ride.createdBy));
          names[ride.createdBy] = psnap.exists()
            ? (psnap.data().name || "Unknown")
            : "Unknown";
        } catch {
          names[ride.createdBy] = "Unknown";
        }
      }
      setOwnerNames(names);

    } catch (err) {
      console.error(err);
      alert("Error fetching rides");
    }

    setLoading(false);
  };

  const requestToJoin = async (ride) => {
    const user = auth.currentUser;
    if (!user) return alert("Login required");

    try {
      if (ride.createdBy === user.uid) {
        return alert("This is your own ride");
      }

      if (ride.participants?.includes(user.uid)) {
        return alert("Already joined ");
      }

      if (ride.pendingRequests?.includes(user.uid)) {
        return alert("Already requested");
      }

      if (ride.seats <= 0) {
        return alert("Ride full ");
      }

      const profileSnap = await getDoc(doc(db, "profiles", user.uid));
      if (profileSnap.data()?.currentRideId) {
        return alert("You are already in another ride");
      }

      await updateDoc(doc(db, "rides", ride.id), {
        pendingRequests: arrayUnion(user.uid)
      });

      alert("Request sent ✅");

    } catch (err) {
      console.error(err);
      alert("Error sending request");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">

      <h2 className="text-xl font-semibold mb-6">🔍 Find a Ride</h2>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">

        {/* DROPDOWNS */}
        <div className="flex gap-3">
          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full p-3 bg-slate-700 rounded-lg text-white capitalize"
          >
            <option value="">From</option>
            {locations.map((loc, i) => (
              <option key={i} value={loc} className="capitalize">{loc}</option>
            ))}
          </select>

          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full p-3 bg-slate-700 rounded-lg text-white capitalize"
          >
            <option value="">To</option>
            {locations.map((loc, i) => (
              <option key={i} value={loc} className="capitalize">{loc}</option>
            ))}
          </select>
        </div>

        {/* ✅ Min date = aaj — past date select nahi hogi */}
        <input
          type="date"
          className="w-full p-3 bg-slate-700 rounded-lg text-white"
          value={date}
          min={today}
          onChange={(e) => setDate(e.target.value)}
        />

        <button
          onClick={searchRides}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg disabled:bg-gray-500"
        >
          {loading ? "Searching..." : "Search Ride 🔍"}
        </button>
      </div>

      {/* RESULTS */}
      <div className="mt-6 space-y-4">

        {rides.length === 0 && date && (
          <p className="text-center text-gray-400">Koi ride nahi mili</p>
        )}

        {rides.map(ride => {
          const user = auth.currentUser;
          const isOwner = ride.createdBy === user?.uid;
          const isJoined = ride.participants?.includes(user?.uid);
          const isRequested = ride.pendingRequests?.includes(user?.uid);
          const isFull = ride.seats <= 0;

          return (
            <div key={ride.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700">

              <h3 className="font-semibold capitalize">
                {ride.from} → {ride.to}
              </h3>

              <p className="text-gray-400 text-sm">
                📅 {ride.date} | ⏰ {ride.time}
              </p>

              <p className="text-sm mt-1">
                👤 Owner: {ownerNames[ride.createdBy] || "Loading..."}
              </p>

              <p className="text-sm">
                💺 Seats: {ride.seats}
              </p>

              <button
                disabled={isOwner || isJoined || isRequested || isFull}
                onClick={() => requestToJoin(ride)}
                className={`w-full mt-3 py-2 rounded-lg font-medium ${
                  isOwner || isJoined || isRequested || isFull
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isOwner
                  ? "Ride is"
                  : isJoined
                  ? "✅ Joined"
                  : isRequested
                  ? "⏳ Requested"
                  : isFull
                  ? "❌ Full"
                  : "Request to Join"}
              </button>

            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SearchRide;