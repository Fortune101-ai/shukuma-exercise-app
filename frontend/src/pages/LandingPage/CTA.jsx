import { Link } from "react-router-dom";
import Button from "../../components/ui/Button.jsx";

export default function CTA() {
  return (
    <section className="cta">
      <div className="cta-content">
        <h2 className="cta-title"> Ready to Start Your Journey?</h2>
        <p className="cta-subtitle">
          Join thousands of users achieving their fitness goals with Shukuma.
        </p>
        <div className="cta-buttons">
          <Link to="/signup">
            <Button variant="primary" size="large">
              {" "}
              Create a Free Account
            </Button>
          </Link>
        </div>

        <p className="cta-note">
          No credit card required. Get started in 30 seconds
        </p>
      </div>
    </section>
  );
}
