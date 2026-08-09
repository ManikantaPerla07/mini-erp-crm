import { useState } from "react";
import type { FormEvent } from "react";
import { Eye, EyeOff, LockKeyhole, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import api from "../services/api";

type LoginProps = {
  onLogin: (token: string, user: LoginUser) => void;
};

type LoginUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type LoginResponse = {
  success: boolean;
  data: {
    token: string;
    user: LoginUser;
  };
};

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState("admin@erp.com");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post<LoginResponse>("/auth/login", {
        email: email.trim(),
        password,
      });

      const { token, user } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      onLogin(token, user);
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Unable to sign in. Please check your credentials.";

      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-background">
        <div className="login-glow login-glow-one" />
        <div className="login-glow login-glow-two" />
        <div className="login-grid" />
      </div>

      <motion.div
        className="login-shell"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="login-brand">
          <div className="login-brand-mark">
            N
          </div>

          <div>
            <div className="login-brand-name">NEXORA</div>
            <div className="login-brand-subtitle">
              ERP OPERATIONS
            </div>
          </div>
        </div>

        <div className="login-card">
          <div className="login-card-header">
            <div className="login-security-icon">
              <ShieldCheck size={21} />
            </div>

            <div>
              <span className="login-eyebrow">
                SECURE ACCESS
              </span>

              <h1>Welcome back</h1>

              <p>
                Sign in to your Nexora operations workspace.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="login-field">
              <label htmlFor="email">
                Email address
              </label>

              <div className="login-input-wrapper">
                <Mail size={18} />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="login-field">
              <label htmlFor="password">
                Password
              </label>

              <div className="login-input-wrapper">
                <LockKeyhole size={18} />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((value) => !value)
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                className="login-error"
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="login-spinner" />
                  Signing in...
                </>
              ) : (
                <>
                  Enter workspace
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            <span className="login-footer-dot" />
            Secure ERP workspace
          </div>
        </div>

        <p className="login-copyright">
          © {new Date().getFullYear()} Nexora ERP. All rights reserved.
        </p>
      </motion.div>
    </div>
  );
}