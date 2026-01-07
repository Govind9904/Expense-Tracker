import React, { useEffect, useState } from "react";
import "./Profile.css";
import axios from "axios";

function Profile() {
  const [edit, setEdit] = useState(false);
  const [user, setUser] = useState(null);

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const getUserProfile = async () => {
    try {
      const res = await axios.post(
        "http://127.0.0.1:3000/api/get/user/profile",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUser(res.data.data[0]);
    } catch (err) {
      console.log(err);
    }
  };

  const updateProfile = async () => {
  try {
    const res = await axios.post(
      "http://127.0.0.1:3000/api/update/user/profile",
      {
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        address: user.address,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    setUser(res.data.data);
    setEdit(false);
  } catch (err) {
    console.error("Update failed:", err.response?.data || err.message);
  }
};

  useEffect(() => {
    if (token) getUserProfile();
  }, []);

  if (!user) return <div className="profile-loading">Loading...</div>;

  return (
    <div className="profile-root">
      <div className="profile-card">
        <div className="profile-avatar-row">
          <img
            className="profile-avatar"
            alt="avatar"
          />
        </div>

        <div className="profile-info">
          {[
            { label: "First Name", name: "first_name" },
            { label: "Last Name", name: "last_name" },
            { label: "Email", name: "email", disabled: true },
            { label: "Phone", name: "phone" },
            { label: "Address", name: "address" },
          ].map((field) => (
            <div className="profile-field" key={field.name}>
              <label>{field.label}</label>

              {edit && !field.disabled ? (
                <input
                  name={field.name}
                  value={user[field.name] || ""}
                  onChange={handleChange}
                />
              ) : (
                <span>{user[field.name] || "-"}</span>
              )}
            </div>
          ))}
        </div>

        <button
          className="profile-edit-btn"
          onClick={edit ? updateProfile : () => setEdit(true)}
        >
          {edit ? "Save Changes" : "Edit Profile"}
        </button>
      </div>
    </div>
  );
}

export default Profile;
