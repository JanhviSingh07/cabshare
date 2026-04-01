import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, doc, getDoc } from "firebase/firestore";

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

      // Fetch phone numbers of all participants
      const phoneNumbers = [];

      for (let uid of ride.participants) {
        const profileRef = doc(db, "profiles", uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          phoneNumbers.push({
            uid,
            phone: profileSnap.data().phone || "Not available"
          });
        }
      }

      setContacts(phoneNumbers);
    });

    return () => unsub();
  }, []);

  return (
    <div style={{ padding: "30px" }}>
      <h2>Your Ride Status</h2>

      {!myRide && <p>You have not joined any ride yet.</p>}

      {myRide && (
        <div style={{ border: "1px solid gray", padding: 10 }}>
          <h3>Ride Details</h3>
          <p>From: {myRide.from}</p>
          <p>To: {myRide.to}</p>
          <p>Date: {myRide.date}</p>
          <p>Time: {myRide.time}</p>

          <h3>Ride Members (Contacts Visible)</h3>
          {contacts.map(c => (
            <p key={c.uid}>User: {c.uid} | Phone: {c.phone}</p>
          ))}
        </div>
      )}
    </div>
  );
}

export default RideStatus;
