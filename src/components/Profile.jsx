import { useState } from "react";
import { auth, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

function Profile() {
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState("");

  const saveProfile = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        alert("No user logged in");
        return;
      }

      await setDoc(doc(db, "profiles", user.uid), {
        name,
        college,
        phone,
        gender,
      });

      alert("Profile saved successfully");
    } catch (error) {
      console.error(error);
      alert("Error saving profile");
    }
  };

  return (
    <div>
      <h2>Create Profile</h2>

      <input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        placeholder="College"
        value={college}
        onChange={(e) => setCollege(e.target.value)}
      />

      <input
        placeholder="Phone"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      <input
        placeholder="Gender"
        value={gender}
        onChange={(e) => setGender(e.target.value)}
      />

      <button onClick={saveProfile}>Save</button>
    </div>
  );
}

export default Profile;
