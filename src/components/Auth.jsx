import { useState } from "react";
import { auth, db } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Auth() {
  const [isLogin, setIsLogin] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });

  const navigate = useNavigate();

  // 🔄 Handle input — phone ke liye alag handling
  const handleChange = (e) => {
    if (e.target.name === "phone") {
      const value = e.target.value.replace(/\D/g, "");
      setForm({ ...form, phone: value });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  // 🔵 GOOGLE LOGIN
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      await setDoc(
        doc(db, "profiles", user.uid),
        {
          name: user.displayName,
          email: user.email,
          verified: true
        },
        { merge: true }
      );

      navigate("/home");
    } catch (err) {
      alert("Google login failed");
    }
  };

  // 🟢 SIGNUP
  const handleSignup = async () => {
    const { name, email, phone, password } = form;

    if (!name.trim()) {
      return alert("Name enter karo");
    }

    if (!email.endsWith("@learner.manipal.edu")) {
      return alert("Use college email only");
    }

    // ✅ Phone validation
    if (phone.length !== 10) {
      return alert("Enter a valid phone number (10 digits)");
    }

    if (password.length < 6) {
      return alert("Password kam se kam 6 characters ka hona chahiye");
    }

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;

      await setDoc(doc(db, "profiles", user.uid), {
        name,
        email,
        phone,
        verified: true
      });

      navigate("/home");
    } catch (err) {
      alert(err.message);
    }
  };

  // 🔐 LOGIN
  const handleLogin = async () => {
    const { email, password } = form;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white">

      <div className="bg-slate-900/60 backdrop-blur-lg p-8 rounded-2xl shadow-xl w-[350px]">

        <h1 className="text-2xl font-bold text-center mb-2">🚖 CabShare</h1>
        <p className="text-gray-400 text-center mb-6">
          Safe college cab sharing
        </p>

        {/* GOOGLE */}
        <button
          onClick={loginWithGoogle}
          className="w-full bg-blue-500 hover:bg-blue-600 py-2 rounded-lg mb-4"
        >
          Continue with Google
        </button>

        <p className="text-center text-gray-400 mb-4">OR</p>

        {/* TOGGLE */}
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setIsLogin(true)}
            className={`px-4 py-1 ${
              isLogin ? "bg-blue-500" : "bg-gray-700"
            } rounded-l-lg`}
          >
            Login
          </button>

          <button
            onClick={() => setIsLogin(false)}
            className={`px-4 py-1 ${
              !isLogin ? "bg-blue-500" : "bg-gray-700"
            } rounded-r-lg`}
          >
            Sign Up
          </button>
        </div>

        {/* SIGNUP FORM */}
        {!isLogin && (
          <>
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-2 mb-3 rounded bg-slate-800"
            />

            {/* ✅ Phone — sirf numbers, max 10 digits */}
            <input
              name="phone"
              type="tel"
              inputMode="numeric"
              placeholder="Phone (10 digits)"
              value={form.phone}
              maxLength={10}
              onChange={handleChange}
              className="w-full p-2 mb-3 rounded bg-slate-800"
            />
          </>
        )}

        {/* COMMON */}
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-2 mb-3 rounded bg-slate-800"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-2 mb-4 rounded bg-slate-800"
        />

        {/* BUTTON */}
        <button
          onClick={isLogin ? handleLogin : handleSignup}
          className="w-full bg-green-500 hover:bg-green-600 py-2 rounded-lg"
        >
          {isLogin ? "Login" : "Create Account"}
        </button>
      </div>
    </div>
  );
}

export default Auth;