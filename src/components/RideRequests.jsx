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
  const [user, setUser] = useState(null);

  // ✅ Fix: wait for Firebase auth
  useEffect(() => {
    const unsub = auth.onAuthStateChanged(setUser);
    return () => unsub();
  }, []);

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

  // ✅ ACCEPT REQUEST (safe version)
  const acceptRequest = async (req) => {
    const rideRef = doc(db, "rides", req.rideId);
    const profileRef = doc(db, "profiles", req.requestedBy);
    const requestRef = doc(db, "rideRequests", req.id);

    const rideSnap = await getDoc(rideRef);
    if (!rideSnap.exists()) return alert("Ride no longer exists");

    const ride = rideSnap.data();

    if (ride.seats <= 0) {
      await updateDoc(requestRef, { status: "rejected" });
      return alert("Ride already full");
    }

    // Update ride seats + participants
    await updateDoc(rideRef, {
      seats: ride.seats - 1,
      participants: arrayUnion(req.requestedBy)
    });

    // Ensure profile exists, then update
    const profileSnap = await getDoc(profileRef);

    if (!profileSnap.exists()) {
      await setDoc(profileRef, { currentRideId: req.rideId });
    } else {
      await updateDoc(profileRef, { currentRideId: req.rideId });
    }

    // Mark request accepted
    await updateDoc(requestRef, {
      status: "accepted"
    });

    alert("Request accepted");
  };

  // ❌ REJECT REQUEST
  const rejectRequest = async (id) => {
    await updateDoc(doc(db, "rideRequests", id), {
      status: "rejected"
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Ride Join Requests</h2>

      {requests.length === 0 && <p>No pending requests</p>}

      {requests.map(req => (
        <div
          key={req.id}
          style={{ border: "1px solid #444", padding: 10, marginTop: 10 }}
        >
          <p><b>User Email:</b> {req.requestedByEmail}</p>

          <button onClick={() => acceptRequest(req)}>Accept</button>
          <button onClick={() => rejectRequest(req.id)}>Reject</button>
        </div>
      ))}
    </div>
  );
}

export default RideRequests;
