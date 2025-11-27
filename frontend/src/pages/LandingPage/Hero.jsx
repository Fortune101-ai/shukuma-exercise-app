import { Link } from "react-router-dom";
import Button from "../../components/ui/Button.jsx";

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <h1 className="hero-title">
          Transform Your{" "}
          <span className="hero-title-gradient"> Fitness Journey</span>
        </h1>
        <p className="hero-subtitle">
          Your complete fitness and wellness companion. Track workouts, join
          challenges, monitor nutrition, and connect with a community of
          like-minded individuals on their fitness journey.
        </p>
        <div className="hero-buttons">
          <Link to="/signup">
            <Button variant="primary" size="large">
              {" "}
              Get Started For Free
            </Button>
          </Link>

          <Link to="/login">
            <Button variant="secondary" size="large">
              Login
            </Button>
          </Link>
        </div>
      </div>

      <div className="hero-visual">
        <div className="hero-card hero-card-1">
          <div className="hero-card-icon">💪</div>
          <div className="hero-card-content">
            <div className="hero-card-title">Daily Streak</div>
            <div className="hero-card-value">28 Days</div>
          </div>
        </div>
        <div className="hero-card hero-card-2">
          <div className="hero-card-icon">🎯</div>
          <div className="hero-card-content">
            <div className="hero-card-title">Active Challenge</div>
            <div className="hero-card-value">30 Day Fit</div>
          </div>
        </div>
        <div className="hero-card hero-card-3">
          <div className="hero-card-icon">🔥</div>
          <div className="hero-card-content">
            <div className="hero-card-title">Calories Burned</div>
            <div className="hero-card-value">2,450 kcal</div>
          </div>
        </div>
      </div>
    </section>
  );
}
