import { useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp,
  doc,
  getDoc
} from "firebase/firestore";

function SearchRide() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  const [rides, setRides] = useState([]);

  // 🔍 Search rides
  const searchRides = async () => {
    if (!from || !to || !date) {
      return alert("Enter From, To and Date");
    }

    const q = query(
      collection(db, "rides"),
      where("from", "==", from),
      where("to", "==", to),
      where("date", "==", date)
    );

    const snapshot = await getDocs(q);

    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    setRides(results);
  };

  // 📩 Request to join ride (CORRECT WAY)
  const requestToJoin = async (ride) => {
    const user = auth.currentUser;
    if (!user) return alert("Login first");

    // Check if user already in a ride
    const profileRef = doc(db, "profiles", user.uid);
    const profileSnap = await getDoc(profileRef);

    if (profileSnap.exists() && profileSnap.data().currentRideId) {
      return alert("You are already in another ride");
    }

    // Check if already requested
    const existingReq = query(
      collection(db, "rideRequests"),
      where("rideId", "==", ride.id),
      where("requestedBy", "==", user.uid),
      where("status", "==", "pending")
    );

    const reqSnap = await getDocs(existingReq);
    if (!reqSnap.empty) {
      return alert("You have already requested to join this ride");
    }

    // Create join request document (THIS IS WHAT OWNER LISTENS TO)
    await addDoc(collection(db, "rideRequests"), {
      rideId: ride.id,
      rideOwner: ride.createdBy,
      requestedBy: user.uid,
      requestedByEmail: user.email,
      status: "pending",
      createdAt: Timestamp.now()
    });

    alert("Join request sent to ride owner");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Search Ride</h2>

      <input placeholder="From" value={from} onChange={e => setFrom(e.target.value)} />
      <input placeholder="To" value={to} onChange={e => setTo(e.target.value)} />
      <input type="date" value={date} onChange={e => setDate(e.target.value)} />
      <input type="time" value={time} onChange={e => setTime(e.target.value)} />

      <button onClick={searchRides}>Search</button>

      <hr />

      <h3>Available Rides</h3>

      {rides.length === 0 && <p>No rides found</p>}

      {rides.map(ride => (
        <div key={ride.id} style={{ border: "1px solid gray", padding: 10, marginTop: 10 }}>
          <p><b>From:</b> {ride.from}</p>
          <p><b>To:</b> {ride.to}</p>
          <p><b>Date:</b> {ride.date}</p>
          <p><b>Time:</b> {ride.time}</p>
          <p><b>Seats:</b> {ride.seats}</p>

          <button onClick={() => requestToJoin(ride)}>
            Request to Join
          </button>
        </div>
      ))}
    </div>
  );
}

export default SearchRide;
