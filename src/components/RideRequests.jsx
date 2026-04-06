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
  const [requesterNames, setRequesterNames] = useState({});

useEffect(() => {
  const unsubAuth = auth.onAuthStateChanged((user) => {
    if (!user) return;

    const q = query(
      collection(db, "rides"),
      where("createdBy", "==", user.uid)
    );

    const unsubSnap = onSnapshot(q, async (snap) => {
      const rides = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMyRides(rides);

      const allUids = rides.flatMap(r => r.pendingRequests || []);
      const uniqueUids = [...new Set(allUids)];
      const nameMap = {};
      await Promise.all(
        uniqueUids.map(async (uid) => {
          try {
            const s = await getDoc(doc(db, "profiles", uid));
            nameMap[uid] = s.exists() ? s.data().name : uid;
          } catch {
            nameMap[uid] = uid;
          }
        })
      );
      setRequesterNames(nameMap);
    });

    return () => unsubSnap();
  });

  return () => unsubAuth();
}, []);
  const acceptRequest = async (rideId, requesterId, ride) => {
    try {
      await updateDoc(doc(db, "rides", rideId), {
        pendingRequests: arrayRemove(requesterId),
        participants: arrayUnion(requesterId),
        seats: Number(ride.seats) - 1  // ✅ FIX 2: Number() wrap karo
      });

      await updateDoc(doc(db, "profiles", requesterId), {
        currentRideId: rideId
      });

      alert("Request Accepted ✅");
    } catch (err) {
      console.error(err);
      alert("Error accepting request");
    }
  };

  const rejectRequest = async (rideId, requesterId) => {
    try {
      await updateDoc(doc(db, "rides", rideId), {
        pendingRequests: arrayRemove(requesterId)
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
    <div className="max-w-4xl mx-auto mt-10 px-2">
      <h2 className="text-2xl font-bold text-center mb-6">
        📩 Ride Requests
      </h2>

      {totalPending === 0 && (
        <p className="text-center text-gray-400">No requests yet</p>
      )}

      <div className="space-y-4">
        {myRides.map((ride) => {
          const pending = ride.pendingRequests || [];
          if (pending.length === 0) return null;

          return (
            <div key={ride.id} className="bg-slate-800 p-5 rounded-xl">
              <h3 className="text-lg font-semibold">
                {ride.from} → {ride.to}
              </h3>
              <p className="text-sm text-gray-400 mb-3">
                📅 {ride.date} | ⏰ {ride.time}
              </p>

              {pending.map((uid) => (
                <div key={uid} className="mt-2 p-3 bg-slate-700 rounded-lg">
                  <p className="text-sm mb-2">
                    👤 {requesterNames[uid] || "Loading..."}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => acceptRequest(ride.id, uid, ride)}
                      className="flex-1 bg-green-500 hover:bg-green-600 p-2 rounded-lg"
                    >
                      ✅ Accept
                    </button>
                    <button
                      onClick={() => rejectRequest(ride.id, uid)}
                      className="flex-1 bg-red-500 hover:bg-red-600 p-2 rounded-lg"
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
    </div>
  );
}

export default RideRequests;