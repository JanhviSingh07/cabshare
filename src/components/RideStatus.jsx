import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function RideStatus() {
  const [ride, setRide] = useState(null);
  const [rideId, setRideId] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRide = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const profileSnap = await getDoc(doc(db, "profiles", user.uid));
        if (!profileSnap.exists()) return setLoading(false);

        const profile = profileSnap.data();
        if (!profile.currentRideId) return setLoading(false);

        setRideId(profile.currentRideId);

        const rideSnap = await getDoc(
          doc(db, "rides", profile.currentRideId)
        );

        if (rideSnap.exists()) {
          const rideData = { id: rideSnap.id, ...rideSnap.data() };
          setRide(rideData);

          const users = await Promise.all(
            rideData.participants.map(async (uid) => {
              const snap = await getDoc(doc(db, "profiles", uid));
              return snap.exists() ? snap.data() : null;
            })
          );

          setContacts(users.filter(Boolean));
        }

      } catch (err) {
        console.error(err);
        alert("Error loading ride");
      }

      setLoading(false);
    };

    fetchRide();
  }, []);

  const user = auth.currentUser;
  const isOwner = ride?.createdBy === user?.uid;

  if (loading) {
    return <p className="text-center mt-10 text-gray-400">Loading...</p>;
  }

  if (!ride) {
    return <p className="text-center mt-10 text-gray-400">No active ride 🚫</p>;
  }

  return (
    <div className="max-w-3xl mx-auto mt-10 px-2">

      <div className="bg-slate-800 p-6 rounded-xl space-y-3">

        <h2 className="text-xl font-bold">🚗 Your Ride</h2>

        <p>{ride.from} → {ride.to}</p>
        <p className="text-gray-400">📅 {ride.date} | ⏰ {ride.time}</p>

        {/* 🔒 SHOW ONLY AFTER ACCEPT */}
        {ride.participants.includes(user.uid) ? (

          <div className="mt-4 bg-slate-700 p-4 rounded-lg">
            <h3 className="font-semibold mb-3">📞 Ride Members</h3>

            {contacts
              .filter((u) => u.uid !== user.uid) // hide yourself
              .map((u, i) => {
                const phone = u.phone || "";
                const formatted = phone.startsWith("91") ? phone : `91${phone}`;

                return (
                  <div key={i} className="bg-slate-600 p-3 rounded-lg mb-2">

                    👤 {u.name} <br />
                    📱 {phone}

                    <a
                      href={`https://wa.me/${formatted}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block mt-2 bg-green-500 text-center p-1 rounded"
                    >
                      WhatsApp 📲
                    </a>

                  </div>
                );
              })}
          </div>

        ) : (
          <p className="text-gray-400 text-center mt-3">
            Contact details visible after acceptance ⏳
          </p>
        )}

      </div>
    </div>
  );
}

export default RideStatus;