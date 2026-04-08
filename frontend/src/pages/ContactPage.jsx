import React from "react";
import { useFirestorePortfolio } from "../context/FirestorePortfolioContext";
import { ContactForm } from "../components/ContactForm";
import TestimonialsSlider from "../components/TestimonialsSlider";

function ContactPage() {
  const { info, testimonials } = useFirestorePortfolio();
  return (
    <>
      <ContactForm info={info} />
      <TestimonialsSlider testimonials={testimonials} />
    </>
  );
}

export { ContactPage };
export default ContactPage;
