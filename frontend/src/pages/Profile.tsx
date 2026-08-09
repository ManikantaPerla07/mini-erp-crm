import { UserCircle, Mail, ShieldCheck } from "lucide-react";
import "./Profile.css";
export default function Profile() {
  const storedUser = localStorage.getItem("user");

  let user: {
    name?: string;
    email?: string;
    role?: string;
  } = {};

  try {
    user = storedUser ? JSON.parse(storedUser) : {};
  } catch {
    user = {};
  }

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div>
          <div className="page-eyebrow">ACCOUNT</div>
          <h1>My Profile</h1>
          <p>View your account information and workspace access.</p>
        </div>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">
          <UserCircle size={42} />
        </div>

        <div className="profile-details">
          <h2>{user.name || "System Admin"}</h2>

          <div className="profile-detail">
            <Mail size={18} />
            <span>{user.email || "admin@erp.com"}</span>
          </div>

          <div className="profile-detail">
            <ShieldCheck size={18} />
            <span>{user.role || "Administrator"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}