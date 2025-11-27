import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/slices/auth.slice.js";
import { authApi } from "../../services/api";
import useToast from "../../hooks/useToast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import "./Auth.css";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    text: "",
    color: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, text: "", color: "" };
    let score = 0;

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;

    // Character variety
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    const strengths = [
      { score: 0, text: "Very Weak", color: "#ef4444" },
      { score: 2, text: "Weak", color: "#f59e0b" },
      { score: 4, text: "Fair", color: "#eab308" },
      { score: 5, text: "Good", color: "#84cc16" },
      { score: 6, text: "Strong", color: "#10b981" },
    ];

    const strength =
      strengths.reverse().find((s) => score >= s.score) || strengths[0];

    return { score, ...strength };
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // TODO: Replace with actual API call when backend is ready
      // const data = await authApi.signup({
      //   username: formData.username,
      //   email: formData.email,
      //   password: formData.password,
      // })

      // Mock successful signup for now
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const mockData = {
        user: {
          id: "user" + Date.now(),
          username: formData.username,
          email: formData.email,
        },
        token: "mock-jwt-token-" + Date.now(),
      };

      dispatch(setCredentials(mockData));
      toast.success("Account created successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Start your fitness journey today</p>
        </div>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <Input
            label="Username"
            type="text"
            name="username"
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleChange}
            error={errors.username}
            fullWidth
            required
          />

          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            fullWidth
            required
          />

          <div>
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              fullWidth
              required
            />
            {formData.password && (
              <div className="password-strength">
                <div className="password-strength-bar">
                  <div
                    className="password-strength-fill"
                    style={{
                      width: `${(passwordStrength.score / 6) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    }}
                  />
                </div>
                <span
                  className="password-strength-text"
                  style={{ color: passwordStrength.color }}
                >
                  {passwordStrength.text}
                </span>
              </div>
            )}
          </div>

          <Input
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            fullWidth
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={loading}
          >
            Create Account
          </Button>
        </form>

        <div className="auth-divider">
          <span>Already have an account?</span>
        </div>

        <Link to="/login">
          <Button variant="ghost" size="large" fullWidth>
            Login
          </Button>
        </Link>

        <div className="auth-back">
          <Link to="/" className="auth-link-inline">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
