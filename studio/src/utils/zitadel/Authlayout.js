import React from 'react';
import { ArrowLeftOutlined } from '@ant-design/icons';

const AuthLayout = ({ children, title, error, showBackButton = false, onBackClick, logoSrc }) => {
  return (
    <div className="auth-container">
      {/* Left side with logo */}
      <div className="auth-logo-section">
        <img src={logoSrc} alt="Logo" className="auth-logo" />
        <div className="auth-brand">
          <h1>DEGA</h1>
        </div>
      </div>

      {/* Right side with form */}
      <div className="auth-form-section">
        <div className="auth-form-container">
          {showBackButton && (
            <button onClick={onBackClick} className="back-button">
              <ArrowLeftOutlined />
            </button>
          )}

          <h2 className="auth-title">{title}</h2>

          {error && <p className="auth-error">{error}</p>}

          {children}
        </div>
      </div>

      {/* Styles */}
      <style jsx>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .auth-container {
          display: flex;
          width: 100vw;
          height: 100vh;
          overflow: hidden;
          position: fixed;
          top: 0;
          left: 0;
        }

        .auth-logo-section {
          width: 50%;
          height: 100%;
          background-color: #f0f0f0;
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .auth-logo {
          width: 40%;
          position: absolute;
          top: 35%;
          left: 50%;
          transform: translate(-50%, -50%);
          object-fit: contain;
        }

        .auth-brand {
          position: absolute;
          bottom: 5%;
          left: 50%;
          transform: translateX(-50%);
          width: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .auth-brand h1 {
          font-size: 48px;
          font-weight: bold;
          color: #333;
          margin: 0;
          transform: translateX(-40px);
        }

        .auth-form-section {
          width: 50%;
          height: 100%;
          background-color: white;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .auth-form-container {
          width: 100%;
          max-width: 400px;
          padding: 0 40px;
        }

        .auth-title {
          font-size: 24px;
          font-weight: bold;
          margin-bottom: 24px;
          text-align: center;
          color: #333;
        }

        .auth-error {
          color: red;
          text-align: center;
          margin-bottom: 16px;
        }

        .back-button {
          background: none;
          border: none;
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: background-color 0.3s ease;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
        }

        .back-button:hover {
          background-color: #f0f0f0;
        }

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .auth-container {
            flex-direction: column;
            position: relative;
          }

          .auth-logo-section {
            display: none;
          }

          .auth-form-section {
            width: 100%;
          }

          .auth-form-container {
            padding: 20px;
          }
        }

        /* Tablet/Medium Screen Styles */
        @media (min-width: 769px) and (max-width: 1024px) {
          .auth-logo {
            width: 50%;
          }
        }

        /* Large Screen Styles */
        @media (min-width: 1025px) {
          .auth-form-container {
            max-width: 450px;
          }
        }
      `}</style>
    </div>
  );
};

export default AuthLayout;
