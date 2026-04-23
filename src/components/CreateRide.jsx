import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, Timestamp, doc, getDoc, updateDoc } from "firebase/firestore";

function CreateRide() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(false);

  const locations = ["manipal", "ixe airport"];

  const createRide = async () => {
    const user = auth.currentUser;
    if (!user) return alert("No user logged in");
    if (!from || !to || !date || !time) return alert("Please fill all fields");
    if (from === to) return alert("From and To cannot be same");

    setLoading(true);
    try {
      const profileRef = doc(db, "profiles", user.uid);
      const profileSnap = await getDoc(profileRef);
      if (profileSnap.exists() && profileSnap.data().currentRideId) {
        setLoading(false);
        return alert("You are already in a ride");
      }

      const rideRef = await addDoc(collection(db, "rides"), {
        from, to, date, time, seats,
        createdBy: user.uid,
        participants: [user.uid],
        pendingRequests: [],
        createdAt: Timestamp.now(),
      });

      await updateDoc(profileRef, { currentRideId: rideRef.id });
      alert("Ride created");
      setFrom(""); setTo(""); setDate(""); setTime(""); setSeats(1);
    } catch (err) {
      console.error(err);
      alert("Error creating ride");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-6 py-12">

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create a Ride</h1>
        <p className="text-gray-500 text-sm mb-8">Offer a ride to others going your way</p>

        <div className="space-y-4">

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">From</label>
              <select
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full border border-gray-200 focus:border-gray-800 outline-none p-3 rounded-xl text-sm text-gray-900 bg-white transition capitalize"
              >
                <option value="">Select</option>
                {locations.map((loc, i) => (
                  <option key={i} value={loc} className="capitalize">{loc}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">To</label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full border border-gray-200 focus:border-gray-800 outline-none p-3 rounded-xl text-sm text-gray-900 bg-white transition capitalize"
              >
                <option value="">Select</option>
                {locations.map((loc, i) => (
                  <option key={i} value={loc} className="capitalize">{loc}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border border-gray-200 focus:border-gray-800 outline-none p-3 rounded-xl text-sm text-gray-900 bg-white transition"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Time</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full border border-gray-200 focus:border-gray-800 outline-none p-3 rounded-xl text-sm text-gray-900 bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Available Seats</label>
            <input
              type="number"
              min="1"
              value={seats}
              onChange={e => setSeats(Number(e.target.value))}
              className="w-full border border-gray-200 focus:border-gray-800 outline-none p-3 rounded-xl text-sm text-gray-900 bg-white transition"
            />
          </div>

          <button
            onClick={createRide}
            disabled={loading}
            className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-semibold text-sm transition disabled:bg-gray-300 mt-2"
          >
            {loading ? "Creating..." : "Create Ride"}
          </button>

        </div>
      </div>
    </div>
  );
}

export default CreateRide;