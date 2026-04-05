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
  const [loading, setLoading] = useState(false);

  // 🔍 SEARCH RIDES
  const searchRides = async () => {
    if (!from || !to || !date) {
      return alert("Enter all fields");
    }

    setLoading(true);

    try {
      const q = query(
        collection(db, "rides"),
        where("from", "==", from.toLowerCase()),
        where("to", "==", to.toLowerCase()),
        where("date", "==", date)
      );

      const snap = await getDocs(q);

      const results = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setRides(results);

    } catch (err) {
      console.error(err);
      alert("Error fetching rides");
    }

    setLoading(false);
  };

  // 📩 REQUEST TO JOIN (FIXED)
  const requestToJoin = async (ride) => {
    const user = auth.currentUser;
    if (!user) return alert("Login first");

    try {
      if (ride.createdBy === user.uid) {
        return alert("This is your ride");
      }

      if (ride.seats <= 0) {
        return alert("Ride is full");
      }

      if (ride.participants?.includes(user.uid)) {
        return alert("Already joined this ride");
      }

      const profileRef = doc(db, "profiles", user.uid);
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        return alert("Complete your profile first");
      }

      const profile = profileSnap.data();

      if (profile.currentRideId) {
        return alert("You are already in a ride");
      }

      // ✅ STORE REQUEST IN RIDE (MAIN FIX)
      const rideRef = doc(db, "rides", ride.id);

      await updateDoc(rideRef, {
        pendingRequests: arrayUnion(user.uid)
      });

      alert("Request sent 🚀");

    } catch (err) {
      console.error(err);
      alert("Error sending request");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 px-2">

      <h2 className="text-2xl font-bold mb-6 text-center">
        🔍 Find a Ride
      </h2>

      {/* 🔎 SEARCH BOX */}
      <div className="bg-slate-800 p-6 rounded-xl shadow-lg space-y-4">

        {/* FROM + TO */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="w-full sm:flex-1 p-3 rounded-lg bg-slate-700 text-white outline-none"
            placeholder="From"
            value={from}
            onChange={e => setFrom(e.target.value)}
          />

          <input
            className="w-full sm:flex-1 p-3 rounded-lg bg-slate-700 text-white outline-none"
            placeholder="To"
            value={to}
            onChange={e => setTo(e.target.value)}
          />
        </div>

        {/* DATE */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-3 rounded-lg bg-slate-700 text-white outline-none"
        />

        {/* BUTTON */}
        <button
          onClick={searchRides}
          className="w-full bg-blue-500 hover:bg-blue-600 p-3 rounded-lg font-semibold"
        >
          {loading ? "Searching..." : "Search Ride 🚀"}
        </button>
      </div>

      {/* 🚗 RESULTS */}
      <div className="mt-6 space-y-4">

        {!loading && rides.length === 0 && (
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

              {/* ✅ SHOW NAME INSTEAD OF EMAIL */}
              <p>
                👤 Owner: {ride.createdByEmail?.split("@")[0]}
              </p>

              <p>💺 Seats left: {ride.seats}</p>
              <p>👥 Participants: {ride.participants?.length || 0}</p>

              <button
                disabled={isOwner || isJoined || isFull}
                onClick={() => requestToJoin(ride)}
                className={`w-full mt-2 p-2 rounded-lg font-medium transition ${
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