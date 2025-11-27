import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout, selectCurrentUser } from "../../store/slices/auth.slice.js";
import useToast from "../../hooks/useToast.js";
import Button from "../ui/Button.jsx";
import "./DashboardLayout.css";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const toast = useToast();

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/workouts", label: "Workouts", icon: "🏋️" },
    { path: "/challenges", label: "Challenges", icon: "🎯" },
    { path: "/journal", label: "Journal", icon: "📝" },
    { path: "/nutrition", label: "Nutrition", icon: "🥗" },
    { path: "/progress", label: "Progress", icon: "📈" },
    { path: "/social", label: "Social", icon: "👥" },
  ];

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header-mobile">
        <button
          className="menu-toggle"
          onClick={toggleSidebar}
          aria-label="Toggle menu"
        >
          <span className="menu-icon">{sidebarOpen ? "✕" : "☰"}</span>
        </button>
        <div className="dashboard-logo">Shukuma</div>
        <div className="dashboard-user-mobile">
          {user?.username?.[0]?.toUpperCase() || "U"}
        </div>
      </header>

      <aside
        className={`dashboard-sidebar ${sidebarOpen ? "sidebar-open" : ""}`}
      >
        <div className="sidebar-header">
          <h2 className="sidebar-logo">Shukuma</h2>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? "nav-item-active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user?.username?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {user?.username || "User"}
              </div>
              <div className="sidebar-user-email">{user?.email || ""}</div>
            </div>
          </div>
          <Button variant="ghost" size="small" fullWidth onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar} />
      )}

      <main className="dashboard-main">{children}</main>
    </div>
  );
}
