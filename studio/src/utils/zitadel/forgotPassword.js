import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import degaImage from '../../assets/dega.png';
import { requestPasswordReset, resetPassword } from '../../actions/forgotPassword';
import RequestReset from './login/requestreset';
import ResetPassword from './login/resetpassword';

const ForgotPassword = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState('request');
  const [error, setError] = useState('');
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    const storedUserEmail = localStorage.getItem('userEmail');
    if (storedUserId) {
      setUserId(storedUserId);
    }
    if (storedUserEmail) {
      setUserEmail(storedUserEmail);
    }
  }, []);

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await requestPasswordReset(userId);
      setStep('verify');
    } catch (error) {
      setError(`An error occurred: ${error.message}`);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await resetPassword(userId, newPassword, verificationCode);
      navigate('/auth/login');
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
      {/* Left side with logo */}
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
          <h1 style={{ fontSize: '38px', fontWeight: 'bold', color: '#333' }}>DEGA</h1>
        </div>
      </div>

      {/* Right side with form */}
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
        <div style={{ width: '100%', maxWidth: '400px', padding: '0 32px' }}>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '24px',
              textAlign: 'center',
              color: '#333',
            }}
          >
            {step === 'request' ? 'Reset Password' : 'Enter Verification Code'}
          </h2>

          {error && (
            <p style={{ color: 'red', textAlign: 'center', marginBottom: '16px' }}>{error}</p>
          )}

          {step === 'request' ? (
            <RequestReset userEmail={userEmail} onSubmit={handleRequestReset} />
          ) : (
            <ResetPassword
              verificationCode={verificationCode}
              setVerificationCode={setVerificationCode}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              onSubmit={handleResetPassword}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
