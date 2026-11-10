import { useEffect, useRef, useState } from "react";
import "./Sidebar.css";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { Home, Globe, LogOut, User } from "lucide-react";

function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const accountMenuRef = useRef(null);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (!isAccountMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) {
        setIsAccountMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsAccountMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isAccountMenuOpen]);

  const userInitial = (user?.name || user?.email || "?")
    .trim()
    .charAt(0)
    .toUpperCase() || "?";

  const handleLogout = () => {
    setIsAccountMenuOpen(false);
    logout();
  };

  return (
    <div className={`sidebar ${isExpanded ? "expanded" : "collapsed"}`}>
      {/* Clickable Logo */}
      <button
        className="logo-button"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <img src="/Link.jpeg" alt="Linkly" className="logo-img" />
        {isExpanded && <span>Linkly</span>}
      </button>

      {/* Navigation */}
      <nav>
        <ul>
          <li>
            <NavLink to="/" end>
              <Home size={20} />
              {isExpanded && <span>Home</span>}
            </NavLink>
          </li>

          {/* <li>
            <NavLink to={`/analytics/${shortCode}`}>
              <ChartNoAxesColumn size={20} />
              {isExpanded && <span>Analytics</span>}
            </NavLink>
          </li> */}

          <li>
            <NavLink to="/urls">
              <Globe size={20} />
              {isExpanded && <span>Urls</span>}
            </NavLink>
          </li>

        </ul>
      </nav>

      <div className="sidebar-account" ref={accountMenuRef}>
        {user ? (
          <>
            <button
              type="button"
              className="account-avatar-button"
              onClick={() => setIsAccountMenuOpen((open) => !open)}
              aria-label={`Open account menu for ${user.email}`}
              aria-expanded={isAccountMenuOpen}
              aria-haspopup="menu"
              title={user.email}
            >
              <span className="account-avatar">{userInitial}</span>
              {isExpanded && <span className="account-user-label">{user.email}</span>}
            </button>

            {isAccountMenuOpen && (
              <div className="account-menu" role="menu">
                <div className="account-menu-user">
                  <span className="account-menu-initial">{userInitial}</span>
                  <span className="account-menu-email">{user.email}</span>
                </div>
                <button
                  type="button"
                  className="account-logout-button"
                  onClick={handleLogout}
                  role="menuitem"
                >
                  <LogOut size={18} />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <NavLink to="/login" className="account-signup-link">
            <span className="account-signup-icon">
              <User size={19} />
            </span>
            {isExpanded && <span>Login</span>}
          </NavLink>
        )}
      </div>
    </div>
  );
}

export default Sidebar;
