import React, { useState, useEffect } from 'react';
import { TOTPSetupComponent } from '../../utils/zitadel/mfa';
import { startTOTPRegistration, verifyTOTPRegistration } from '../../actions/mfa';

const TwoFactorAuthManagement = ({ userId, token }) => {
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [totpUri, setTotpUri] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [code, setCode] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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
      alert('Failed to verify 2FA. Please try again.');
    }
  };

  const handleDisable2FA = async () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('sessionToken');
    try {
      const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/${userId}/totp`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        setIsSettingUp2FA(false);
        setSuccessMessage('Two-factor authentication has been disabled.');
      } else {
        console.error('Error disabling 2FA:', response.statusText);
        alert('Failed to disable 2FA. Please try again.');
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      alert('Failed to disable 2FA. Please try again.');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      fontWeight: 'bold',
      gap: '20px'
    }}>
      <h2>Two-Factor Authentication Settings</h2>
      {successMessage && (
        <p style={{ color: 'green' }}>{successMessage}</p>
      )}
      {isSettingUp2FA ? (
        <>
          <TOTPSetupComponent uri={totpUri} secret={totpSecret} onVerify={handleVerify2FA} />
        </>
      ) : (
        <div>
          <button
            onClick={handleEnable2FA}
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
              marginTop: '16px',
            }}
          >
            Enable Two-Factor Authentication
          </button>
        </div>
      )}
      <div>
        <button
          onClick={handleDisable2FA}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#FF0000',
            color: 'white',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '16px',
          }}
        >
          Disable Two-Factor Authentication
        </button>
      </div>
    </div>
  );
};

export default TwoFactorAuthManagement;