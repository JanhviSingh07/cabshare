import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function RideContacts({ ride }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContacts = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Safety check: only load if current user is actually in this ride
        if (!ride.participants.includes(currentUser.uid)) {
          setLoading(false);
          return;
        }

        const users = await Promise.all(
          ride.participants.map(async (uid) => {
            const snap = await getDoc(doc(db, "profiles", uid));

            if (!snap.exists()) {
              return {
                name: "Unknown User",
                phone: "N/A",
              };
            }

            return snap.data();
          })
        );

        setContacts(users);
      } catch (err) {
        console.error("Error loading contacts:", err);
      } finally {
        setLoading(false);
      }
    };

    loadContacts();
  }, [ride]);

  if (loading) return <p>Loading contacts...</p>;

  // If current user is not a participant, show nothing
  if (!ride.participants.includes(auth.currentUser?.uid)) {
    return null;
  }

  return (
    <div style={{ marginTop: 10, padding: 10, border: "1px dashed gray" }}>
      <h4>Ride Members</h4>

      {contacts.length === 0 && <p>No contacts found</p>}

      {contacts.map((u, i) => (
        <p key={i}>
          <b>{u.name || "Unknown"}</b> — 📞 {u.phone || "Not provided"}
        </p>
      ))}
    </div>
  );
}

export default RideContacts;
