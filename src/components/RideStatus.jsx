import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function RideStatus() {
  const [ride, setRide] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [rideId, setRideId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRide = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const profileSnap = await getDoc(doc(db, "profiles", user.uid));
      if (!profileSnap.exists()) return setLoading(false);

      const currentRideId = profileSnap.data().currentRideId;
      if (!currentRideId) return setLoading(false);

      setRideId(currentRideId);

      const rideSnap = await getDoc(doc(db, "rides", currentRideId));
      if (!rideSnap.exists()) return setLoading(false);

      const rideData = { id: rideSnap.id, ...rideSnap.data() };
      setRide(rideData);

      // ✅ load contacts only after accepted
      const users = await Promise.all(
        rideData.participants.map(async (uid) => {
          const snap = await getDoc(doc(db, "profiles", uid));
          return snap.exists() ? { uid, ...snap.data() } : null;
        })
      );

      setContacts(users.filter(Boolean));
      setLoading(false);
    };

    fetchRide();
  }, []);

  const user = auth.currentUser;
  const isOwner = ride?.createdBy === user?.uid;

  const leaveRide = async () => {
    const rideRef = doc(db, "rides", rideId);

    const updated = ride.participants.filter(uid => uid !== user.uid);

    await updateDoc(rideRef, {
      participants: updated,
      seats: ride.seats + 1
    });

    await updateDoc(doc(db, "profiles", user.uid), {
      currentRideId: null
    });

    window.location.reload();
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  if (!ride) return <p className="text-center mt-10">No ride</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-2">

      <div className="bg-slate-800 p-6 rounded-xl space-y-3">

        <h2>🚗 Your Ride</h2>

        <p>{ride.from} → {ride.to}</p>
        <p className="text-gray-400">{ride.date} | {ride.time}</p>

        {/* ✅ CONTACTS ONLY AFTER ACCEPT */}
        <div className="mt-4 bg-slate-700 p-4 rounded-lg">
          <h3>📞 Ride Members</h3>

          {contacts
            .filter(u => u.uid !== user.uid) // ❌ remove yourself
            .map((u, i) => {
              const phone = u.phone || "";
              const formatted = phone.startsWith("91")
                ? phone
                : `91${phone}`;

              return (
                <div key={i} className="bg-slate-600 p-3 rounded mb-2">

                  👤 {u.name}
                  <br />
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

        {/* ✅ ACTION */}
        <button
          onClick={leaveRide}
          className="w-full bg-yellow-500 p-2 rounded"
        >
          Leave Ride 🚪
        </button>

      </div>
    </div>
  );
}

export default RideStatus;