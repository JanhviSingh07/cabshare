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

  const searchRides = async () => {
    const q = query(
      collection(db, "rides"),
      where("from", "==", from.toLowerCase()),
      where("to", "==", to.toLowerCase()),
      where("date", "==", date)
    );

    const snap = await getDocs(q);
    const results = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    setRides(results);

    const names = {};
    for (let ride of results) {
      const psnap = await getDoc(doc(db, "profiles", ride.createdBy));
      names[ride.createdBy] = psnap.exists()
        ? psnap.data().name
        : "User";
    }
    setOwnerNames(names);
  };

  const requestToJoin = async (ride) => {
    const user = auth.currentUser;

    await updateDoc(doc(db, "rides", ride.id), {
      pendingRequests: arrayUnion(user.uid)
    });

    alert("Request sent");
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">

      <h2 className="text-xl font-semibold mb-6">Find a Ride</h2>

      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">

        <div className="flex gap-3">
          <input className="w-full p-3 bg-slate-700 rounded-lg" placeholder="From" value={from} onChange={e => setFrom(e.target.value)} />
          <input className="w-full p-3 bg-slate-700 rounded-lg" placeholder="To" value={to} onChange={e => setTo(e.target.value)} />
        </div>

        <input type="date" className="w-full p-3 bg-slate-700 rounded-lg" value={date} onChange={(e) => setDate(e.target.value)} />

        <button onClick={searchRides} className="w-full bg-blue-600 py-2 rounded-lg">
          Search Ride
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {rides.map(ride => (
          <div key={ride.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700">

            <h3 className="font-semibold">{ride.from} → {ride.to}</h3>
            <p className="text-gray-400 text-sm">{ride.date} | {ride.time}</p>
            <p className="text-sm mt-1">Owner: {ownerNames[ride.createdBy]}</p>
            <p className="text-sm">Seats: {ride.seats}</p>

            <button
              onClick={() => requestToJoin(ride)}
              className="w-full mt-3 bg-blue-600 py-2 rounded-lg"
            >
              Request to Join
            </button>

          </div>
        ))}
      </div>
    </div>
  );
}

export default SearchRide;