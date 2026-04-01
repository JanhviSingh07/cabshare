import { db } from "../firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { auth } from "../firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Auth() {
  const navigate = useNavigate();

const loginWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();

    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userRef = doc(db, "profiles", user.uid);
    const userSnap = await getDoc(userRef);

    // 🧠 If profile not exists → create it
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        name: user.displayName,
        email: user.email,
        createdAt: Timestamp.now(),
      });
    }

    navigate("/home");

  } catch (err) {
    console.error(err);
    alert("Google login failed");
  }
};

  return (
    <div className="container">

    <h1 style={{ textAlign: "center" }}>🚖 CabShare</h1>

<p style={{ textAlign: "center" }}>
  Safe college cab sharing
</p>

<div className="card" style={{ textAlign: "center", marginTop: "30px" }}>
  <button className="btn-primary" onClick={loginWithGoogle}>
    🔵 Continue with Google
  </button>
</div>
    </div>
  );
}

export default Auth;