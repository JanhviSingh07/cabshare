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
      const rides = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMyRides(rides);
    });

    return () => unsub();
  }, []);

  const acceptRequest = async (rideId, requesterId) => {
    const rideRef = doc(db, "rides", rideId);

    await updateDoc(rideRef, {
      pendingRequests: arrayRemove(requesterId),
      participants: arrayUnion(requesterId)
    });

    alert("Request Accepted ✅");
  };

  const rejectRequest = async (rideId, requesterId) => {
    const rideRef = doc(db, "rides", rideId);

    await updateDoc(rideRef, {
      pendingRequests: arrayRemove(requesterId)
    });

    alert("Request Rejected ❌");
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Your Created Rides</h2>

      {myRides.length === 0 && <p>You haven’t created any ride yet.</p>}

      {myRides.map(ride => (
        <div key={ride.id} style={{ border: "1px solid gray", padding: 10, marginTop: 10 }}>
          <h3>Ride: {ride.from} → {ride.to}</h3>
          <p>Date: {ride.date} | Time: {ride.time}</p>

          <h4>Join Requests</h4>

          {(!ride.pendingRequests || ride.pendingRequests.length === 0) && (
            <p>No pending requests</p>
          )}

          {ride.pendingRequests?.map(uid => (
            <div key={uid} style={{ marginTop: 5 }}>
              <span>User: {uid}</span>
              <button onClick={() => acceptRequest(ride.id, uid)}>Accept</button>
              <button onClick={() => rejectRequest(ride.id, uid)}>Reject</button>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default RideOwnerDashboard;
