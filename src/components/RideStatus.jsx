import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, onSnapshot, updateDoc, arrayRemove } from "firebase/firestore";

function RideStatus() {
  const [ride, setRide] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [rideId, setRideId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUid, setCurrentUid] = useState(null);

  useEffect(() => {
    let unsubRide = null;
    let unsubProfile = null;

    const unsubAuth = auth.onAuthStateChanged((user) => {
      if (!user) { setLoading(false); return; }
      setCurrentUid(user.uid);

      unsubProfile = onSnapshot(doc(db, "profiles", user.uid), async (profileSnap) => {
        if (!profileSnap.exists()) { setLoading(false); return; }
        const currentRideId = profileSnap.data().currentRideId;
        if (!currentRideId) { setRide(null); setRideId(null); setLoading(false); return; }
        setRideId(currentRideId);
        if (unsubRide) unsubRide();

        unsubRide = onSnapshot(doc(db, "rides", currentRideId), async (rideSnap) => {
          if (!rideSnap.exists()) { setRide(null); setLoading(false); return; }
          const rideData = { id: rideSnap.id, ...rideSnap.data() };
          setRide(rideData);

          const users = await Promise.all(
            (rideData.participants || []).map(async (uid) => {
              try {
                const snap = await new Promise((resolve) => {
                  const unsub = onSnapshot(doc(db, "profiles", uid), (s) => { unsub(); resolve(s); });
                });
                return snap.exists() ? { uid, ...snap.data() } : null;
              } catch { return null; }
            })
          );
          setContacts(users.filter(Boolean));
          setLoading(false);
        });
      });
    });

    return () => {
      unsubAuth();
      if (unsubProfile) unsubProfile();
      if (unsubRide) unsubRide();
    };
  }, []);

  const leaveRide = async () => {
    const user = auth.currentUser;
    if (!user || !ride || !rideId) return;
    try {
      await updateDoc(doc(db, "rides", rideId), { participants: arrayRemove(user.uid), seats: Number(ride.seats) + 1 });
      await updateDoc(doc(db, "profiles", user.uid), { currentRideId: null });
      window.location.reload();
    } catch (err) { alert("Error leaving ride"); }
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center"><p className="text-gray-400">Loading...</p></div>;

  if (!ride) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-900 font-semibold text-lg mb-2">No active ride</p>
        <p className="text-gray-500 text-sm">You are not part of any ride yet</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-6 py-12">

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Ride</h1>
        <p className="text-gray-500 text-sm mb-8">View your active ride details and contact your cab partner</p>

        {/* Ride info */}
        <div className="border border-gray-200 rounded-2xl p-5 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 capitalize mb-1">{ride.from} → {ride.to}</h2>
          <p className="text-sm text-gray-500">{ride.date} · {ride.time}</p>
        </div>

        {/* Members */}
        <div className="mb-4">
          <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Ride Members</h3>

          {contacts.filter(u => u.uid !== currentUid).length === 0 && (
            <div className="border border-gray-200 rounded-2xl p-5 text-center">
              <p className="text-gray-400 text-sm">No other members yet</p>
            </div>
          )}

          {contacts.filter(u => u.uid !== currentUid).map((u, i) => {
            const phone = u.phone || "";
            const waNumber = phone.startsWith("91") ? phone : `91${phone}`;
            const waMessage = encodeURIComponent(
              `Hi ${u.name}! I'm your cab partner for the ride from ${ride.from} to ${ride.to} on ${ride.date} at ${ride.time}. Looking forward to sharing the cab!`
            );
            return (
              <div key={i} className="border border-gray-200 rounded-2xl p-5 mb-3">
                <p className="font-semibold text-gray-900 mb-1">{u.name || "Unknown"}</p>
                <p className="text-sm text-gray-500 mb-4">{phone || "No phone provided"}</p>
                {phone && (
                  <a href={`https://wa.me/${waNumber}?text=${waMessage}`} target="_blank" rel="noopener noreferrer"
                    className="block w-full bg-green-500 hover:bg-green-600 text-white text-center py-2.5 rounded-xl text-sm font-medium transition">
                    Message on WhatsApp
                  </a>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={leaveRide}
          className="w-full border-2 border-red-200 hover:border-red-400 text-red-500 hover:text-red-600 py-3 rounded-xl font-semibold text-sm transition">
          Leave Ride
        </button>

      </div>
    </div>
  );
}

export default RideStatus;