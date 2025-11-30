import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const toast = useToast();
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error, toast]);

  const validateForm = () => {
    const errors = {};

    if (!formData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Email is invalid";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

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
      const data = await authApi.login(formData);

      dispatch(
        setCredentials({
          user: data.user,
          token: data.token,
        }),
      );

      toast.success("Welcome back!");
      navigate(from, { replace: true });
    } catch (err) {
      dispatch(setError(err.message || "Login failed. Please try again."));
    } finally {
      dispatch(setLoading(false));
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
            error={formErrors.email}
            fullWidth
            required
            disabled={loading}
          />

          <Input
            label="Password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            error={formErrors.password}
            fullWidth
            required
            disabled={loading}
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
          <Button variant="ghost" size="large" fullWidth disabled={loading}>
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
