import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const InputField = ({ label, type = "text", onChange }) => (
  <div className="input-container">
    <label
      className="visually-hidden"
      htmlFor={`${label.toLowerCase()}Input`}
    >
      {label}
    </label>
    <input
      className="input-field"
      type={type}
      id={`${label.toLowerCase()}Input`}
      placeholder={label}
      aria-label={label}
      onChange={onChange}
    />
  </div>
);

function RegistrationForm() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3001/api/register', {
        email,
        username,
        password,
      });
      setMessage(response.data.message);
      navigate('/main'); // Redirect to MainSitePage after successful registration
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  return (
    <main className="registration-page">
      <section className="registration-container">
        <h1 className="registration-title">Registration</h1>
        <form className="registration-form" onSubmit={handleRegister}>
          <InputField label="Email" type="email" onChange={(e) => setEmail(e.target.value)} />
          <InputField label="Username" onChange={(e) => setUsername(e.target.value)} />
          <InputField label="Password" type="password" onChange={(e) => setPassword(e.target.value)} />
          <button className="submit-button" type="submit">
            Register
          </button>
          {message && <p>{message}</p>}
        </form>
        <a href="#" className="login-link" onClick={() => navigate('/login')}>
          Already have an account? Log In
        </a>
      </section>
   {<style jsx>{`
        .visually-hidden {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        .registration-page {
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #f3f2ee;
          padding: 80px 20px;
        }

        .registration-container {
          background: linear-gradient(
              rgba(0, 0, 0, 0.2),
              rgba(0, 0, 0, 0.2)
            ),
            #003b93;
          border-radius: 20px;
          padding: 40px 30px;
          max-width: 500px;
          width: 100%;
          text-align: center;
        }

   

        .registration-title {
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

        .submit-button {
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

        .submit-button:hover {
          background-color: #002d6b;
        }

        .login-link {
          color: #d9d9d9;
          font-size: 16px;
          text-decoration: none;
          margin-top: 20px;
          display: inline-block;
        }

        @media (max-width: 600px) {
          .registration-container {
            padding: 30px 20px;
          }

          .registration-title {
            font-size: 24px;
            margin-bottom: 20px;
          }

          .input-field {
            padding: 12px;
            font-size: 14px;
          }

          .submit-button {
            padding: 12px;
            font-size: 14px;
          }

          .login-link {
            font-size: 14px;
            margin-top: 15px;
          }
        }
      `}</style>
}
    </main>
  );
}

export default RegistrationForm;

      