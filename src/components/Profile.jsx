import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Profile({ onProfileSaved }) {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    gender: "",
    college: "",
    regNo: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        const ref = doc(db, "profiles", user.uid);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setProfile(snap.data());
        } else {
          setProfile((prev) => ({
            ...prev,
            name: user.displayName || "",
          }));
        }
      } catch (err) {
        console.error(err);
        alert("Error loading profile");
      }

      setLoading(false);
    };

    fetchProfile();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;

    if (!profile.name.trim()) {
      return alert("Enter name");
    }
    if (profile.phone.length !== 10) {
      return alert("Enter a Valid 10 digits phone number");
    }
    if (!profile.gender) {
      return alert("Enter Gender");
    }
    if (!profile.college.trim()) {
      return alert("Enter college name");
    }
    if (!profile.regNo.trim()) {
      return alert("Enter registration number");
    }

    setSaving(true);

    try {
      const ref = doc(db, "profiles", user.uid);

      await setDoc(ref, {
        ...profile,
        name: profile.name.trim(),
        college: profile.college.trim(),
        regNo: profile.regNo.trim(),
      }, { merge: true });

      if (onProfileSaved) await onProfileSaved();

      alert("Profile saved ✅");
      navigate("/home");

    } catch (err) {
      console.error(err);
      alert("Error saving profile");
    }

    setSaving(false);
  };

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-400">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 px-2 text-white">

      <div className="bg-slate-900/60 p-6 rounded-xl shadow-lg">

        <h2 className="text-2xl font-bold mb-6 text-center">
          👤 Complete Your Profile
        </h2>

        <div className="space-y-4">

          <input
            placeholder="Name"
            value={profile.name}
            onChange={(e) =>
              setProfile({ ...profile, name: e.target.value })
            }
            className="w-full p-3 rounded-lg bg-slate-800"
          />

          <input
            type="tel"
            inputMode="numeric"
            placeholder="Phone (10 digits)"
            value={profile.phone}
            maxLength={10}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "").slice(0, 10);
              setProfile({ ...profile, phone: value });
            }}
            className="w-full p-3 rounded-lg bg-slate-800"
          />

          <select
            value={profile.gender}
            onChange={(e) =>
              setProfile({ ...profile, gender: e.target.value })
            }
            className="w-full p-3 rounded-lg bg-slate-800"
          >
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>

          <input
            placeholder="College"
            value={profile.college}
            onChange={(e) =>
              setProfile({ ...profile, college: e.target.value })
            }
            className="w-full p-3 rounded-lg bg-slate-800"
          />

          {/* ✅ regNo — sirf digits allowed */}
          <input
            placeholder="Registration Number )"
            value={profile.regNo}
            inputMode="numeric"
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, "");
              setProfile({ ...profile, regNo: value });
            }}
            className="w-full p-3 rounded-lg bg-slate-800"
          />

          <button
            onClick={saveProfile}
            disabled={saving}
            className={`w-full p-3 rounded-lg font-semibold ${
              saving
                ? "bg-gray-500"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {saving ? "Saving..." : "Save Profile ✅"}
          </button>

        </div>
      </div>
    </div>
  );
}

export default Profile;