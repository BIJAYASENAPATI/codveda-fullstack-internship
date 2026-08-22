import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:6000";

function UserProfileModal({ user: initialUser, isOwnProfile, onClose, onUpdate }) {
  const { token, updateCurrentUser } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(initialUser?.name || "");
  const [bio, setBio] = useState(initialUser?.bio || "");
  const [email, setEmail] = useState(initialUser?.email || "");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Sync state if initialUser changes
  useEffect(() => {
    setName(initialUser?.name || "");
    setBio(initialUser?.bio || "");
    setEmail(initialUser?.email || "");
    setIsEditing(false);
    setError("");
    setSuccess("");
  }, [initialUser]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await axios.put(
        `${API_URL}/api/users/profile`,
        { name, bio, email },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        const updated = response.data.data;
        setSuccess("Profile updated successfully!");
        
        // Update local auth context
        updateCurrentUser(updated);
        
        // Notify parent Chat page (to reload chats, names, etc.)
        if (onUpdate) {
          onUpdate(updated);
        }

        setTimeout(() => {
          setIsEditing(false);
          setSuccess("");
        }, 1200);
      }
    } catch (err) {
      console.error("UPDATE PROFILE ERROR:", err);
      setError(
        err.response?.data?.message || "Something went wrong while updating profile"
      );
    } finally {
      setLoading(false);
    }
  };

  const getInitial = (nameVal) => {
    return nameVal?.charAt(0)?.toUpperCase() || "?";
  };

  return (
    <div className="forward-modal-backdrop" onClick={onClose}>
      <div 
        className="forward-modal-container profile-modal-container"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="forward-modal-header">
          <h3>{isOwnProfile ? "My Profile" : `${initialUser?.name}'s Profile`}</h3>
          <button type="button" className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="forward-modal-body profile-modal-body">
          {/* Avatar Area */}
          <div className="profile-avatar-wrapper">
            <div className="profile-avatar-large">
              {getInitial(name || initialUser?.name)}
            </div>
            {isOwnProfile && !isEditing && (
              <button 
                type="button" 
                className="profile-edit-toggle-btn"
                onClick={() => setIsEditing(true)}
              >
                ✏️ Edit Profile
              </button>
            )}
          </div>

          {error && <div className="error-message profile-alert">{error}</div>}
          {success && <div className="success-message profile-alert">{success}</div>}

          {/* Form / Details */}
          <form onSubmit={handleSave} className="profile-form">
            <div className="profile-field">
              <label className="profile-label">Name</label>
              {isOwnProfile && isEditing ? (
                <input
                  type="text"
                  className="profile-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  maxLength={100}
                  disabled={loading}
                  required
                />
              ) : (
                <div className="profile-value">{initialUser?.name || "No name set"}</div>
              )}
            </div>

            <div className="profile-field">
              <label className="profile-label">About</label>
              {isOwnProfile && isEditing ? (
                <textarea
                  className="profile-textarea"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  maxLength={255}
                  disabled={loading}
                  rows={3}
                />
              ) : (
                <div className="profile-value bio-value">
                  {initialUser?.bio || "No bio description yet."}
                </div>
              )}
            </div>

            {isOwnProfile && (
              <div className="profile-field">
                <label className="profile-label">Username / Email</label>
                {isEditing ? (
                  <input
                    type="email"
                    className="profile-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    maxLength={150}
                    disabled={loading}
                    required
                  />
                ) : (
                  <div className="profile-value">{initialUser?.email || "No email set"}</div>
                )}
              </div>
            )}

            {isOwnProfile && isEditing && (
              <div className="profile-actions">
                <button
                  type="button"
                  className="profile-cancel-btn"
                  onClick={() => {
                    setIsEditing(false);
                    setName(initialUser?.name || "");
                    setBio(initialUser?.bio || "");
                    setEmail(initialUser?.email || "");
                    setError("");
                  }}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="profile-save-btn"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserProfileModal;
