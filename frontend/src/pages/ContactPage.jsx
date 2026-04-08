import React from "react";
import { useFirestorePortfolio } from "../context/FirestorePortfolioContext";
import { ContactForm } from "../components/ContactForm";

function ContactPage() {
  const { info } = useFirestorePortfolio();
  return (
    <>
      <ContactForm info={info} />
    </>
  );
}

export { ContactPage };
export default ContactPage;
