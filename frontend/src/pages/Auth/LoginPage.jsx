import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/slices/auth.slice.js";
import { authApi } from "../../services/api";
import useToast from "../../hooks/useToast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import "./Auth.css";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      // const data = await authApi.login(formData)

      // Mock successful login for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockData = {
        user: {
          id: "user123",
          username: "testuser",
          email: formData.email,
        },
        token: "mock-jwt-token-" + Date.now(),
      };

      dispatch(setCredentials(mockData));
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">Welcome Back</h1>
          <p className="auth-subtitle">
            Login to continue your fitness journey
          </p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
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

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            fullWidth
            required
          />

          <div className="auth-forgot">
            <Link to="/forgot-password" className="auth-link-inline">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="large"
            fullWidth
            loading={loading}
          >
            Login
          </Button>
        </form>

        <div className="auth-divider">
          <span>Don't have an account?</span>
        </div>

        <Link to="/signup">
          <Button variant="ghost" size="large" fullWidth>
            Create Account
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
