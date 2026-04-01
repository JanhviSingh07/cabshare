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

      const ref = doc(db, "profiles", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        setProfile(snap.data());
      }

      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  // 💾 SAVE PROFILE
  const saveProfile = async () => {
    if (!user) return;

    const ref = doc(db, "profiles", user.uid);

    await setDoc(ref, profile, { merge: true });

    alert("Profile saved ✅");
  };

  if (loading) return <p className="text-center">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto mt-10 bg-slate-900/60 p-6 rounded-xl shadow-lg">

      <h2 className="text-2xl font-bold mb-6 text-center">
        👤 My Profile
      </h2>

      <div className="grid gap-4">

        <input
          placeholder="Name"
          value={profile.name}
          onChange={(e) => setProfile({ ...profile, name: e.target.value })}
          className="p-2 rounded bg-slate-800"
        />

        <input
          placeholder="Phone"
          value={profile.phone}
          onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
          className="p-2 rounded bg-slate-800"
        />

        <select
          value={profile.gender}
          onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
          className="p-2 rounded bg-slate-800"
        >
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
        </select>

        <input
          placeholder="College"
          value={profile.college}
          onChange={(e) => setProfile({ ...profile, college: e.target.value })}
          className="p-2 rounded bg-slate-800"
        />

        <input
          placeholder="Registration Number"
          value={profile.regNo}
          onChange={(e) => setProfile({ ...profile, regNo: e.target.value })}
          className="p-2 rounded bg-slate-800"
        />

        <button
          onClick={saveProfile}
          className="bg-green-500 hover:bg-green-600 p-2 rounded mt-4"
        >
          Save Profile
        </button>

      </div>
    </div>
  );
}

export default Profile;