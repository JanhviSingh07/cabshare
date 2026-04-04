import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  getDoc,
  setDoc,
  arrayUnion
} from "firebase/firestore";

function RideRequests() {
  const [requests, setRequests] = useState([]);
  const [profiles, setProfiles] = useState({});

  // 🔥 FETCH ALL REQUESTS (pending + accepted)
  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "rideRequests"),
      where("rideOwner", "==", user.uid)
    );

    const unsub = onSnapshot(q, async (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setRequests(data);

      // 🔥 FETCH PROFILE ONLY FOR ACCEPTED USERS
      const profileData = {};

      for (let req of data) {
        if (req.status === "accepted") {
          const ref = doc(db, "profiles", req.requestedBy);
          const snap = await getDoc(ref);

          if (snap.exists()) {
            profileData[req.requestedBy] = snap.data();
          }
        }
      }

      setProfiles(profileData);
    });

    return () => unsub();
  }, []);

  // ✅ ACCEPT
  const acceptRequest = async (req) => {
    try {
      const rideRef = doc(db, "rides", req.rideId);
      const requestRef = doc(db, "rideRequests", req.id);
      const profileRef = doc(db, "profiles", req.requestedBy);

      const rideSnap = await getDoc(rideRef);
      if (!rideSnap.exists()) return alert("Ride not found");

      const ride = rideSnap.data();

      if (ride.seats <= 0) {
        await updateDoc(requestRef, { status: "rejected" });
        return alert("Ride full");
      }

      // update ride
      await updateDoc(rideRef, {
        seats: ride.seats - 1,
        participants: arrayUnion(req.requestedBy)
      });

      // update profile
      const profileSnap = await getDoc(profileRef);

      if (!profileSnap.exists()) {
        await setDoc(profileRef, { currentRideId: req.rideId });
      } else {
        await updateDoc(profileRef, { currentRideId: req.rideId });
      }

      // update request
      await updateDoc(requestRef, {
        status: "accepted",
        showContact: true
      });

      alert("Accepted ✅");

    } catch (err) {
      console.error(err);
      alert("Error accepting request");
    }
  };

  // ❌ REJECT
  const rejectRequest = async (id) => {
    try {
      await updateDoc(doc(db, "rideRequests", id), {
        status: "rejected"
      });
    } catch (err) {
      console.error(err);
      alert("Error rejecting request");
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">

      <h2 className="text-2xl font-bold text-center mb-6">
        📩 Ride Requests
      </h2>

      {requests.length === 0 && (
        <p className="text-center text-gray-400">
          No requests yet
        </p>
      )}

      <div className="space-y-4">
        {requests.map(req => {
          const profile = profiles[req.requestedBy];

          return (
            <div
              key={req.id}
              className="bg-slate-800 p-5 rounded-xl shadow-md"
            >
              {/* USER INFO */}
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="font-semibold">
                    {req.requestedByEmail}
                  </p>

                  <p className="text-sm text-gray-400">
                    Wants to join your ride
                  </p>

                  {/* 🔥 CONTACT ONLY AFTER ACCEPT */}
                  {req.status === "accepted" && profile?.phone && (
                    <p className="text-green-400 text-sm">
                      📞 {profile.phone}
                    </p>
                  )}

                  {req.status === "accepted" && profile?.college && (
                    <p className="text-xs text-gray-500">
                      🎓 {profile.college}
                    </p>
                  )}
                </div>

                {/* 🔥 STATUS BADGE */}
                <span
                  className={`text-sm ${
                    req.status === "pending"
                      ? "text-yellow-400"
                      : req.status === "accepted"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  {req.status.toUpperCase()}
                </span>
              </div>

              {/* 🔥 BUTTONS ONLY IF PENDING */}
              {req.status === "pending" && (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => acceptRequest(req)}
                    className="flex-1 bg-green-500 hover:bg-green-600 p-2 rounded-lg font-medium transition"
                  >
                    ✅ Accept
                  </button>

                  <button
                    onClick={() => rejectRequest(req.id)}
                    className="flex-1 bg-red-500 hover:bg-red-600 p-2 rounded-lg font-medium transition"
                  >
                    ❌ Reject
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default RideRequests;