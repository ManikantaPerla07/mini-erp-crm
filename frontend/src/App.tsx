import { useState } from "react";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  LayoutDashboard,
  Menu,
  Package,
  Search,
  Settings,
  ShoppingCart,
  Users,
  Warehouse,
  X,
  BarChart3,
  LogOut,
  UserCircle,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useDashboard } from "./hooks/useDashboard";
import Login from "./pages/Login";
import "./App.css";
import Customers from "./pages/Customers";
import Products from "./pages/Products";
import Inventory from "./pages/Inventory";
import Challans from "./Challans";
import Followups from "./pages/Followups";
import Reports from "./pages/Reports";
import SettingsPage from "./pages/Settings";
import Profile from "./pages/Profile";


type NavItem = {
  label: string;
  icon: React.ComponentType<{ size?: number; strokeWidth?: number }>;
  path: string;
};

const mainNavigation: NavItem[] = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
];

const managementNavigation: NavItem[] = [
  {
    label: "Customers",
    icon: Users,
    path: "/customers",
  },
  {
    label: "Products",
    icon: Package,
    path: "/products",
  },
  {
    label: "Inventory",
    icon: Warehouse,
    path: "/inventory",
  },
  {
    label: "Challans",
    icon: ClipboardList,
    path: "/challans",
  },
  {
    label: "Follow-ups",
    icon: ShoppingCart,
    path: "/followups",
  },
];

const analyticsNavigation: NavItem[] = [
  {
    label: "Reports",
    icon: BarChart3,
    path: "/reports",
  },
];

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activePath, setActivePath] = useState("/");

  const [authenticated, setAuthenticated] = useState(
    () => Boolean(localStorage.getItem("token"))
  );

  const handleLogin = () => {
    setAuthenticated(true);
    setActivePath("/");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setAuthenticated(false);
    setProfileOpen(false);
    setActivePath("/");
  };

  const handleNavigation = (path: string) => {
    setActivePath(path);
    setSidebarOpen(false);
  };

  if (!authenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-shell">
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            className="sidebar-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`sidebar ${sidebarOpen ? "sidebar-mobile-open" : ""}`}
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{
          duration: 0.45,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        {/* Brand */}
        <div className="brand">
          <div className="brand-mark">
            <span>N</span>
          </div>

          <div className="brand-content">
            <div className="brand-name">NEXORA</div>
            <div className="brand-subtitle">ERP OPERATIONS</div>
          </div>

          <button
            className="mobile-close"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* Workspace */}
        <div className="workspace-card">
          <div className="workspace-icon">
            <Warehouse size={17} />
          </div>

          <div className="workspace-info">
            <span className="workspace-label">WORKSPACE</span>
            <span className="workspace-name">Main Operations</span>
          </div>

          <ChevronDown size={15} className="workspace-chevron" />
        </div>

        {/* Navigation */}
        <div className="navigation">
          <NavigationSection
            title="Overview"
            items={mainNavigation}
            activePath={activePath}
            onNavigate={handleNavigation}
          />

          <NavigationSection
            title="Management"
            items={managementNavigation}
            activePath={activePath}
            onNavigate={handleNavigation}
          />

          <NavigationSection
            title="Analytics"
            items={analyticsNavigation}
            activePath={activePath}
            onNavigate={handleNavigation}
          />
        </div>

        {/* Bottom section */}
        <div className="sidebar-bottom">
          <button
            className="sidebar-settings"
            onClick={() => handleNavigation("/settings")}
          >
            <Settings size={18} />
            <span>Settings</span>
          </button>

          <div className="admin-card">
            <div className="admin-avatar">
              SA
            </div>

            <div className="admin-info">
              <span className="admin-name">System Admin</span>
              <span className="admin-role">Administrator</span>
            </div>

            <div className="online-dot" />
          </div>
        </div>
      </motion.aside>

      {/* Main application */}
      <main className="main-area">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={22} />
            </button>

            <div className="breadcrumb">
              <span>Workspace</span>
              <ChevronRight size={15} />
              <strong>
                {getPageTitle(activePath)}
              </strong>
            </div>
          </div>

          <div className="topbar-right">
            {/* Search */}
            <div className="global-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search anything..."
              />
              <span className="search-shortcut">⌘ K</span>
            </div>

            {/* Notification */}
            <button className="icon-button notification-button">
              <Bell size={19} />
              <span className="notification-dot" />
            </button>

            {/* Profile */}
            <div className="profile-wrapper">
              <button
                className="profile-button"
                onClick={() => setProfileOpen((value) => !value)}
              >
                <div className="profile-avatar">
                  SA
                </div>

                <div className="profile-text">
                  <span className="profile-name">
                    System Admin
                  </span>

                  <span className="profile-role">
                    Administrator
                  </span>
                </div>

                <ChevronDown size={16} />
              </button>

              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    className="profile-menu"
                    initial={{
                      opacity: 0,
                      y: -8,
                      scale: 0.97,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                      scale: 1,
                    }}
                    exit={{
                      opacity: 0,
                      y: -8,
                      scale: 0.97,
                    }}
                  >
                    <button
  className="profile-menu-item"
  onClick={() => handleNavigation("/profile")}
>
  <UserCircle size={18} />
  <span>My Profile</span>
</button>

                    <button
  className="profile-menu-item"
  onClick={() => handleNavigation("/settings")}
>
  <Settings size={18} />
  <span>Settings</span>
</button>

                    <div className="profile-menu-divider" />

                    <button
  className="logout-button"
  onClick={handleLogout}
>
  <LogOut size={17} />
  Sign out
</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
<section className="page-container">
  {activePath === "/" && <DashboardPlaceholder />}

  {activePath === "/customers" && <Customers />}

  {activePath === "/products" && <Products />}

  {activePath === "/inventory" && <Inventory />}

  {activePath === "/challans" && <Challans />}

  {activePath === "/followups" && <Followups />}

  {activePath === "/reports" && <Reports />}

  {activePath === "/settings" && <SettingsPage />}

  {activePath === "/profile" && <Profile />}


  {activePath !== "/" &&
    activePath !== "/customers" &&
    activePath !== "/products" &&
    activePath !== "/inventory" &&
    activePath !== "/challans" && 
    activePath !== "/followups" &&
     activePath !== "/reports" && 
     activePath !== "/settings" && (
      <div className="dashboard-error">
        <div className="error-icon">
          <AlertTriangle size={25} />
        </div>

        <h2>Coming soon</h2>

        <p>
          This module is currently being prepared for the
          Nexora workspace.
        </p>
      </div>
    )}
</section>
      </main>
    </div>
  );
}

