import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  getDoc,
  updateDoc,
  arrayRemove
} from "firebase/firestore";

function RideStatus() {
  const [myRide, setMyRide] = useState(null);
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "rides"),
      where("participants", "array-contains", user.uid)
    );

    const unsub = onSnapshot(q, async (snap) => {
      if (snap.empty) {
        setMyRide(null);
        return;
      }

      const ride = { id: snap.docs[0].id, ...snap.docs[0].data() };
      setMyRide(ride);

      const users = [];

      for (let uid of ride.participants) {
        const profileRef = doc(db, "profiles", uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          users.push({
            uid,
            name: profileSnap.data().name || "User",
            phone: profileSnap.data().phone || "N/A"
          });
        }
      }

      setContacts(users);
    });

    return () => unsub();
  }, []);

  // 🔥 LEAVE RIDE FUNCTION
  const leaveRide = async () => {
    const user = auth.currentUser;
    if (!user || !myRide) return;

    try {
      const rideRef = doc(db, "rides", myRide.id);

      // remove user + increase seats
      await updateDoc(rideRef, {
        participants: arrayRemove(user.uid),
        seats: myRide.seats + 1
      });

      // clear profile
      const profileRef = doc(db, "profiles", user.uid);
      await updateDoc(profileRef, {
        currentRideId: null
      });

      alert("You left the ride");

    } catch (err) {
      console.error(err);
      alert("Error leaving ride");
    }
  };

  return (
    <div className="container">
      <h2>📊 Your Ride Status</h2>

      {!myRide && (
        <p style={{ textAlign: "center", opacity: 0.7 }}>
          😕 You have not joined any ride yet.
        </p>
      )}

      {myRide && (
        <div className="card">
          <h3>{myRide.from} → {myRide.to}</h3>

          <p>📅 {myRide.date}</p>
          <p>⏰ {myRide.time}</p>
          <p>🪑 Seats Left: {myRide.seats}</p>

          <h3>👥 Ride Members</h3>

          {contacts.map(c => (
            <p key={c.uid}>
              <b>{c.name}</b> — 📞 {c.phone}
            </p>
          ))}

          {/* 🔥 LEAVE BUTTON */}
          <button
            className="btn-danger"
            onClick={leaveRide}
            style={{ marginTop: "15px" }}
          >
            ❌ Leave Ride
          </button>
        </div>
      )}
    </div>
  );
}

export default RideStatus;