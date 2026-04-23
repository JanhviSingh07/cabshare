import { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Profile({ onProfileSaved }) {
  const user = auth.currentUser;
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: "", phone: "", gender: "", college: "", regNo: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const snap = await getDoc(doc(db, "profiles", user.uid));
        if (snap.exists()) setProfile(snap.data());
        else setProfile(prev => ({ ...prev, name: user.displayName || "" }));
      } catch (err) { alert("Error loading profile"); }
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const saveProfile = async () => {
    if (!user) return;
    if (!profile.name.trim()) return alert("Enter name");
    if (profile.phone.length !== 10) return alert("Enter a valid 10 digit phone number");
    if (!profile.gender) return alert("Select gender");
    if (!profile.college.trim()) return alert("Enter college name");
    if (!profile.regNo.trim()) return alert("Enter registration number");

    setSaving(true);
    try {
      await setDoc(doc(db, "profiles", user.uid), {
        ...profile,
        name: profile.name.trim(),
        college: profile.college.trim(),
        regNo: profile.regNo.trim(),
      }, { merge: true });
      if (onProfileSaved) await onProfileSaved();
      alert("Profile saved");
      navigate("/home");
    } catch (err) { alert("Error saving profile"); }
    setSaving(false);
  };

  if (loading) return <div className="text-center mt-10 text-gray-400">Loading...</div>;

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-xl mx-auto px-6 py-12">

        <h1 className="text-2xl font-bold text-gray-900 mb-1">Your Profile</h1>
        <p className="text-gray-500 text-sm mb-8">Complete your details to start using CabShare</p>

        <div className="space-y-4">

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Full Name</label>
            <input placeholder="Full Name" value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full border border-gray-200 focus:border-gray-800 outline-none p-3 rounded-xl text-sm text-gray-900 transition" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Phone</label>
            <input type="tel" inputMode="numeric" placeholder="10 digit phone number"
              value={profile.phone} maxLength={10}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
              className="w-full border border-gray-200 focus:border-gray-800 outline-none p-3 rounded-xl text-sm text-gray-900 transition" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Gender</label>
            <select value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
              className="w-full border border-gray-200 focus:border-gray-800 outline-none p-3 rounded-xl text-sm text-gray-900 bg-white transition">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">College</label>
            <input placeholder="College name" value={profile.college}
              onChange={(e) => setProfile({ ...profile, college: e.target.value })}
              className="w-full border border-gray-200 focus:border-gray-800 outline-none p-3 rounded-xl text-sm text-gray-900 transition" />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1 block">Registration Number</label>
            <input placeholder="Registration number" value={profile.regNo} inputMode="numeric"
              onChange={(e) => setProfile({ ...profile, regNo: e.target.value.replace(/\D/g, "") })}
              className="w-full border border-gray-200 focus:border-gray-800 outline-none p-3 rounded-xl text-sm text-gray-900 transition" />
          </div>

          <button onClick={saveProfile} disabled={saving}
            className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-semibold text-sm transition disabled:bg-gray-300 mt-2">
            {saving ? "Saving..." : "Save Profile"}
          </button>

        </div>
      </div>
    </div>
  );
}

export default Profile;