import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  Lock,
  Palette,
  Save,
  Settings as SettingsIcon,
  Shield,
  User,
} from "lucide-react";
import "./Settings.css";

interface SettingsState {
  fullName: string;
  email: string;
  role: string;
  emailNotifications: boolean;
  followUpReminders: boolean;
  lowStockAlerts: boolean;
  compactMode: boolean;
}

const DEFAULT_SETTINGS: SettingsState = {
  fullName: "System Admin",
  email: "admin@erp.com",
  role: "Administrator",
  emailNotifications: true,
  followUpReminders: true,
  lowStockAlerts: true,
  compactMode: false,
};

export default function Settings() {
  const [settings, setSettings] = useState<SettingsState>(
    DEFAULT_SETTINGS
  );

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedSettings = localStorage.getItem("erp_settings");

    if (!storedSettings) {
      return;
    }

    try {
      const parsed = JSON.parse(storedSettings);

      setSettings({
        ...DEFAULT_SETTINGS,
        ...parsed,
      });
    } catch {
      localStorage.removeItem("erp_settings");
    }
  }, []);

  const updateSetting = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(
      "erp_settings",
      JSON.stringify(settings)
    );

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 2500);
  };

  return (
    <div className="settings-page">
      <div className="settings-header">
        <div>
          <div className="settings-eyebrow">
            WORKSPACE CONFIGURATION
          </div>

          <h1>Settings</h1>

          <p>
            Manage your profile, notifications and workspace
            preferences.
          </p>
        </div>

        <button
          className="settings-save-button"
          onClick={handleSave}
        >
          {saved ? <Check size={17} /> : <Save size={17} />}

          {saved ? "Saved" : "Save changes"}
        </button>
      </div>

      {saved && (
        <div className="settings-success">
          <Check size={18} />

          <span>
            Your settings have been saved successfully.
          </span>
        </div>
      )}

      <div className="settings-layout">
        <div className="settings-main">
          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <User size={20} />
              </div>

              <div>
                <h2>Profile</h2>

                <p>
                  Your Nexora workspace account information.
                </p>
              </div>
            </div>

            <div className="settings-form-grid">
              <div className="settings-field">
                <label htmlFor="fullName">
                  Full name
                </label>

                <input
                  id="fullName"
                  type="text"
                  value={settings.fullName}
                  onChange={(event) =>
                    updateSetting(
                      "fullName",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="settings-field">
                <label htmlFor="email">
                  Email address
                </label>

                <input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(event) =>
                    updateSetting(
                      "email",
                      event.target.value
                    )
                  }
                />
              </div>

              <div className="settings-field">
                <label htmlFor="role">
                  Role
                </label>

                <input
                  id="role"
                  type="text"
                  value={settings.role}
                  disabled
                />
              </div>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <Bell size={20} />
              </div>

              <div>
                <h2>Notifications</h2>

                <p>
                  Choose which operational alerts you want
                  to receive.
                </p>
              </div>
            </div>

            <div className="settings-options">
              <label className="settings-option">
                <div className="settings-option-text">
                  <strong>Email notifications</strong>

                  <span>
                    Receive important workspace updates by
                    email.
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(event) =>
                    updateSetting(
                      "emailNotifications",
                      event.target.checked
                    )
                  }
                />

                <span className="settings-toggle" />
              </label>

              <label className="settings-option">
                <div className="settings-option-text">
                  <strong>Follow-up reminders</strong>

                  <span>
                    Get reminders for upcoming customer
                    follow-ups.
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={settings.followUpReminders}
                  onChange={(event) =>
                    updateSetting(
                      "followUpReminders",
                      event.target.checked
                    )
                  }
                />

                <span className="settings-toggle" />
              </label>

              <label className="settings-option">
                <div className="settings-option-text">
                  <strong>Low stock alerts</strong>

                  <span>
                    Receive alerts when inventory reaches its
                    minimum level.
                  </span>
                </div>

                <input
                  type="checkbox"
                  checked={settings.lowStockAlerts}
                  onChange={(event) =>
                    updateSetting(
                      "lowStockAlerts",
                      event.target.checked
                    )
                  }
                />

                <span className="settings-toggle" />
              </label>
            </div>
          </section>

          <section className="settings-card">
            <div className="settings-card-header">
              <div className="settings-card-icon">
                <Palette size={20} />
              </div>

              <div>
                <h2>Appearance</h2>

                <p>
                  Customize how the workspace feels while you
                  work.
                </p>
              </div>
            </div>

            <label className="settings-option">
              <div className="settings-option-text">
                <strong>Compact mode</strong>

                <span>
                  Use a denser layout to display more
                  information on screen.
                </span>
              </div>

              <input
                type="checkbox"
                checked={settings.compactMode}
                onChange={(event) =>
                  updateSetting(
                    "compactMode",
                    event.target.checked
                  )
                }
              />

              <span className="settings-toggle" />
            </label>
          </section>
        </div>

        <aside className="settings-sidebar">
          <div className="settings-info-card">
            <div className="settings-info-icon">
              <Shield size={22} />
            </div>

            <h3>Secure workspace</h3>

            <p>
              Your workspace preferences are stored locally
              in this browser.
            </p>

            <div className="settings-security-row">
              <Lock size={16} />

              <span>Local preferences enabled</span>
            </div>
          </div>

          <div className="settings-info-card settings-about-card">
            <SettingsIcon size={22} />

            <h3>Nexora ERP</h3>

            <p>
              Workspace configuration and operational
              preferences.
            </p>

            <span className="settings-version">
              Version 1.0
            </span>
          </div>
        </aside>
      </div>
    </div>
  );
}