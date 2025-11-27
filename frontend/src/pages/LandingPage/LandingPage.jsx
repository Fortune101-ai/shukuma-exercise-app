import Hero from "./Hero.jsx";
import Features from "./Features.jsx";
import Testimonials from "./Testimonials.jsx";
import CTA from "./CTA.jsx";
import "./LandingPage.css";

export default function LandingPage() {
  return (
    <div className="landing">
      <Hero />
      <Features />
      <Testimonials />
      <CTA />
    </div>
  );
}
