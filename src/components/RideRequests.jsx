import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc
} from "firebase/firestore";

function RideRequests() {
  const [myRides, setMyRides] = useState([]);
  const [names, setNames] = useState({});

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "rides"),
      where("createdBy", "==", user.uid)
    );

    const unsub = onSnapshot(q, async (snap) => {
      const rides = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMyRides(rides);

      const map = {};
      for (let r of rides) {
        for (let uid of (r.pendingRequests || [])) {
          const s = await getDoc(doc(db, "profiles", uid));
          map[uid] = s.exists() ? s.data().name : "User";
        }
      }
      setNames(map);
    });

    return () => unsub();
  }, []);

  const accept = async (rideId, uid, ride) => {
    await updateDoc(doc(db, "rides", rideId), {
      pendingRequests: arrayRemove(uid),
      participants: arrayUnion(uid),
      seats: ride.seats - 1
    });
  };

  const reject = async (rideId, uid) => {
    await updateDoc(doc(db, "rides", rideId), {
      pendingRequests: arrayRemove(uid)
    });
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">

      <h2 className="text-xl font-semibold mb-6">Ride Requests</h2>

      {myRides.map(ride => (
        <div key={ride.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 mb-4">

          <h3 className="font-semibold">{ride.from} → {ride.to}</h3>

          {(ride.pendingRequests || []).map(uid => (
            <div key={uid} className="mt-3 p-3 bg-slate-700 rounded-lg">

              <p className="text-sm mb-2">
                {names[uid] || "User"}
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => accept(ride.id, uid, ride)}
                  className="flex-1 bg-emerald-500 py-2 rounded-lg"
                >
                  Accept
                </button>

                <button
                  onClick={() => reject(ride.id, uid)}
                  className="flex-1 bg-red-500 py-2 rounded-lg"
                >
                  Reject
                </button>
              </div>

            </div>
          ))}
        </div>
      ))}

    </div>
  );
}

export default RideRequests;