import { useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  doc,
  getDoc
} from "firebase/firestore";

function SearchRide() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [rides, setRides] = useState([]);

  // 🔍 Search
  const searchRides = async () => {
    if (!from || !to || !date) {
      return alert("Enter all fields");
    }

    const q = query(
      collection(db, "rides"),
      where("from", "==", from),
      where("to", "==", to),
      where("date", "==", date)
    );

    const snap = await getDocs(q);
    setRides(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  // 📩 Request
  const requestToJoin = async (ride) => {
    const user = auth.currentUser;
    if (!user) return alert("Login first");

    try {
      if (ride.createdBy === user.uid) {
        return alert("Your own ride");
      }

      if (ride.seats <= 0) {
        return alert("Ride full");
      }

      if (ride.participants?.includes(user.uid)) {
        return alert("Already joined");
      }

      const profileRef = doc(db, "profiles", user.uid);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists() && profileSnap.data().currentRideId) {
        return alert("Already in another ride");
      }

      const existingReq = query(
        collection(db, "rideRequests"),
        where("rideId", "==", ride.id),
        where("requestedBy", "==", user.uid),
        where("status", "==", "pending")
      );

      const reqSnap = await getDocs(existingReq);
      if (!reqSnap.empty) return alert("Already requested");

      await addDoc(collection(db, "rideRequests"), {
        rideId: ride.id,
        rideOwner: ride.createdBy,
        requestedBy: user.uid,
        requestedByEmail: user.email,
        status: "pending",
        createdAt: Timestamp.now()
      });

      alert("Request sent 🚀");

    } catch (err) {
      console.error(err);
      alert("Error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">

      <h2 className="text-2xl font-bold mb-6 text-center">
        🔍 Find a Ride
      </h2>

      {/* 🔎 SEARCH BOX */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg space-y-4">

        <div className="flex gap-3">
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

        <input
          type="date"
          className="w-full p-3 rounded-lg bg-slate-700 text-white outline-none"
          value={date}
          onChange={e => setDate(e.target.value)}
        />

        <button
          onClick={searchRides}
          className="w-full bg-blue-500 hover:bg-blue-600 p-3 rounded-lg font-semibold"
        >
          Search Ride 🚀
        </button>
      </div>

      {/* 🚗 RESULTS */}
      <div className="mt-6 space-y-4">

        {rides.length === 0 && (
          <p className="text-center text-gray-400">
            No rides found
          </p>
        )}

        {rides.map(ride => {
          const user = auth.currentUser;
          const isOwner = ride.createdBy === user?.uid;
          const isJoined = ride.participants?.includes(user?.uid);
          const isFull = ride.seats <= 0;

          return (
            <div
              key={ride.id}
              className="bg-slate-800 p-5 rounded-xl shadow-md space-y-2"
            >
              <h3 className="text-lg font-semibold">
                {ride.from} → {ride.to}
              </h3>

              <p className="text-sm text-gray-400">
                📅 {ride.date} | ⏰ {ride.time}
              </p>

              <p>👤 Owner: {ride.createdByEmail}</p>
              <p>💺 Seats left: {ride.seats}</p>
              <p>👥 Participants: {ride.participants?.length || 0}</p>

              <button
                disabled={isOwner || isJoined || isFull}
                onClick={() => requestToJoin(ride)}
                className={`w-full mt-2 p-2 rounded-lg font-medium ${
                  isFull
                    ? "bg-gray-500"
                    : isJoined
                    ? "bg-green-600"
                    : isOwner
                    ? "bg-yellow-500"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {isOwner
                  ? "Your Ride"
                  : isJoined
                  ? "Joined"
                  : isFull
                  ? "Full"
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