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

    try {
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

    } catch (err) {
      console.error(err);
      alert("Error fetching rides");
    }
  };

  // 📩 Request to join ride
  const requestToJoin = async (ride) => {
    const user = auth.currentUser;
    if (!user) return alert("Login first");

    try {
      if (ride.createdBy === user.uid) {
        return alert("You cannot join your own ride");
      }

      if (ride.seats <= 0) {
        return alert("Ride is already full");
      }

      if (ride.participants?.includes(user.uid)) {
        return alert("You are already in this ride");
      }

      const profileRef = doc(db, "profiles", user.uid);
      const profileSnap = await getDoc(profileRef);

      if (profileSnap.exists() && profileSnap.data().currentRideId) {
        return alert("You are already in another ride");
      }

      const existingReq = query(
        collection(db, "rideRequests"),
        where("rideId", "==", ride.id),
        where("requestedBy", "==", user.uid),
        where("status", "==", "pending")
      );

      const reqSnap = await getDocs(existingReq);
      if (!reqSnap.empty) {
        return alert("You have already requested this ride");
      }

      await addDoc(collection(db, "rideRequests"), {
        rideId: ride.id,
        rideOwner: ride.createdBy,
        requestedBy: user.uid,
        requestedByEmail: user.email,
        status: "pending",
        createdAt: Timestamp.now()
      });

      alert("Request sent 🚀");

    } catch (err) {
      console.error(err);
      alert("Error sending request");
    }
  };

  return (
    <div className="container">
      <h2>🚖 Search Ride</h2>

      {/* SEARCH FORM */}
      <div className="card">
        <div className="input-group">
          <input placeholder="From" value={from} onChange={e => setFrom(e.target.value)} />
          <input placeholder="To" value={to} onChange={e => setTo(e.target.value)} />
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
          <input type="time" value={time} onChange={e => setTime(e.target.value)} />
        </div>

        <button className="btn-success" onClick={searchRides}>
          Search 🚀
        </button>
      </div>

      {/* RESULTS */}
      <h3>Available Rides</h3>

      {rides.length === 0 && <p>No rides found</p>}

      {rides.map(ride => {
        const user = auth.currentUser;
        const isOwner = ride.createdBy === user?.uid;
        const isJoined = ride.participants?.includes(user?.uid);
        const isFull = ride.seats <= 0;

        return (
          <div key={ride.id} className="card">
            <h3>{ride.from} → {ride.to}</h3>

            <p>📅 {ride.date} | ⏰ {ride.time}</p>
            <p>👥 Participants: {ride.participants?.length || 0}</p>
            <p>🪑 Seats Left: {ride.seats}</p>
            <p>👤 Owner: {ride.createdByEmail || "N/A"}</p>

            <button
              className="btn-primary"
              disabled={isOwner || isJoined || isFull}
              onClick={() => requestToJoin(ride)}
            >
              {isOwner
                ? "Your Ride"
                : isJoined
                ? "Joined"
                : isFull
                ? "Full"
                : "Request to Join"}
            </button>
          </div>
        );
      })}
    </div>
  );
}

export default SearchRide;