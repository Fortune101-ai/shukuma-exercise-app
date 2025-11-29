import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setCredentials,
  setLoading,
  setError,
  clearError,
  selectAuthLoading,
  selectAuthError,
} from "../../store/slices/auth.slice";
import { authApi } from "../../services/api";
import useToast from "../../hooks/useToast";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import "./Auth.css";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    text: "",
    color: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const toast = useToast();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error, toast]);

  const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, text: "", color: "" };

    let score = 0;

    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
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
    const errors = {};

    if (!formData.name) {
      errors.name = "Name is required";
    } else if (formData.name.length < 2) {
      errors.name = "Name must be at least 2 characters";
    }

    if (formData.username && formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    } else if (
      formData.username &&
      !/^[a-zA-Z0-9_]+$/.test(formData.username)
    ) {
      errors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (error) {
      dispatch(clearError());
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    dispatch(setLoading(true));

    try {
      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      };

      if (formData.username) {
        signupData.username = formData.username;
      }

      const data = await authApi.signup(signupData);

      dispatch(
        setCredentials({
          user: data.user,
          token: data.token,
        })
      );

      toast.success("Account created successfully! Welcome to Shukuma!");
      navigate("/dashboard");
    } catch (err) {
      dispatch(setError(err.message || "Signup failed. Please try again."));
    } finally {
      dispatch(setLoading(false));
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
            label="Full Name"
            type="text"
            name="name"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            error={formErrors.name}
            fullWidth
            required
            disabled={loading}
          />

          <Input
            label="Username (Optional)"
            type="text"
            name="username"
            placeholder="johndoe"
            value={formData.username}
            onChange={handleChange}
            error={formErrors.username}
            helperText="Letters, numbers, and underscores only"
            fullWidth
            disabled={loading}
          />

          <Input
            label="Email"
            type="email"
            name="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleChange}
            error={formErrors.email}
            fullWidth
            required
            disabled={loading}
          />

          <div>
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={handleChange}
              error={formErrors.password}
              fullWidth
              required
              disabled={loading}
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
            error={formErrors.confirmPassword}
            fullWidth
            required
            disabled={loading}
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
          <Button variant="ghost" size="large" fullWidth disabled={loading}>
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
