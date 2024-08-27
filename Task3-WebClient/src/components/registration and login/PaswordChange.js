import React, { useState } from 'react';
import axios from 'axios';

const InputField = ({ label, id, type = "text", onChange }) => (
  <div className="input-container">
    <label htmlFor={id} className="visually-hidden">
      {label}
    </label>
    <input
      type={type}
      id={id}
      className="input-field"
      placeholder={label}
      aria-label={label}
      onChange={onChange}
    />
  </div>
);

function PasswordChangeForm() {
  const [username, setUsername] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/passwordChange', {
        username,
        oldPassword,
        newPassword,
      });
      setMessage(response.data.message);
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  const handleBackClick = () => {
    // Go back to the previous page
    window.history.back();
  };

  return (
    <>
      <style jsx>{`
        .page-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          background-color: #f3f2ee;
          padding: 20px;
        }

        .form-container {
          background-color: #003b93;
          border-radius: 20px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          padding: 40px 30px;
          max-width: 500px;
          width: 100%;
          text-align: center;
        }

        .form-title {
          color: #fff;
          font-size: 28px;
          font-family: Montserrat, sans-serif;
          margin-bottom: 30px;
        }

        .input-container {
          margin-bottom: 20px;
        }

        .input-field {
          width: 100%;
          padding: 15px;
          font-size: 16px;
          border-radius: 8px;
          border: none;
          background-color: #001732;
          color: rgba(255, 255, 255, 0.8);
          outline: none;
          font-family: Montserrat, sans-serif;
        }

        .submit-button,
        .back-button {
          background-color: #001732;
          color: #fff;
          border-radius: 8px;
          padding: 15px;
          border: none;
          cursor: pointer;
          font-size: 16px;
          font-weight: 600;
          margin-top: 20px;
          width: 100%;
        }

        .submit-button:hover,
        .back-button:hover {
          background-color: #002d6b;
        }

        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border-width: 0;
        }

        @media (max-width: 600px) {
          .form-container {
            padding: 30px 20px;
          }

          .form-title {
            font-size: 24px;
            margin-bottom: 20px;
          }

          .input-field {
            padding: 12px;
            font-size: 14px;
          }

          .submit-button,
          .back-button {
            padding: 12px;
            font-size: 14px;
          }
        }
      `}</style>
      <main className="page-container">
        <form className="form-container" onSubmit={handlePasswordChange}>
          <h1 className="form-title">Password Change</h1>
          <InputField label="Username" id="username" onChange={(e) => setUsername(e.target.value)} />
          <InputField label="Old Password" id="old-password" type="password" onChange={(e) => setOldPassword(e.target.value)} />
          <InputField label="New Password" id="new-password" type="password" onChange={(e) => setNewPassword(e.target.value)} />
          <InputField label="Confirm Password" id="confirm-password" type="password" onChange={(e) => setConfirmPassword(e.target.value)} />
          <button type="submit" className="submit-button">
            Change Password
          </button>
          <button type="button" className="back-button" onClick={handleBackClick}>
            Back
          </button>
          {message && <p>{message}</p>}
        </form>
      </main>
    </>
  );
}

export default PasswordChangeForm;
