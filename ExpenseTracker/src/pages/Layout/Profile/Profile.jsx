import React, { useState } from 'react';
import './Profile.css';

function Profile() {
  // Placeholder user data
  const [edit, setEdit] = useState(false);
  const [user, setUser] = useState({
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '+91 9876543210',
    address: '123, Main Street, Mumbai, India',
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  return (
    <div className="profile-root">
      <div className="profile-card">
        <div className="profile-avatar-row">
          <img className="profile-avatar" src={user.avatar} alt="avatar" />
        </div>
        <div className="profile-info">
          <div className="profile-field">
            <label>Name:</label>
            {edit ? (
              <input name="name" value={user.name} onChange={handleChange} />
            ) : (
              <span>{user.name}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Email:</label>
            {edit ? (
              <input name="email" value={user.email} onChange={handleChange} />
            ) : (
              <span>{user.email}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Phone:</label>
            {edit ? (
              <input name="phone" value={user.phone} onChange={handleChange} />
            ) : (
              <span>{user.phone}</span>
            )}
          </div>
          <div className="profile-field">
            <label>Address:</label>
            {edit ? (
              <input name="address" value={user.address} onChange={handleChange} />
            ) : (
              <span>{user.address}</span>
            )}
          </div>
        </div>
        <button className="profile-edit-btn" onClick={() => setEdit(!edit)}>
          {edit ? 'Save' : 'Edit Profile'}
        </button>
      </div>
    </div>
  );
}

export default Profile;