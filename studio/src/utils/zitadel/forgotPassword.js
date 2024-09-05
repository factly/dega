import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import degaImage from '../../assets/dega.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState('request');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(
        `${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/${userId}/password_reset`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization:
              `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
          },
          body: JSON.stringify({
            sendLink: {
              notificationType: 'NOTIFICATION_TYPE_Email',
              urlTemplate:
                'https://example.com/password/change?userID={{.UserID}}&code={{.Code}}&orgID={{.OrgID}}',
            },
          }),
        },
      );

      if (response.ok) {
        setStep('verify');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } catch (error) {
      setError(`An error occurred: ${error.message}`);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(
        `${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/${userId}/password`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization:
              `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
          },
          body: JSON.stringify({
            newPassword: {
              password: newPassword,
              changeRequired: false,
            },
            verificationCode: verificationCode,
          }),
        },
      );

      if (response.ok) {
        navigate('/login/email');
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } catch (error) {
      setError(`An error occurred: ${error.message}`);
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
      }}
    >
      <div
        style={{
          width: '50%',
          height: '100%',
          backgroundColor: '#f0f0f0',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={degaImage}
          alt="DEGA"
          style={{
            width: '40%',
            height: '40%',
            objectFit: 'contain',
            position: 'absolute',
            top: '35%',
            transform: 'translateY(-50%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '5%',
            left: '45%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '38px',
              fontWeight: 'bold',
              color: '#333',
            }}
          >
            DEGA
          </h1>
        </div>
      </div>
      <div
        style={{
          width: '50%',
          height: '100%',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '0 32px',
          }}
        >
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '24px',
              textAlign: 'center',
              color: '#333',
            }}
          >
            {step === 'request' ? 'Forgot Password' : 'Reset Password'}
          </h2>
          {error && (
            <p style={{ color: 'red', textAlign: 'center', marginBottom: '16px' }}>{error}</p>
          )}
          {step === 'request' ? (
            <form onSubmit={handleRequestReset} style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="email"
                  style={{
                    display: 'block',
                    color: '#333',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '16px',
                  }}
                  required
                />
              </div>
              <div>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#1E1E1E',
                    color: 'white',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    cursor: 'pointer',
                  }}
                >
                  Request Password Reset
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="verificationCode"
                  style={{
                    display: 'block',
                    color: '#333',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                  }}
                >
                  Verification Code
                </label>
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '16px',
                  }}
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="newPassword"
                  style={{
                    display: 'block',
                    color: '#333',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                  }}
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '16px',
                  }}
                  required
                />
              </div>
              <div>
                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#1E1E1E',
                    color: 'white',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    cursor: 'pointer',
                  }}
                >
                  Reset Password
                </button>
              </div>
            </form>
          )}
          <div style={{ textAlign: 'center' }}>
            <Link to="/auth/login" style={{ color: '#1E1E1E', textDecoration: 'none' }}>
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;