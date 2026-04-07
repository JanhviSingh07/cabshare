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
    // ✅ onAuthStateChanged se properly wait karo
    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) return;

      const q = query(
        collection(db, "rides"),
        where("createdBy", "==", user.uid)
      );

      const unsubSnap = onSnapshot(q, async (snap) => {
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

      return () => unsubSnap();
    });

    return () => unsubAuth();
  }, []);

  const accept = async (rideId, uid, ride) => {
    try {
       console.log("Accepting ride for uid:", uid);  // ✅ dekho ye sahi uid hai?
    console.log("Ride ID:", rideId);
      // ✅ Ride update karo
      await updateDoc(doc(db, "rides", rideId), {
        pendingRequests: arrayRemove(uid),
        participants: arrayUnion(uid),
        seats: Number(ride.seats) - 1
      });

      // ✅ Requester ka currentRideId set karo
      await updateDoc(doc(db, "profiles", uid), {
        currentRideId: rideId
      });

      // ✅ Creator ka bhi currentRideId set karo — ye missing tha!
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, "profiles", user.uid), {
          currentRideId: rideId
        });
      }

      alert("Request Accepted ✅");
    } catch (err) {
      console.error(err);
      alert("Error accepting request");
    }
  };

  const reject = async (rideId, uid) => {
    try {
      await updateDoc(doc(db, "rides", rideId), {
        pendingRequests: arrayRemove(uid)
      });
      alert("Request Rejected ❌");
    } catch (err) {
      console.error(err);
      alert("Error rejecting request");
    }
  };

  const totalPending = myRides.reduce(
    (acc, r) => acc + (r.pendingRequests?.length || 0), 0
  );

  return (
    <div className="max-w-3xl mx-auto mt-10 px-4">

      <h2 className="text-xl font-semibold mb-6">📩 Ride Requests</h2>

      {totalPending === 0 && (
        <p className="text-center text-gray-400">No pending requests</p>
      )}

      {myRides.map(ride => {
        const pending = ride.pendingRequests || [];
        if (pending.length === 0) return null;

        return (
          <div key={ride.id} className="bg-slate-800 p-5 rounded-xl border border-slate-700 mb-4">

            <h3 className="font-semibold">{ride.from} → {ride.to}</h3>
            <p className="text-sm text-gray-400 mb-3">
              📅 {ride.date} | ⏰ {ride.time}
            </p>

            {pending.map(uid => (
              <div key={uid} className="mt-3 p-3 bg-slate-700 rounded-lg">

                <p className="text-sm mb-2 font-semibold">
                  👤 {names[uid] || "Loading..."}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => accept(ride.id, uid, ride)}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 py-2 rounded-lg"
                  >
                    ✅ Accept
                  </button>

                  <button
                    onClick={() => reject(ride.id, uid)}
                    className="flex-1 bg-red-500 hover:bg-red-600 py-2 rounded-lg"
                  >
                    ❌ Reject
                  </button>
                </div>

              </div>
            ))}
          </div>
        );
      })}

    </div>
  );
}

export default RideRequests;