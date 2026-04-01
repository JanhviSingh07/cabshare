import { useState } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, Timestamp } from "firebase/firestore";

function CreateRide() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [seats, setSeats] = useState(1);

  const createRide = async () => {
    const user = auth.currentUser;
    if (!user) return alert("No user logged in");

    // Basic validation
    if (!from || !to || !date || !time) {
      return alert("Please fill all fields");
    }

    try {
      await addDoc(collection(db, "rides"), {
        from,
        to,
        date,
        time,
        seats,
        createdBy: user.uid,
        participants: [user.uid],      // owner is first participant
        pendingRequests: [],           // <---- IMPORTANT for join requests
        createdAt: Timestamp.now(),
      });

      alert("Ride created successfully");

      // reset fields
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
    <div style={{ padding: "20px" }}>
      <h2>Create Ride</h2>

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
      />

      <button onClick={createRide}>Create Ride</button>
    </div>
  );
}

export default CreateRide;
