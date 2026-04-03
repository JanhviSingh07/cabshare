import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot
} from "firebase/firestore";

function RideStatus() {
  const [ride, setRide] = useState(null);
  const [rideId, setRideId] = useState(null);

  useEffect(() => {
    const fetchRide = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const profileSnap = await getDoc(doc(db, "profiles", user.uid));
      if (!profileSnap.exists()) return;

      const profile = profileSnap.data();

      if (!profile.currentRideId) return;

      setRideId(profile.currentRideId);

      const rideSnap = await getDoc(
        doc(db, "rides", profile.currentRideId)
      );

      if (rideSnap.exists()) {
        setRide({ id: rideSnap.id, ...rideSnap.data() });
      }
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

      // remove user from participants
      const updatedParticipants = rideData.participants.filter(
        (uid) => uid !== user.uid
      );

      await updateDoc(rideRef, {
        participants: updatedParticipants,
        seats: rideData.seats + 1
      });

      // clear user profile
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

      // clear all participants
      for (let uid of rideData.participants) {
        await updateDoc(doc(db, "profiles", uid), {
          currentRideId: null
        });
      }

      // mark ride as cancelled
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

  if (!ride) {
    return (
      <p className="text-center mt-10 text-gray-400">
        No active ride
      </p>
    );
  }

  const user = auth.currentUser;
  const isOwner = ride.createdBy === user.uid;

  return (
    <div className="max-w-3xl mx-auto mt-10">

      <div className="bg-slate-800 p-6 rounded-xl shadow-lg">

        <h2 className="text-xl font-bold mb-3">
          🚗 Your Ride
        </h2>

        <p>{ride.from} → {ride.to}</p>
        <p>📅 {ride.date} | ⏰ {ride.time}</p>
        <p>💺 Seats left: {ride.seats}</p>

        {/* 🔥 ACTION BUTTON */}
        <button
          onClick={isOwner ? cancelRide : leaveRide}
          className={`mt-4 w-full p-2 rounded-lg font-medium ${
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