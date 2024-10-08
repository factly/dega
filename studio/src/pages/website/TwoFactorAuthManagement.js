import React, { useState, useEffect } from 'react';
import { TOTPSetupComponent } from '../../utils/zitadel/mfa';
import { startTOTPRegistration, verifyTOTPRegistration } from '../../actions/mfa';

const SecuritySettings = () => {
  // Two-Factor Authentication states
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [totpUri, setTotpUri] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Forgot Password states
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleEnable2FA = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('sessionToken');
    try {
      const result = await startTOTPRegistration(userId, token);
      setTotpUri(result.uri);
      setTotpSecret(result.secret);
      setIsSettingUp2FA(true);
    } catch (error) {
      console.error('Error starting 2FA setup:', error);
      setErrorMessage('Failed to start 2FA setup. Please try again.');
    }
  };

  const handleVerify2FA = async (code) => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('sessionToken');
    try {
      await verifyTOTPRegistration(userId, token, code);
      setIsSettingUp2FA(true);
      setSuccessMessage('Two-factor authentication is successfully enabled.');
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      setErrorMessage('Failed to verify 2FA. Please try again.');
    }
  };

  const handleDisable2FA = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('sessionToken');
    try {
      const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/${userId}/totp`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        setIsSettingUp2FA(false);
        setSuccessMessage('Two-factor authentication has been disabled.');
      } else {
        throw new Error('Failed to disable 2FA.');
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      setErrorMessage('Failed to disable 2FA. Please try again.');
    }
  };

  const handlePasswordResetRequest = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('sessionToken');
    
    try {
      const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/${userId}/password_reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sendLink: {
            notificationType: 'NOTIFICATION_TYPE_Email',
          }
        })
      });

      if (response.ok) {
        setEmailSent(true);
        setSuccessMessage('Password reset link sent to your email.');
      } else {
        throw new Error('Failed to request password reset.');
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const handlePasswordChange = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('sessionToken');
    
    try {
      const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/${userId}/password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          newPassword: {
            password: newPassword,
            changeRequired: false
          },
          verificationCode: verificationCode
        })
      });

      if (response.ok) {
        setSuccessMessage('Password changed successfully.');
        setEmailSent(false);
        setVerificationCode('');
        setNewPassword('');
      } else {
        throw new Error('Failed to change password.');
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const buttonStyle = {
    width: '100%',
    padding: '10px',
    backgroundColor: '#1E1E1E',
    color: 'white',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer',
    marginTop: '16px',
  };

  const inputStyle = {
    margin: '10px',
    padding: '8px',
    fontSize: '16px',
    width: 'calc(100% - 20px)',
  };

  const boxStyle = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '20px',
    width: '100%',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      fontWeight: 'bold',
      gap: '20px',
      maxWidth: '400px',
      margin: '0 auto',
    }}>
      
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
  
      <div style={boxStyle}>
        <h3>Two-Factor Authentication</h3>
        {isSettingUp2FA ? (
          <TOTPSetupComponent uri={totpUri} secret={totpSecret} onVerify={handleVerify2FA} />
        ) : (
          <button onClick={handleEnable2FA} style={buttonStyle}>
            Enable Two-Factor Authentication
          </button>
        )}
        <button onClick={handleDisable2FA} style={{...buttonStyle, backgroundColor: '#FF0000'}}>
          Disable Two-Factor Authentication
        </button>
      </div>
  
      <div style={boxStyle}>
        <h3>Password Reset</h3>
        {emailSent ? (
          <>
            <input
              type="text"
              placeholder="Verification Code"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              style={inputStyle}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={inputStyle}
            />
            <button onClick={handlePasswordChange} style={buttonStyle}>
              Change Password
            </button>
          </>
        ) : (
          <button onClick={handlePasswordResetRequest} style={buttonStyle}>
            Reset Password
          </button>
        )}
      </div>
    </div>
  );
};

export default SecuritySettings;