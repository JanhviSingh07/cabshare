import { db, auth } from "../firebase";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
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

      // 🧠 Create profile if not exists
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">

      <div className="bg-slate-900/60 backdrop-blur-lg p-10 rounded-2xl shadow-xl text-center w-[350px]">

        <h1 className="text-3xl font-bold mb-2">🚖 CabShare</h1>

        <p className="text-gray-400 mb-6">
          Safe college cab sharing
        </p>

        <button
          onClick={loginWithGoogle}
          className="w-full bg-blue-500 hover:bg-blue-600 hover:scale-105 transition-all duration-200 py-2 rounded-lg font-medium"
        >
          🔵 Continue with Google
        </button>

      </div>

    </div>
  );
}

export default Auth;