function NavigationSection({
  title,
  items,
  activePath,
  onNavigate,
}: {
  title: string;
  items: NavItem[];
  activePath: string;
  onNavigate: (path: string) => void;
}) {
  return (
    <div className="nav-section">
      <div className="nav-section-title">
        {title}
      </div>

      <div className="nav-items">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activePath === item.path;

          return (
            <button
              key={item.path}
              className={`nav-item ${
                active ? "nav-item-active" : ""
              }`}
              onClick={() => onNavigate(item.path)}
            >
              <span className="nav-icon">
                <Icon
                  size={18}
                  strokeWidth={active ? 2.2 : 1.8}
                />
              </span>

              <span className="nav-label">
                {item.label}
              </span>

              {active && (
                <motion.span
                  className="active-indicator"
                  layoutId="active-nav"
                  transition={{
                    type: "spring",
                    stiffness: 400,
                    damping: 30,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DashboardPlaceholder() {
  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useDashboard();

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (isError || !data) {
    return (
      <DashboardError
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <motion.div
      className="dashboard-placeholder"
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.5,
      }}
    >
      <div className="hero-header">
        <div>
          <div className="eyebrow">
            OPERATIONS OVERVIEW
          </div>

          <h1>
            Good afternoon, Admin.
          </h1>

          <p>
            Here's what's happening across your
            business today.
          </p>
        </div>

        <div className="live-status">
          <span className="live-dot" />
          All systems operational
        </div>
      </div>

      <div className="dashboard-grid">
        <DashboardCard
          title="Total Customers"
          value={data.totalCustomers.toLocaleString()}
          description="Active customers"
          icon={<Users size={20} />}
        />

        <DashboardCard
          title="Products"
          value={data.totalProducts.toLocaleString()}
          description="Products in catalog"
          icon={<Package size={20} />}
        />

        <DashboardCard
          title="Inventory Value"
          value={formatCurrency(data.inventoryValue)}
          description="Current inventory"
          icon={<Warehouse size={20} />}
        />

        <DashboardCard
          title="Challans"
          value={data.totalChallans.toLocaleString()}
          description="Total challans"
          icon={<ClipboardList size={20} />}
        />
      </div>

      <div className="dashboard-secondary-grid">
        <motion.div
          className="secondary-card"
          whileHover={{ y: -3 }}
        >
          <div className="secondary-card-header">
            <div>
              <span className="secondary-label">
                INVENTORY HEALTH
              </span>

              <h3>
                {data.lowStockProducts === 0
                  ? "Everything looks healthy"
                  : `${data.lowStockProducts} products need attention`}
              </h3>
            </div>

            <div
              className={`secondary-icon ${
                data.lowStockProducts > 0
                  ? "warning-icon"
                  : "success-icon"
              }`}
            >
              {data.lowStockProducts > 0 ? (
                <AlertTriangle size={19} />
              ) : (
                <Warehouse size={19} />
              )}
            </div>
          </div>

          <div className="health-status">
            <span
              className={
                data.lowStockProducts > 0
                  ? "health-warning"
                  : "health-good"
              }
            >
              {data.lowStockProducts > 0
                ? "Attention required"
                : "Inventory is healthy"}
            </span>

            <span>
              {data.lowStockProducts} low-stock items
            </span>
          </div>
        </motion.div>

        <motion.div
          className="secondary-card"
          whileHover={{ y: -3 }}
        >
          <div className="secondary-card-header">
            <div>
              <span className="secondary-label">
                FOLLOW-UPS
              </span>

              <h3>
                {data.upcomingFollowups === 0
                  ? "No upcoming follow-ups"
                  : `${data.upcomingFollowups} follow-ups upcoming`}
              </h3>
            </div>

            <div className="secondary-icon primary-icon">
              <ShoppingCart size={19} />
            </div>
          </div>

          <div className="health-status">
            <span className="health-good">
              {data.upcomingFollowups === 0
                ? "You're all caught up"
                : "Upcoming activity"}
            </span>

            <span>
              {data.upcomingFollowups} scheduled
            </span>
          </div>
        </motion.div>
      </div>

      <div className="welcome-panel">
        <div className="welcome-content">
          <span className="welcome-tag">
            NEXORA ERP
          </span>

          <h2>
            Your business,
            <br />
            beautifully organized.
          </h2>

          <p>
            Manage customers, products, inventory,
            challans and follow-ups from one
            intelligent operations workspace.
          </p>
        </div>

        <div className="welcome-graphic">
          <div className="graphic-orbit orbit-one" />
          <div className="graphic-orbit orbit-two" />

          <div className="graphic-core">
            N
          </div>
        </div>
      </div>
    </motion.div>
  );
}
function formatCurrency(value: number) {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)}L`;
  }

  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }

  return `₹${value.toLocaleString("en-IN")}`;
}

function DashboardLoading() {
  return (
    <div className="dashboard-placeholder">
      <div className="hero-header">
        <div>
          <div className="skeleton skeleton-eyebrow" />
          <div className="skeleton skeleton-title" />
          <div className="skeleton skeleton-subtitle" />
        </div>

        <div className="skeleton skeleton-status" />
      </div>

      <div className="dashboard-grid">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            className="metric-card"
            key={index}
          >
            <div className="skeleton skeleton-icon" />

            <div className="skeleton skeleton-value" />

            <div className="skeleton skeleton-text" />

            <div className="skeleton skeleton-small" />
          </div>
        ))}
      </div>

      <div className="dashboard-secondary-grid">
        <div className="secondary-card">
          <div className="skeleton skeleton-large" />
          <div className="skeleton skeleton-medium" />
        </div>

        <div className="secondary-card">
          <div className="skeleton skeleton-large" />
          <div className="skeleton skeleton-medium" />
        </div>
      </div>
    </div>
  );
}

function DashboardError({
  onRetry,
}: {
  onRetry: () => void;
}) {
  return (
    <motion.div
      className="dashboard-error"
      initial={{
        opacity: 0,
        scale: 0.98,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
    >
      <div className="error-icon">
        <AlertTriangle size={25} />
      </div>

      <h2>
        Unable to load dashboard
      </h2>

      <p>
        We couldn't retrieve the latest
        operations data from the server.
      </p>

      <button
        className="retry-button"
        onClick={onRetry}
      >
        <RefreshCw size={16} />
        Try again
      </button>
    </motion.div>
  );
}

function DashboardCard({
  title,
  value,
  description,
  icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      className="metric-card"
      whileHover={{
        y: -4,
      }}
      transition={{
        duration: 0.2,
      }}
    >
      <div className="metric-top">
        <div className="metric-icon">
          {icon}
        </div>

        <span className="metric-arrow">
          <ChevronRight size={16} />
        </span>
      </div>

      <div className="metric-value">
        {value}
      </div>

      <div className="metric-title">
        {title}
      </div>

      <div className="metric-description">
        {description}
      </div>
    </motion.div>
  );
}

function getPageTitle(path: string) {
  const titles: Record<string, string> = {
    "/": "Dashboard",
    "/customers": "Customers",
    "/products": "Products",
    "/inventory": "Inventory",
    "/challans": "Challans",
    "/followups": "Follow-ups",
    "/reports": "Reports",
    "/settings": "Settings",
  };

  return titles[path] ?? "Dashboard";
}
export default App;