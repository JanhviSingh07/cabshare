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
  arrayRemove
} from "firebase/firestore";

function RideOwnerDashboard() {
  const [myRides, setMyRides] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "rides"),
      where("createdBy", "==", user.uid)
    );

    const unsub = onSnapshot(q, (snap) => {
      const rides = snap.docs.map((d) => ({
        id: d.id,
        ...d.data()
      }));
      setMyRides(rides);
    });

    return () => unsub();
  }, []);

  // ✅ ACCEPT REQUEST (FIXED)
  const acceptRequest = async (rideId, requesterId, ride) => {
    try {
      const rideRef = doc(db, "rides", rideId);

      await updateDoc(rideRef, {
        pendingRequests: arrayRemove(requesterId),
        participants: arrayUnion(requesterId),
        seats: ride.seats - 1
      });

      // 🔥 update user profile
      await updateDoc(doc(db, "profiles", requesterId), {
        currentRideId: rideId
      });

      alert("Request Accepted ✅");
    } catch (err) {
      console.error(err);
      alert("Error accepting request");
    }
  };

  // ❌ REJECT
  const rejectRequest = async (rideId, requesterId) => {
    try {
      const rideRef = doc(db, "rides", rideId);

      await updateDoc(rideRef, {
        pendingRequests: arrayRemove(requesterId)
      });

      alert("Request Rejected ❌");
    } catch (err) {
      console.error(err);
      alert("Error rejecting request");
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 px-2">

      <h2 className="text-2xl font-bold text-center mb-6">
        🚗 Your Created Rides
      </h2>

      {myRides.length === 0 && (
        <p className="text-center text-gray-400">
          You haven’t created any ride yet.
        </p>
      )}

      <div className="space-y-4">
        {myRides.map((ride) => (
          <div key={ride.id} className="bg-slate-800 p-5 rounded-xl">

            <h3 className="text-lg font-semibold">
              {ride.from} → {ride.to}
            </h3>

            <p className="text-sm text-gray-400">
              📅 {ride.date} | ⏰ {ride.time}
            </p>

            <h4 className="mt-3 font-medium">Join Requests</h4>

            {(!ride.pendingRequests || ride.pendingRequests.length === 0) && (
              <p className="text-gray-400 text-sm">
                No pending requests
              </p>
            )}

            {ride.pendingRequests?.map((uid) => (
              <div key={uid} className="mt-3 p-3 bg-slate-700 rounded-lg">

                <p className="text-sm mb-2">👤 User: {uid}</p>

                <div className="flex flex-col sm:flex-row gap-2">
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
        ))}
      </div>
    </div>
  );
}

export default RideOwnerDashboard;