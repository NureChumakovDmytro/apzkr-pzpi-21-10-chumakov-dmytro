import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:3001/api/login', {
        username,
        password,
      });
      localStorage.setItem('token', response.data.token); // Save the JWT token
      setMessage(response.data.message);
      navigate('/main'); // Redirect to MainSitePage after successful login
    } catch (error) {
      setMessage(error.response.data.error);
    }
  };

  return (
    <>
     
      <main className="loging-page">
      <section className="loging-container">
      <h1 className="loging-title">Login</h1>
        <form className="loging-form" onSubmit={handleLogin}>
 
          <InputField label="Username" id="username" onChange={(e) => setUsername(e.target.value)} />
          <InputField label="Password" id="password" type="password" onChange={(e) => setPassword(e.target.value)} />
          <button  className="submit-button" type="submit" >
            Login
          </button>
          {message && <p>{message}</p>}
        </form>
        <a href="#" className="register-link" onClick={() => navigate('/register')}>
          Don't have an account? Register
        </a>
        </section>
        <style jsx>{`
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

        .loging-page {
          display: flex;
          justify-content: center;
          align-items: center;
          background-color: #f3f2ee;
          padding: 80px 20px;
        }

        .loging-container {
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

   

        .loging-title {
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
          .loging-container {
            padding: 30px 20px;
          }

          .loging-title {
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

      </main>
    </>
  );
}

export default LoginForm;
