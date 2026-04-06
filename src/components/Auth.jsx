import { useState } from "react";
import { auth, db } from "../firebase";
import {
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail
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

  const handleChange = (e) => {
    if (e.target.name === "phone") {
      const value = e.target.value.replace(/\D/g, "").slice(0, 10);
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

    if (!name.trim()) return alert("Enter name");
    if (!email.endsWith("@learner.manipal.edu"))
      return alert("Use college email only");
    if (phone.length !== 10)
      return alert("Enter valid phone number");
    if (password.length < 6)
      return alert("Password must be at least 6 characters");

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

  // 🔑 FORGOT PASSWORD
  const handleForgotPassword = async () => {
    const { email } = form;

    if (!email) {
      return alert("Enter your email first");
    }

    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent ✅");
    } catch (err) {
      alert("Enter a valid email");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-gray-100">

      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-md w-[350px]">

        {/* HEADER */}
        <h1 className="text-2xl font-semibold text-center mb-2">
          CabShare
        </h1>
        <p className="text-gray-400 text-center mb-6 text-sm">
          Safe college cab sharing
        </p>

        {/* GOOGLE */}
        <button
          onClick={loginWithGoogle}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg mb-4"
        >
          Continue with Google
        </button>

        <p className="text-center text-gray-400 mb-4 text-sm">OR</p>

        {/* TOGGLE */}
        <div className="flex mb-4">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-l-lg ${
              isLogin ? "bg-blue-600" : "bg-slate-700"
            }`}
          >
            Login
          </button>

          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-r-lg ${
              !isLogin ? "bg-blue-600" : "bg-slate-700"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* SIGNUP EXTRA */}
        {!isLogin && (
          <>
            <input
              name="name"
              placeholder="Name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-3 mb-3 rounded-lg bg-slate-700 outline-none"
            />

            <input
              name="phone"
              placeholder="Phone (10 digits)"
              value={form.phone}
              onChange={handleChange}
              className="w-full p-3 mb-3 rounded-lg bg-slate-700 outline-none"
            />
          </>
        )}

        {/* COMMON */}
        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="w-full p-3 mb-3 rounded-lg bg-slate-700 outline-none"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full p-3 mb-3 rounded-lg bg-slate-700 outline-none"
        />

        {/* FORGOT PASSWORD */}
        {isLogin && (
          <div className="text-right mb-3">
            <span
              onClick={handleForgotPassword}
              className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer"
            >
              Forgot password?
            </span>
          </div>
        )}

        {/* BUTTON */}
        <button
          onClick={isLogin ? handleLogin : handleSignup}
          className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded-lg"
        >
          {isLogin ? "Login" : "Create Account"}
        </button>

      </div>
    </div>
  );
}

export default Auth;