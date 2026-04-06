import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function RideStatus() {
  const [ride, setRide] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [rideId, setRideId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const profileSnap = await getDoc(doc(db, "profiles", user.uid));
        if (!profileSnap.exists()) {
          setLoading(false);
          return;
        }

        const currentRideId = profileSnap.data().currentRideId;
        if (!currentRideId) {
          setLoading(false);
          return;
        }

        setRideId(currentRideId);

        const rideSnap = await getDoc(doc(db, "rides", currentRideId));
        if (!rideSnap.exists()) {
          setLoading(false);
          return;
        }

        const rideData = { id: rideSnap.id, ...rideSnap.data() };
        setRide(rideData);

        const users = await Promise.all(
          rideData.participants.map(async (uid) => {
            const snap = await getDoc(doc(db, "profiles", uid));
            return snap.exists() ? { uid, ...snap.data() } : null;
          })
        );

        setContacts(users.filter(Boolean));
      } catch (err) {
        console.error(err);
      }

      setLoading(false);
    });

    return () => unsubAuth();
  }, []);

  const leaveRide = async () => {
    const user = auth.currentUser;
    if (!user || !ride) return;

    const rideRef = doc(db, "rides", rideId);
    const updated = ride.participants.filter(uid => uid !== user.uid);

    await updateDoc(rideRef, {
      participants: updated,
      seats: Number(ride.seats) + 1
    });

    await updateDoc(doc(db, "profiles", user.uid), {
      currentRideId: null
    });

    window.location.reload();
  };

  if (loading) return <p className="text-center mt-10 text-white">Loading...</p>;
  if (!ride) return <p className="text-center mt-10 text-white">No active ride found</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-2">
      <div className="bg-slate-800 p-6 rounded-xl space-y-3">

        <h2 className="text-xl font-bold text-white">🚗 Your Ride</h2>
        <p className="text-lg text-white">{ride.from} → {ride.to}</p>
        <p className="text-gray-400">{ride.date} | {ride.time}</p>

        <div className="mt-4 bg-slate-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-3 text-white">📞 Ride Members</h3>

          {contacts.filter(u => u.uid !== auth.currentUser?.uid).length === 0 && (
            <p className="text-gray-400 text-sm">No other members yet</p>
          )}

          {contacts
            .filter(u => u.uid !== auth.currentUser?.uid)
            .map((u, i) => {
              const phone = u.phone || "";
              const waNumber = phone.startsWith("91") ? phone : `91${phone}`;
              const waMessage = encodeURIComponent(
                `Hi ${u.name}! I'm your cab partner for the ride from ${ride.from} to ${ride.to} on ${ride.date} at ${ride.time}. Looking forward to sharing the cab! 🚖`
              );

              return (
                <div key={i} className="bg-slate-600 p-4 rounded-lg mb-3">
                  <p className="font-semibold text-white">👤 {u.name || "Unknown"}</p>
                  <p className="text-gray-300 text-sm mt-1">📱 {phone || "Not provided"}</p>
                  {phone && (
                    <a
                      href={`https://wa.me/${waNumber}?text=${waMessage}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 w-full bg-green-500 hover:bg-green-600 text-white text-center py-2 px-4 rounded-lg block font-medium"
                    >
                      💬 WhatsApp
                    </a>
                  )}
                </div>
              );
            })}
        </div>

        <button
          onClick={leaveRide}
          className="w-full bg-yellow-500 hover:bg-yellow-600 p-3 rounded-lg font-semibold text-white"
        >
          Leave Ride 🚪
        </button>

      </div>
    </div>
  );
}

export default RideStatus;