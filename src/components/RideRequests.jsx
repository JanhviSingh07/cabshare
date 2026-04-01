import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  arrayUnion
} from "firebase/firestore";

function RideRequests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "rideRequests"),
      where("rideOwner", "==", user.uid),
      where("status", "==", "pending")
    );

    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, []);

  // ✅ ACCEPT
  const acceptRequest = async (req) => {
    try {
      const rideRef = doc(db, "rides", req.rideId);
      const requestRef = doc(db, "rideRequests", req.id);
      const profileRef = doc(db, "profiles", req.requestedBy);

      const rideSnap = await getDoc(rideRef);
      if (!rideSnap.exists()) return alert("Ride not found");

      const ride = rideSnap.data();

      if (ride.seats <= 0) {
        await updateDoc(requestRef, { status: "rejected" });
        return alert("Ride full");
      }

      // update ride
      await updateDoc(rideRef, {
        seats: ride.seats - 1,
        participants: arrayUnion(req.requestedBy)
      });

      // update profile
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        await setDoc(profileRef, { currentRideId: req.rideId });
      } else {
        await updateDoc(profileRef, { currentRideId: req.rideId });
      }

      // update request
      await updateDoc(requestRef, { status: "accepted" });

      alert("Accepted ✅");

    } catch (err) {
      console.error(err);
      alert("Error");
    }
  };

  // ❌ REJECT
  const rejectRequest = async (id) => {
    await updateDoc(doc(db, "rideRequests", id), {
      status: "rejected"
    });
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">

      <h2 className="text-2xl font-bold text-center mb-6">
        📩 Ride Requests
      </h2>

      {requests.length === 0 && (
        <p className="text-center text-gray-400">
          No pending requests
        </p>
      )}

      <div className="space-y-4">
        {requests.map(req => (
          <div
            key={req.id}
            className="bg-slate-800 p-5 rounded-xl shadow-md"
          >
            {/* USER INFO */}
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="font-semibold">
                  {req.requestedByEmail}
                </p>
                <p className="text-sm text-gray-400">
                  Wants to join your ride
                </p>
              </div>

              <span className="text-yellow-400 text-sm">
                Pending
              </span>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex gap-3">
              <button
                onClick={() => acceptRequest(req)}
                className="flex-1 bg-green-500 hover:bg-green-600 p-2 rounded-lg font-medium"
              >
                ✅ Accept
              </button>

              <button
                onClick={() => rejectRequest(req.id)}
                className="flex-1 bg-red-500 hover:bg-red-600 p-2 rounded-lg font-medium"
              >
                ❌ Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RideRequests;