import React from "react";
import { useFirestorePortfolio } from "../context/FirestorePortfolioContext";
import { HeroSection } from "../components/HeroSection";

function Portfolio() {
  const { info } = useFirestorePortfolio();

  return (
    <>
      <HeroSection info={info} />
    </>
  );
}

export default Portfolio;
