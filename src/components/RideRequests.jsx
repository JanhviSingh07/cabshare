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
  arrayUnion,
  runTransaction
} from "firebase/firestore";

function RideRequests() {
  const [requests, setRequests] = useState([]);
  const [user, setUser] = useState(null);

  // ✅ Wait for auth
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return () => unsub();
  }, []);

  // ✅ Listen for requests
  useEffect(() => {
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
  }, [user]);

  // ✅ ACCEPT REQUEST (FULLY SAFE)
  const acceptRequest = async (req) => {
    const rideRef = doc(db, "rides", req.rideId);
    const requestRef = doc(db, "rideRequests", req.id);
    const profileRef = doc(db, "profiles", req.requestedBy);

    try {
      await runTransaction(db, async (transaction) => {
        const rideSnap = await transaction.get(rideRef);

        if (!rideSnap.exists()) {
          throw new Error("Ride no longer exists");
        }

        const ride = rideSnap.data();

        // ❌ Already full
        if (ride.seats <= 0) {
          transaction.update(requestRef, { status: "rejected" });
          throw new Error("Ride already full");
        }

        // ❌ Already joined (extra safety)
        if (ride.participants.includes(req.requestedBy)) {
          transaction.update(requestRef, { status: "accepted" });
          throw new Error("User already in ride");
        }

        // ✅ SAFE UPDATE (atomic)
        transaction.update(rideRef, {
          seats: ride.seats - 1,
          participants: arrayUnion(req.requestedBy)
        });

        // ✅ Mark request accepted
        transaction.update(requestRef, {
          status: "accepted"
        });

        // ✅ Update profile
        transaction.set(
          profileRef,
          { currentRideId: req.rideId },
          { merge: true }
        );
      });

      alert("Request accepted ✅");

    } catch (err) {
      alert(err.message);
    }
  };

  // ❌ REJECT REQUEST
  const rejectRequest = async (id) => {
    try {
      await updateDoc(doc(db, "rideRequests", id), {
        status: "rejected"
      });
      alert("Request rejected ❌");
    } catch (err) {
      console.error(err);
      alert("Error rejecting request");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Ride Join Requests</h2>

      {requests.length === 0 && <p>No pending requests</p>}

      {requests.map(req => (
        <div
          key={req.id}
          style={{
            border: "1px solid #444",
            padding: 10,
            marginTop: 10
          }}
        >
          <p><b>User Email:</b> {req.requestedByEmail}</p>

          <button onClick={() => acceptRequest(req)}>
            Accept
          </button>

          <button onClick={() => rejectRequest(req.id)}>
            Reject
          </button>
        </div>
      ))}
    </div>
  );
}

export default RideRequests;