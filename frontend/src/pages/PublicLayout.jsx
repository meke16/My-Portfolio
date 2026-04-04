import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { useFirestorePortfolio } from "../context/FirestorePortfolioContext";
import Navbar from "../components/Navbar";
import LoadingScreen from "../components/LoadingScreen";

function PublicLayout() {
  const { info, loading, error, reload } = useFirestorePortfolio();
  const location = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  React.useEffect(() => {
    if (!info) return;
    if (info.profile_image) {
      const favicon = document.getElementById("dynamic-favicon");
      if (favicon) favicon.href = info.profile_image;
    }
    if (info.name) document.title = info.name;
  }, [info]);

  if (loading) return <LoadingScreen />;

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 px-6 gap-4">
        <p className="text-red-400 text-center max-w-md">{error}</p>
        <button
          type="button"
          onClick={() => reload()}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <Navbar info={info} />
      <Outlet />
    </>
  );
}

export default PublicLayout;
