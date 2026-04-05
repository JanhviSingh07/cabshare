import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";

function RideStatus() {
  const [ride, setRide] = useState(null);
  const [rideId, setRideId] = useState(null);
  const [contacts, setContacts] = useState([]); // 🔥 NEW
  const [loading, setLoading] = useState(true);

  // 🔍 FETCH CURRENT RIDE + CONTACTS
  useEffect(() => {
    const fetchRide = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const profileSnap = await getDoc(doc(db, "profiles", user.uid));
        if (!profileSnap.exists()) {
          setLoading(false);
          return;
        }

        const profile = profileSnap.data();

        if (!profile.currentRideId) {
          setLoading(false);
          return;
        }

        setRideId(profile.currentRideId);

        const rideSnap = await getDoc(
          doc(db, "rides", profile.currentRideId)
        );

        if (rideSnap.exists()) {
          const rideData = { id: rideSnap.id, ...rideSnap.data() };
          setRide(rideData);

          // 🔥 LOAD CONTACTS (NAME + PHONE)
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

  // 🚪 LEAVE RIDE
  const leaveRide = async () => {
    const user = auth.currentUser;

    try {
      const rideRef = doc(db, "rides", rideId);
      const rideSnap = await getDoc(rideRef);

      if (!rideSnap.exists()) return;

      const rideData = rideSnap.data();

      const updatedParticipants = rideData.participants.filter(
        (uid) => uid !== user.uid
      );

      await updateDoc(rideRef, {
        participants: updatedParticipants,
        seats: rideData.seats + 1
      });

      await updateDoc(doc(db, "profiles", user.uid), {
        currentRideId: null
      });

      alert("Left ride ❌");
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert("Error leaving ride");
    }
  };

  // ❌ CANCEL RIDE (OWNER)
  const cancelRide = async () => {
    try {
      const rideRef = doc(db, "rides", rideId);
      const rideSnap = await getDoc(rideRef);

      if (!rideSnap.exists()) return;

      const rideData = rideSnap.data();

      // clear all users
      for (let uid of rideData.participants) {
        await updateDoc(doc(db, "profiles", uid), {
          currentRideId: null
        });
      }

      await updateDoc(rideRef, {
        cancelled: true
      });

      alert("Ride cancelled ❌");
      window.location.reload();

    } catch (err) {
      console.error(err);
      alert("Error cancelling ride");
    }
  };

  // 🔄 LOADING
  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-400">
        Loading ride...
      </p>
    );
  }

  // ❌ NO RIDE
  if (!ride) {
    return (
      <p className="text-center mt-10 text-gray-400">
        No active ride 🚫
      </p>
    );
  }

  const user = auth.currentUser;
  const isOwner = ride.createdBy === user.uid;

  return (
    <div className="max-w-3xl mx-auto mt-10 px-2 sm:px-0">

      <div className="bg-slate-800 p-6 rounded-xl shadow-lg space-y-3">

        <h2 className="text-xl font-bold">
          🚗 Your Ride
        </h2>

        <p className="text-lg">
          {ride.from} → {ride.to}
        </p>

        <p className="text-gray-400">
          📅 {ride.date} | ⏰ {ride.time}
        </p>

        <p>
          💺 Seats left: {ride.seats}
        </p>

        <p className="text-sm text-gray-400">
          👥 Participants: {ride.participants?.length || 0}
        </p>

        {/* 📞 CONTACTS */}
        {contacts.length > 0 && (
          <div className="mt-4 bg-slate-700 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">📞 Ride Members</h3>

            {contacts.map((u, i) => (
              <div key={i} className="text-sm text-gray-200">
                👤 {u.name || "User"} — 📱 {u.phone || "Not available"}
              </div>
            ))}
          </div>
        )}

        {/* 🔥 ACTION BUTTON */}
        <button
          onClick={isOwner ? cancelRide : leaveRide}
          className={`mt-4 w-full p-3 rounded-lg font-medium transition ${
            isOwner
              ? "bg-red-500 hover:bg-red-600"
              : "bg-yellow-500 hover:bg-yellow-600"
          }`}
        >
          {isOwner ? "Cancel Ride ❌" : "Leave Ride 🚪"}
        </button>

      </div>
    </div>
  );
}

export default RideStatus;