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

  const createRide = async () => {
    const user = auth.currentUser;
    if (!user) return alert("No user logged in");

    if (!from || !to || !date || !time) {
      return alert("Please fill all fields");
    }

    setLoading(true);

    try {
      const profileRef = doc(db, "profiles", user.uid);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists() && profileSnap.data().currentRideId) {
        setLoading(false);
        return alert("You are already in a ride");
      }

      // ✅ FIX 1: lowercase store (VERY IMPORTANT)
      const cleanFrom = from.trim().toLowerCase();
      const cleanTo = to.trim().toLowerCase();

      // ✅ FIX 2: date already correct (YYYY-MM-DD from input)
      const cleanDate = date;

      // 🚗 CREATE RIDE
      const rideRef = await addDoc(collection(db, "rides"), {
        from: cleanFrom,
        to: cleanTo,
        date: cleanDate,
        time,
        seats,
        createdBy: user.uid,
        createdByEmail: user.email,
        participants: [user.uid],
        pendingRequests: [], // ✅ IMPORTANT (avoid undefined bugs)
        createdAt: Timestamp.now(),
      });

      // 🔥 mark user as active rider
      await updateDoc(profileRef, {
        currentRideId: rideRef.id
      });

      alert("Ride created 🚀");

      // reset
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
    <div className="max-w-2xl mx-auto mt-10 px-2">

      <h2 className="text-2xl font-bold mb-6 text-center">
        🚗 Create Ride
      </h2>

      <div className="bg-slate-800 p-6 rounded-xl shadow-lg space-y-4">

        {/* FROM + TO */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="w-full sm:flex-1 p-3 rounded-lg bg-slate-700 text-white"
            placeholder="From"
            value={from}
            onChange={e => setFrom(e.target.value)}
          />

          <input
            className="w-full sm:flex-1 p-3 rounded-lg bg-slate-700 text-white"
            placeholder="To"
            value={to}
            onChange={e => setTo(e.target.value)}
          />
        </div>

        {/* DATE + TIME */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full sm:flex-1 p-3 rounded-lg bg-slate-700 text-white"
          />

          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full sm:flex-1 p-3 rounded-lg bg-slate-700 text-white"
          />
        </div>

        {/* SEATS */}
        <input
          type="number"
          min="1"
          className="w-full p-3 rounded-lg bg-slate-700 text-white"
          value={seats}
          onChange={e => setSeats(Number(e.target.value))}
        />

        {/* BUTTON */}
        <button
          onClick={createRide}
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 p-3 rounded-lg font-semibold"
        >
          {loading ? "Creating..." : "Create Ride 🚀"}
        </button>

      </div>
    </div>
  );
}

export default CreateRide;