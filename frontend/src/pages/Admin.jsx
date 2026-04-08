import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../firebase";
import AdminLayout from "../components/admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminProfile from "./admin/AdminProfile";
import AdminAbout from "./admin/AdminAbout";
import AdminWorkExperience from "./admin/AdminWorkExperience";
import AdminProjects from "./admin/AdminProjects";
import AdminBlogs from "./admin/AdminBlogs";
import AdminSkills from "./admin/AdminSkills";
import AdminTestimonials from "./admin/AdminTestimonials";
import AdminMessages from "./admin/AdminMessages";

function useAuthUser() {
  const [user, setUser] = useState(undefined);
  useEffect(() => {
    if (!auth) {
      setUser(null);
      return undefined;
    }
    return onAuthStateChanged(auth, setUser);
  }, []);
  return user;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      const code = err?.code;
      if (
        code === "auth/invalid-credential" ||
        code === "auth/wrong-password" ||
        code === "auth/user-not-found"
      ) {
        setError("Invalid email or password.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Try again later.");
      } else if (code === "auth/network-request-failed") {
        setError("Network error. Check your connection.");
      } else {
        setError("Sign-in failed. Create the user in the Firebase console first.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.22),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(139,92,246,0.18),transparent_35%)]" />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 bg-gray-900/85 backdrop-blur-xl p-8 rounded-2xl w-full max-w-sm space-y-4 border border-white/10 shadow-2xl shadow-blue-950/20"
      >
        <h1 className="text-2xl font-bold text-white text-center">Admin sign in</h1>
        <p className="text-xs text-gray-500 text-center">
          Use an account you created in the Firebase Authentication console.
        </p>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-xl bg-gray-950 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-4 py-2.5 rounded-xl bg-gray-950 text-white border border-gray-700 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-medium disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}

function FirebaseMissing() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 px-6">
      <p className="text-amber-400 text-center max-w-md text-sm">
        Firebase is not configured. Copy <code className="text-gray-400">.env.example</code> to{" "}
        <code className="text-gray-400">.env</code> in the frontend folder and set all{" "}
        <code className="text-gray-400">VITE_FIREBASE_*</code> variables, then restart{" "}
        <code className="text-gray-400">npm run dev</code>.
      </p>
    </div>
  );
}

function Admin() {
  const user = useAuthUser();
  const navigate = useNavigate();

  if (!auth) {
    return <FirebaseMissing />;
  }

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  if (!user) return <Login />;

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/admin");
  };

  return (
    <Routes>
      <Route element={<AdminLayout onLogout={handleLogout} />}>
        <Route index element={<AdminDashboard />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="about" element={<AdminAbout />} />
        <Route path="experience" element={<AdminWorkExperience />} />
        <Route path="projects" element={<AdminProjects />} />
        <Route path="blogs" element={<AdminBlogs />} />
        <Route path="skills" element={<AdminSkills />} />
        <Route path="testimonials" element={<AdminTestimonials />} />
        <Route path="messages" element={<AdminMessages />} />
      </Route>
    </Routes>
  );
}

export default Admin;
