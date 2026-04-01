import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore";

function CreateRide() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState(1);

  const createRide = async () => {
    const user = auth.currentUser;
    if (!user) return alert("No user logged in");

    if (!from || !to || !date || !time) {
      return alert("Please fill all fields");
    }

    try {
      // 🚫 prevent multiple rides
      const profileRef = doc(db, "profiles", user.uid);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists() && profileSnap.data().currentRideId) {
        return alert("You are already in a ride");
      }

      await addDoc(collection(db, "rides"), {
        from,
        to,
        date,
        time,
        seats,
        createdBy: user.uid,
        createdByEmail: user.email,
        participants: [user.uid],
        createdAt: Timestamp.now(),
      });

      alert("Ride created 🚀");

      setFrom("");
      setTo("");
      setDate("");
      setTime("");
      setSeats(1);

    } catch (err) {
      console.error(err);
      alert("Error creating ride");
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">

      <h2 className="text-2xl font-bold mb-6 text-center">
        🚗 Create Ride
      </h2>

      <div className="bg-slate-800 p-6 rounded-xl shadow-lg space-y-4">

        {/* FROM + TO */}
        <div className="flex gap-4">
          <input
            className="flex-1 p-3 rounded-lg bg-slate-700 text-white outline-none"
            placeholder="From"
            value={from}
            onChange={e => setFrom(e.target.value)}
          />

          <input
            className="flex-1 p-3 rounded-lg bg-slate-700 text-white outline-none"
            placeholder="To"
            value={to}
            onChange={e => setTo(e.target.value)}
          />
        </div>

        {/* DATE + TIME */}
        <div className="flex gap-4">
          <input
            type="date"
            className="flex-1 p-3 rounded-lg bg-slate-700 text-white outline-none"
            value={date}
            onChange={e => setDate(e.target.value)}
          />

          <input
            type="time"
            className="flex-1 p-3 rounded-lg bg-slate-700 text-white outline-none"
            value={time}
            onChange={e => setTime(e.target.value)}
          />
        </div>

        {/* SEATS */}
        <input
          type="number"
          min="1"
          className="w-full p-3 rounded-lg bg-slate-700 text-white outline-none"
          value={seats}
          onChange={e => setSeats(Number(e.target.value))}
          placeholder="Seats"
        />

        {/* BUTTON */}
        <button
          onClick={createRide}
          className="w-full bg-green-500 hover:bg-green-600 p-3 rounded-lg font-semibold"
        >
          Create Ride 🚀
        </button>

      </div>
    </div>
  );
}

export default CreateRide;