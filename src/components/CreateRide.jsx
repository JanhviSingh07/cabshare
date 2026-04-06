import { useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";

function CreateRide() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(false);

  // ✅ Dropdown options
  const locations = ["manipal", "ixe airport"];

  const createRide = async () => {
    const user = auth.currentUser;
    if (!user) return alert("No user logged in");

    // ✅ validation
    if (!from || !to || !date || !time) {
      return alert("Please fill all fields");
    }

    if (from === to) {
      return alert("From and To cannot be same");
    }

    setLoading(true);

    try {
      const profileRef = doc(db, "profiles", user.uid);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists() && profileSnap.data().currentRideId) {
        setLoading(false);
        return alert("You are already in a ride");
      }

      const rideRef = await addDoc(collection(db, "rides"), {
        from,
        to,
        date,
        time,
        seats,
        createdBy: user.uid,
        participants: [user.uid],
        pendingRequests: [],
        createdAt: Timestamp.now(),
      });

      await updateDoc(profileRef, {
        currentRideId: rideRef.id
      });

      alert("Ride created");

      setFrom("");
      setTo("");
      setDate("");
      setTime("");
      setSeats(1);

    } catch (err) {
      console.error(err);
      alert("Error creating ride");
    }

    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">

      <h2 className="text-xl font-semibold mb-6">Create Ride</h2>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-sm space-y-4">

        {/* ✅ DROPDOWN */}
        <div className="flex flex-col sm:flex-row gap-3">

          <select
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-700 text-white outline-none"
          >
            <option value="">Select From</option>
            {locations.map((loc, i) => (
              <option key={i} value={loc}>{loc}</option>
            ))}
          </select>

          <select
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-700 text-white outline-none"
          >
            <option value="">Select To</option>
            {locations.map((loc, i) => (
              <option key={i} value={loc}>{loc}</option>
            ))}
          </select>

        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-700 text-white outline-none"
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full p-3 rounded-lg bg-slate-700 text-white outline-none"
          />
        </div>

        <input
          type="number"
          min="1"
          className="w-full p-3 rounded-lg bg-slate-700 text-white outline-none"
          value={seats}
          onChange={e => setSeats(Number(e.target.value))}
        />

        <button
          onClick={createRide}
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg"
        >
          {loading ? "Creating..." : "Create Ride"}
        </button>

      </div>
    </div>
  );
}

export default CreateRide;