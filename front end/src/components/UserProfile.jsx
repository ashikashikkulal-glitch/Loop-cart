// src/components/UserProfile.jsx
import React, { useEffect, useState } from "react";
import "../styles/UserProfile.css";

const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [avatarDataUrl, setAvatarDataUrl] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // overview | edit | password | membership

  // Edit form
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");

  // Change password form (UI only – no backend)
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");

  // Membership info from localStorage
  const [membership, setMembership] = useState(null);

  useEffect(() => {
    // Load user
    const stored =
      localStorage.getItem("loopcart_user") ||
      localStorage.getItem("user");
    if (stored) {
      const u = JSON.parse(stored);
      setUser(u);
      setEditName(u.name || "");
      setEditPhone(u.phone || "");
    }

    // Load avatar if user uploaded earlier
    const storedAvatar = localStorage.getItem("loopcart_avatar");
    if (storedAvatar) setAvatarDataUrl(storedAvatar);

    // Load membership info
    const storedMembership = localStorage.getItem("loopcart_membership");
    if (storedMembership) {
      try {
        setMembership(JSON.parse(storedMembership));
      } catch {
        setMembership(null);
      }
    }
  }, []);

  if (!user) {
    return (
      <div className="profile-wrapper">
        <div className="profile-card">
          <h2 className="text-gradient mb-2">User Profile</h2>
          <p>You are not logged in. Please login to view your profile.</p>
        </div>
      </div>
    );
  }

  const firstLetter =
    (user.name?.[0] || user.email?.[0] || "U").toUpperCase();

  // Handle avatar upload – saved as data URL in localStorage
  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setAvatarDataUrl(dataUrl);
      localStorage.setItem("loopcart_avatar", dataUrl);

      // 🔔 notify App.jsx that avatar changed
      window.dispatchEvent(new Event("avatar-updated"));
    };
    reader.readAsDataURL(file);
  };

  // Save basic profile (name, phone) in localStorage only
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!editName.trim()) {
      alert("Name cannot be empty");
      return;
    }

    const updated = {
      ...user,
      name: editName.trim(),
      phone: editPhone.trim() || undefined,
    };

    setUser(updated);

    localStorage.setItem("loopcart_user", JSON.stringify(updated));
    localStorage.setItem("user", JSON.stringify(updated));

    alert("Profile updated locally (demo only).");
  };

  // Change password – only frontend demo, NO real change
  const handleChangePassword = (e) => {
    e.preventDefault();
    if (!newPw || !confirmPw) {
      alert("Please enter new password and confirm it.");
      return;
    }
    if (newPw.length < 6) {
      alert("New password should be at least 6 characters.");
      return;
    }
    if (newPw !== confirmPw) {
      alert("New password and confirm password do not match.");
      return;
    }

    alert(
      "Password change UI is working (validation done), but real update needs backend API.\nRight now this is a safe demo only."
    );
    setCurrentPw("");
    setNewPw("");
    setConfirmPw("");
  };

  const membershipLabel = membership
    ? `${membership.plan} member`
    : "No membership yet";

  return (
    <div className="profile-wrapper">
      <div className="profile-card">
        {/* Header: avatar + basic info */}
        <div className="profile-header">
          <div className="profile-avatar">
            {avatarDataUrl ? (
              <img src={avatarDataUrl} alt="User avatar" />
            ) : (
              firstLetter
            )}
          </div>
          <div className="profile-main-info">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <div className="profile-badge">
              <span>●</span>
              <span>{membershipLabel}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="profile-tabs">
          <button
            type="button"
            className={`profile-tab-btn ${
              activeTab === "overview" ? "active" : ""
            }`}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            type="button"
            className={`profile-tab-btn ${
              activeTab === "edit" ? "active" : ""
            }`}
            onClick={() => setActiveTab("edit")}
          >
            Edit Profile
          </button>
          <button
            type="button"
            className={`profile-tab-btn ${
              activeTab === "password" ? "active" : ""
            }`}
            onClick={() => setActiveTab("password")}
          >
            Change Password
          </button>
          <button
            type="button"
            className={`profile-tab-btn ${
              activeTab === "membership" ? "active" : ""
            }`}
            onClick={() => setActiveTab("membership")}
          >
            Membership
          </button>
        </div>

        {/* TAB CONTENTS */}
        {activeTab === "overview" && (
          <div className="profile-overview-grid">
            <div className="profile-section-card">
              <h4>Account Details</h4>
              <p>
                <strong>Name:</strong> {user.name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Phone:</strong> {user.phone || "Not added"}
              </p>
              <p>
                <strong>Member Since:</strong>{" "}
                {user.createdAt
                  ? user.createdAt.slice(0, 10)
                  : "Not available (demo user)"}
              </p>
            </div>

            <div className="profile-section-card">
              <h4>Membership</h4>
              {membership ? (
                <>
                  <p>
                    <strong>Plan:</strong> {membership.plan}
                  </p>
                  <p>
                    <strong>Started:</strong>{" "}
                    {membership.startedAt
                      ? membership.startedAt.slice(0, 10)
                      : "N/A"}
                  </p>
                  <span className="membership-pill">
                    Active (local demo, no billing)
                  </span>
                </>
              ) : (
                <>
                  <p>
                    You don&apos;t have a membership stored yet. Choose one in
                    the Premium Membership section on the home page.
                  </p>
                  <button
                    type="button"
                    className="btn btn-gradient mt-2"
                    onClick={() => {
                      window.location.href = "/#paid-access";
                    }}
                  >
                    View Membership Plans
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "edit" && (
          <form className="profile-form mt-2" onSubmit={handleSaveProfile}>
            <div className="avatar-upload">
              <div className="profile-avatar">
                {avatarDataUrl ? (
                  <img src={avatarDataUrl} alt="User avatar" />
                ) : (
                  firstLetter
                )}
              </div>
              <div>
                <label className="form-label d-block mb-1">
                  Profile Picture
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
                <small className="text-muted d-block">
                  (Demo) Stored only in your browser using localStorage.
                </small>
              </div>
            </div>

            <div className="row mt-3">
              <div className="col-md-6 mb-3">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Phone (optional)</label>
                <input
                  type="text"
                  className="form-control"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mt-2">
              <button type="submit" className="btn btn-gradient">
                Save Changes
              </button>
            </div>
          </form>
        )}

        {activeTab === "password" && (
          <form className="profile-form mt-2" onSubmit={handleChangePassword}>
            <p className="password-hint mb-3">
              This is a UI demo only. Real password changes must be handled by
              the backend (API) for security.
            </p>
            <div className="mb-3">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-control"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
              />
            </div>
            <div className="d-flex justify-content-end">
              <button type="submit" className="btn btn-gradient">
                Change Password (Demo)
              </button>
            </div>
          </form>
        )}

        {activeTab === "membership" && (
          <div className="profile-section-card mt-2">
            <h4>Membership Details</h4>
            {membership ? (
              <>
                <p>
                  <strong>Current Plan:</strong> {membership.plan}
                </p>
                <p>
                  <strong>Started:</strong>{" "}
                  {membership.startedAt
                    ? membership.startedAt.slice(0, 10)
                    : "N/A"}
                </p>
                <p className="text-muted">
                  This membership is stored only in your browser. A real
                  application would manage billing and renewals on the server.
                </p>
              </>
            ) : (
              <>
                <p>No membership stored yet.</p>
                <button
                  type="button"
                  className="btn btn-gradient mt-2"
                  onClick={() => {
                    window.location.href = "/#paid-access";
                  }}
                >
                  Choose a Membership Plan
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
