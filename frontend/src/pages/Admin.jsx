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
import AdminAnalytics from "./admin/AdminAnalytics";

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
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-4 relative overflow-hidden font-sans">
      {/* Grid Pattern Background */}
      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      ></div>

      <div className="relative z-10 flex flex-col md:flex-row w-full max-w-4xl bg-[#111111] border-[3px] border-white shadow-brutalist-white-lg overflow-hidden">
        {/* Left Column: Branding */}
        <div className="flex-1 p-8 md:p-12 border-b-[3px] md:border-b-0 md:border-r-[3px] border-white flex flex-col justify-center bg-[#111111]">
          <div className="space-y-6">
            <p className="text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase text-gray-400">
              CHER PORTFOLIO
            </p>
            <h1 className="text-5xl md:text-7xl font-black leading-none uppercase text-white">
              MEKE <br />
              <span className="text-accent">VAULT</span>
            </h1>
            <div className="w-12 h-1 bg-white"></div>
            <p className="text-sm md:text-base text-gray-400 max-w-xs leading-relaxed font-bold">
              Secure mainframe access. Manage projects, surveillance logs, and core identity parameters.
            </p>
          </div>
          <div className="mt-12 pt-12 border-t border-white/10 flex items-center gap-4">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest italic">
              Authorized personnel only // encryption active
            </p>
          </div>
        </div>

        {/* Right Column: Form */}
        <div className="flex-1 p-8 md:p-12 bg-[#161616] flex flex-col justify-center relative">
          {/* Decorative small box like in ui.png */}
          <div className="hidden md:block absolute top-0 right-0 w-24 h-24 border-l-[3px] border-b-[3px] border-white bg-accent/5"></div>

          <div className="max-w-sm mx-auto w-full space-y-8">
            <div className="space-y-2">
              <h2 className="text-3xl font-black uppercase text-white italic tracking-tighter">Enter Credentials</h2>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Authentication required for uplink</p>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border-2 border-red-500 text-red-500 text-[10px] font-black uppercase shadow-brutalist-accent">
                PROTECTION TRIGGERED: {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Uplink identity
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    placeholder="ADMIN@MAINFRAME"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-[#0a0a0a] border-[2.5px] border-white text-white font-black uppercase tracking-widest shadow-brutalist-white-sm focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none placeholder:text-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/40">
                  Access Vector
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-white/50">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-12 pr-4 py-4 bg-[#0a0a0a] border-[2.5px] border-white text-white font-black shadow-brutalist-white-sm focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none placeholder:text-white/10"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-white text-black font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3 shadow-brutalist-accent active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-50 border-[2.5px] border-white"
              >
                {loading ? (
                  "AUTHENTICATING..."
                ) : (
                  <>
                    INITIALIZE UPLINK
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            <div className="pt-4 flex items-center justify-center gap-4 text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></div>
                ENCRYPTION: AES-256
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse"></div>
                STATUS: SYNCED
              </div>
            </div>
          </div>
        </div>
      </div>
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
        <Route path="analytics" element={<AdminAnalytics />} />
      </Route>
    </Routes>
  );
}

export default Admin;
