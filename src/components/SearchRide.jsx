import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";

function SearchRide() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [rides, setRides] = useState([]);
  const [ownerNames, setOwnerNames] = useState({});
  const [loading, setLoading] = useState(false);

  const locations = ["manipal", "ixe airport"];
  const today = new Date().toISOString().split("T")[0];

  const searchRides = async () => {
    if (!from || !to || !date) return alert("Please select all fields");
    if (from === to) return alert("From and To cannot be the same");
    if (date < today) return alert("Please select today or a future date");

    setLoading(true);
    try {
      const q = query(
        collection(db, "rides"),
        where("from", "==", from),
        where("to", "==", to),
        where("date", "==", date)
      );
      const snap = await getDocs(q);
      const results = snap.docs.map(d => ({ id: d.id, ...d.data() })).filter(r => r.status !== "cancelled");
      if (results.length === 0) alert("No rides available for the selected date.");
      setRides(results);

      const names = {};
      for (let ride of results) {
        try {
          const psnap = await getDoc(doc(db, "profiles", ride.createdBy));
          names[ride.createdBy] = psnap.exists() ? (psnap.data().name || "Unknown") : "Unknown";
        } catch { names[ride.createdBy] = "Unknown"; }
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
      if (ride.createdBy === user.uid) return alert("This is your own ride");
      if (ride.participants?.includes(user.uid)) return alert("Already joined");
      if (ride.pendingRequests?.includes(user.uid)) return alert("Already requested");
      if (ride.seats <= 0) return alert("Ride full");
      const profileSnap = await getDoc(doc(db, "profiles", user.uid));
      if (profileSnap.data()?.currentRideId) return alert("You are already in another ride");
      await updateDoc(doc(db, "rides", ride.id), { pendingRequests: arrayUnion(user.uid) });
      alert("Request sent");
    } catch (err) {
      console.error(err);
      alert("Error sending request");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-6 py-12">

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Find a Ride</h1>
        <p className="text-gray-500 text-sm mb-8">Search for available rides near you</p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">From</label>
              <select value={from} onChange={(e) => setFrom(e.target.value)}
                className="w-full border border-gray-200 focus:border-gray-800 outline-none p-3 rounded-xl text-sm text-gray-900 bg-white transition capitalize">
                <option value="">Select</option>
                {locations.map((loc, i) => <option key={i} value={loc} className="capitalize">{loc}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">To</label>
              <select value={to} onChange={(e) => setTo(e.target.value)}
                className="w-full border border-gray-200 focus:border-gray-800 outline-none p-3 rounded-xl text-sm text-gray-900 bg-white transition capitalize">
                <option value="">Select</option>
                {locations.map((loc, i) => <option key={i} value={loc} className="capitalize">{loc}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Date</label>
            <input type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)}
              className="w-full border border-gray-200 focus:border-gray-800 outline-none p-3 rounded-xl text-sm text-gray-900 bg-white transition" />
          </div>

          <button onClick={searchRides} disabled={loading}
            className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-semibold text-sm transition disabled:bg-gray-300">
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Results */}
        <div className="mt-8 space-y-3">
          {rides.map(ride => {
            const user = auth.currentUser;
            const isOwner = ride.createdBy === user?.uid;
            const isJoined = ride.participants?.includes(user?.uid);
            const isRequested = ride.pendingRequests?.includes(user?.uid);
            const isFull = ride.seats <= 0;

            return (
              <div key={ride.id} className="border border-gray-200 rounded-2xl p-5 hover:border-gray-400 transition">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 capitalize">{ride.from} → {ride.to}</h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${isFull ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                    {isFull ? "Full" : `${ride.seats} seats`}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-1">{ride.date} · {ride.time}</p>
                <p className="text-sm text-gray-500 mb-4">Host: {ownerNames[ride.createdBy] || "Loading..."}</p>

                <button
                  disabled={isOwner || isJoined || isRequested || isFull}
                  onClick={() => requestToJoin(ride)}
                  className={`w-full py-2.5 rounded-xl text-sm font-medium transition ${
                    isOwner || isJoined || isRequested || isFull
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-black hover:bg-gray-800 text-white"
                  }`}
                >
                  {isOwner ? "Your Ride" : isJoined ? "Joined" : isRequested ? "Requested" : isFull ? "Full" : "Request to Join"}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SearchRide;