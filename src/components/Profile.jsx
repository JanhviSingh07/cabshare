import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

function Profile() {
  const user = auth.currentUser;

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    gender: "",
    college: "",
    regNo: "",
  });

  const [loading, setLoading] = useState(true);

  // 🔥 FETCH PROFILE
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const ref = doc(db, "profiles", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setProfile(snap.data());
        }
      } catch (err) {
        console.error(err);
        alert("Error loading profile");
      }

      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  // 💾 SAVE PROFILE
  const saveProfile = async () => {
    if (!user) return;

    try {
      const ref = doc(db, "profiles", user.uid);

      await setDoc(ref, profile, { merge: true });

      alert("Profile saved ✅");
    } catch (err) {
      console.error(err);
      alert("Error saving profile");
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-400">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-slate-900/60 p-6 rounded-xl shadow-lg text-white">

      <h2 className="text-2xl font-bold mb-6 text-center">
        👤 My Profile
      </h2>

      <div className="space-y-4">

        {/* NAME */}
        <input
          placeholder="Name"
          value={profile.name}
          onChange={(e) =>
            setProfile({ ...profile, name: e.target.value })
          }
          className="w-full p-3 rounded-lg bg-slate-800 outline-none"
        />

        {/* PHONE */}
        <input
          placeholder="Phone"
          value={profile.phone}
          onChange={(e) =>
            setProfile({ ...profile, phone: e.target.value })
          }
          className="w-full p-3 rounded-lg bg-slate-800 outline-none"
        />

        {/* GENDER */}
        <select
          value={profile.gender}
          onChange={(e) =>
            setProfile({ ...profile, gender: e.target.value })
          }
          className="w-full p-3 rounded-lg bg-slate-800 outline-none"
        >
          <option value="">Select Gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
        </select>

        {/* COLLEGE */}
        <input
          placeholder="College"
          value={profile.college}
          onChange={(e) =>
            setProfile({ ...profile, college: e.target.value })
          }
          className="w-full p-3 rounded-lg bg-slate-800 outline-none"
        />

        {/* REG NO */}
        <input
          placeholder="Registration Number"
          value={profile.regNo}
          onChange={(e) =>
            setProfile({ ...profile, regNo: e.target.value })
          }
          className="w-full p-3 rounded-lg bg-slate-800 outline-none"
        />

        {/* SAVE BUTTON */}
        <button
          onClick={saveProfile}
          className="w-full bg-green-500 hover:bg-green-600 p-3 rounded-lg font-semibold transition"
        >
          Save Profile ✅
        </button>

      </div>
    </div>
  );
}

export default Profile;