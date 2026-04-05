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

      const results = snap.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      setRides(results);

      // ✅ fetch owner names
      const names = {};
      for (let ride of results) {
        try {
          const psnap = await getDoc(doc(db, "profiles", ride.createdBy));
          names[ride.createdBy] = psnap.exists()
            ? psnap.data().name
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
  if (!user) return alert("Login first");

  try {
    if (ride.createdBy === user.uid) {
      return alert("This is your ride");
    }

    if (ride.participants?.includes(user.uid)) {
      return alert("Already joined");
    }

    if (ride.pendingRequests?.includes(user.uid)) {
      return alert("Already requested");
    }

    if (ride.seats <= 0) {
      return alert("Ride full");
    }

    const profileRef = doc(db, "profiles", user.uid);
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      return alert("Complete profile first");
    }

    if (profileSnap.data().currentRideId) {
      return alert("You are already in a ride");
    }

    // 🔥 THIS IS THE REAL FIX
    await updateDoc(doc(db, "rides", ride.id), {
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

      <div className="bg-slate-800 p-6 rounded-xl space-y-4">

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            className="w-full sm:flex-1 p-3 rounded-lg bg-slate-700 text-white"
            placeholder="From"
            value={from}
            onChange={e => setFrom(e.target.value.toLowerCase())}
          />

          <input
            className="w-full sm:flex-1 p-3 rounded-lg bg-slate-700 text-white"
            placeholder="To"
            value={to}
            onChange={e => setTo(e.target.value.toLowerCase())}
          />
        </div>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-3 rounded-lg bg-slate-700 text-white"
        />

        <button
          onClick={searchRides}
          className="w-full bg-blue-500 p-3 rounded-lg"
        >
          {loading ? "Searching..." : "Search Ride 🚀"}
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {rides.map(ride => {
          const user = auth.currentUser;

          const isOwner = ride.createdBy === user?.uid;
          const isJoined = ride.participants?.includes(user?.uid);
          const isRequested = ride.pendingRequests?.includes(user?.uid);
          const isFull = ride.seats <= 0;

          return (
            <div key={ride.id} className="bg-slate-800 p-5 rounded-xl">

              <h3>{ride.from} → {ride.to}</h3>

              <p className="text-gray-400">
                📅 {ride.date} | ⏰ {ride.time}
              </p>

              <p>
                👤 Owner: {ownerNames[ride.createdBy] || "Loading..."}
              </p>

              <p>💺 Seats: {ride.seats}</p>

              <button
                disabled={isOwner || isJoined || isRequested || isFull}
                onClick={() => requestToJoin(ride)}
                className="w-full mt-2 p-2 rounded bg-blue-500"
              >
                {isOwner
                  ? "Your Ride"
                  : isJoined
                  ? "Joined"
                  : isRequested
                  ? "Requested"
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