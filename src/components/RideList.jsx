import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function RideList({ from, to, date }) {
  const [rides, setRides] = useState([]);

  useEffect(() => {
    if (!from || !to || !date) return;

    const q = query(
      collection(db, "rides"),
      where("from", "==", from),
      where("to", "==", to),
      where("date", "==", date)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setRides(list);
    });

    return () => unsub();
  }, [from, to, date]);

  return (
    <div>
      <h2>Available Rides</h2>

      {rides.map(ride => (
        <div key={ride.id} style={{ border: "1px solid #444", padding: "10px", marginTop: "10px" }}>
          <p><b>From:</b> {ride.from}</p>
          <p><b>To:</b> {ride.to}</p>
          <p><b>Date:</b> {ride.date}</p>
          <p><b>Time:</b> {ride.time}</p>
          <p><b>Seats:</b> {ride.seats}</p>
        </div>
      ))}
    </div>
  );
}

export default RideList;
