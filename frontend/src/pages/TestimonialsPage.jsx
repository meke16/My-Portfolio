import React from "react";
import { useFirestorePortfolio } from "../context/FirestorePortfolioContext";
import TestimonialsSlider from "../components/TestimonialsSlider";

function TestimonialsPage() {
  const { testimonials } = useFirestorePortfolio();
  return <TestimonialsSlider testimonials={testimonials} />;
}

export { TestimonialsPage };
export default TestimonialsPage;
