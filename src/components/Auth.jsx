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
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) => {
    if (e.target.name === "phone") {
      const value = e.target.value.replace(/\D/g, "").slice(0, 10);
      setForm({ ...form, phone: value });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      await setDoc(doc(db, "profiles", user.uid), { name: user.displayName, email: user.email, verified: true }, { merge: true });
      navigate("/home");
    } catch (err) {
      alert("Google login failed");
    }
  };

  const handleSignup = async () => {
    const { name, email, phone, password } = form;
    if (!name.trim()) return alert("Enter name");
    if (!email.endsWith("@learner.manipal.edu")) return alert("Use college email only");
    if (phone.length !== 10) return alert("Enter valid phone number");
    if (password.length < 6) return alert("Password must be at least 6 characters");
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;
      await setDoc(doc(db, "profiles", user.uid), { name, email, phone, verified: true });
      navigate("/home");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleLogin = async () => {
    const { email, password } = form;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (err) {
      alert("Invalid credentials");
    }
  };

  const handleForgotPassword = async () => {
    const { email } = form;
    if (!email) return alert("Please enter your email first");
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Password reset email sent successfully");
    } catch (err) {
      alert("Please enter a valid email");
    }
  };

  return (
    <div className="min-h-screen bg-white flex">

      {/* Left — black hero panel */}
      <div className="hidden md:flex flex-col justify-between bg-black text-white w-1/2 p-12">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">CabShare</h1>
        </div>
        <div>
          <h2 className="text-5xl font-extrabold leading-tight mb-4">
            Easy<br />sharing.
          </h2>
          <p className="text-gray-400 text-base">
            Safe cab sharing for college students.
          </p>
        </div>
        <p className="text-gray-600 text-sm">© 2026 CabShare</p>
      </div>

      {/* Right — form panel */}
      <div className="flex flex-col justify-center w-full md:w-1/2 px-8 md:px-16 py-12">

        {/* Mobile logo */}
        <div className="md:hidden mb-8">
          <h1 className="text-2xl font-extrabold text-black">CabShare</h1>
          <p className="text-gray-500 text-sm mt-1">Safe cab sharing for college students</p>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-1">
          {isLogin ? "Sign in" : "Create account"}
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          {isLogin ? "Welcome back" : "Join CabShare today"}
        </p>

        {/* Google */}
        <button
          onClick={loginWithGoogle}
          className="w-full border border-gray-300 hover:border-gray-800 text-gray-800 py-3 rounded-xl mb-6 font-medium text-sm transition flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-gray-400 text-xs">OR</span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Toggle */}
        <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              isLogin ? "bg-white text-black shadow-sm" : "text-gray-500"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${
              !isLogin ? "bg-white text-black shadow-sm" : "text-gray-500"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Signup fields */}
        {!isLogin && (
          <>
            <input
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-200 focus:border-gray-800 outline-none p-3 rounded-xl mb-3 text-sm text-gray-900 placeholder-gray-400 transition"
            />
            <input
              name="phone"
              placeholder="Phone (10 digits)"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-200 focus:border-gray-800 outline-none p-3 rounded-xl mb-3 text-sm text-gray-900 placeholder-gray-400 transition"
            />
          </>
        )}

        <input
          name="email"
          placeholder="College Email"
          value={form.email}
          onChange={handleChange}
          className="w-full border border-gray-200 focus:border-gray-800 outline-none p-3 rounded-xl mb-3 text-sm text-gray-900 placeholder-gray-400 transition"
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="w-full border border-gray-200 focus:border-gray-800 outline-none p-3 rounded-xl mb-3 text-sm text-gray-900 placeholder-gray-400 transition"
        />

        {isLogin && (
          <div className="text-right mb-4">
            <span
              onClick={handleForgotPassword}
              className="text-sm text-gray-500 hover:text-black cursor-pointer transition"
            >
              Forgot password?
            </span>
          </div>
        )}

        <button
          onClick={isLogin ? handleLogin : handleSignup}
          className="w-full bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-semibold text-sm transition"
        >
          {isLogin ? "Sign in" : "Create Account"}
        </button>

      </div>
    </div>
  );
}

export default Auth;