import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { FirestorePortfolioProvider } from "./context/FirestorePortfolioContext";
import PublicLayout from "./pages/PublicLayout";
import Admin from "./pages/Admin";

const Portfolio = React.lazy(() =>
  import("./pages/Portfolio").then((m) => ({ default: m.default || m.Portfolio }))
);
const AboutPage = React.lazy(() =>
  import("./pages/AboutPage").then((m) => ({ default: m.default || m.AboutPage }))
);
const ProjectsPage = React.lazy(() =>
  import("./pages/ProjectsPage").then((m) => ({
    default: m.default || m.ProjectsPage,
  }))
);
const SkillsPage = React.lazy(() =>
  import("./pages/SkillsPage").then((m) => ({ default: m.default || m.SkillsPage }))
);
const ContactPage = React.lazy(() =>
  import("./pages/ContactPage").then((m) => ({
    default: m.default || m.ContactPage,
  }))
);

export default function App() {
  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <FirestorePortfolioProvider>
        <React.Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-950 text-gray-400 text-sm">
              Loading...
            </div>
          }
        >
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/" element={<Portfolio />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/skills" element={<SkillsPage />} />
              <Route path="/contact" element={<ContactPage />} />
            </Route>
            <Route path="/admin/*" element={<Admin />} />
          </Routes>
        </React.Suspense>
      </FirestorePortfolioProvider>
    </BrowserRouter>
  );
}
