import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, Timestamp, doc, getDoc, setDoc } from "firebase/firestore";

function CreateRide() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState(1);

  const createRide = async () => {
    const user = auth.currentUser;
    if (!user) return alert("No user logged in");

    // 🔒 CHECK: already in a ride
    const profileRef = doc(db, "profiles", user.uid);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists() && profileSnap.data().currentRideId) {
      return alert("You are already in a ride");
    }

    // validation
    if (!from || !to || !date || !time) {
      return alert("Please fill all fields");
    }

    try {
      // ✅ create ride
      const docRef = await addDoc(collection(db, "rides"), {
        from,
        to,
        date,
        time,
        seats,
        createdBy: user.uid,
        createdByEmail: user.email,
        participants: [user.uid],
        pendingRequests: [],
        createdAt: Timestamp.now(),
      });

      // ✅ update profile (VERY IMPORTANT)
      await setDoc(profileRef, {
        currentRideId: docRef.id
      }, { merge: true });

      alert("Ride created successfully 🚀");

      // reset
      setFrom("");
      setTo("");
      setDate("");
      setTime("");
      setSeats(1);

    } catch (err) {
      console.error(err);
      alert("Error creating ride");
    }
  };

  return (
    <div className="container">
      <h2>🚗 Create Ride</h2>

      <div className="card">
        <div className="input-group">
          <input
            placeholder="From"
            value={from}
            onChange={e => setFrom(e.target.value)}
          />

          <input
            placeholder="To"
            value={to}
            onChange={e => setTo(e.target.value)}
          />

          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />

          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
          />

          <input
            type="number"
            min="1"
            value={seats}
            onChange={e => setSeats(Number(e.target.value))}
            placeholder="Seats"
          />
        </div>

        <button className="btn-success" onClick={createRide}>
          Create Ride 🚀
        </button>
      </div>
    </div>
  );
}

export default CreateRide;