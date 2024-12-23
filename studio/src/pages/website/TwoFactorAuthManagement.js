import React, { useState, useEffect } from 'react';
import { TOTPSetupComponent } from '../../utils/zitadel/mfa';
import { startTOTPRegistration, verifyTOTPRegistration } from '../../actions/mfa';
import './TwoFactorAuthManagement.css';

const TwoFactorAuthManagement = () => {
  const [isSettingUp2FA, setIsSettingUp2FA] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [totpUri, setTotpUri] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordHidden, setIsPasswordHidden] = useState(false);

  useEffect(() => {
    const check2FAStatus = async () => {
      const userId = localStorage.getItem('userId');
      try {
        const authMethods = await getAuthMethods(userId);
        if (
          authMethods.authMethodTypes &&
          authMethods.authMethodTypes.includes('AUTHENTICATION_METHOD_TYPE_TOTP')
        ) {
          setIs2FAEnabled(true);
        } else {
          setIs2FAEnabled(false);
        }
      } catch (error) {
        console.error('Error checking 2FA status:', error);
      }
    };

    check2FAStatus();
  }, []);

  const getAuthMethods = async (userId) => {
    const response = await fetch(
      `${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/${userId}/authentication_methods`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('sessionToken')}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error('Failed to fetch authentication methods');
    }
    const data = await response.json();
    console.log('Auth methods response:', data);
    return data;
  };

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
      setIsSettingUp2FA(false);
      setIs2FAEnabled(true);
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
      const response = await fetch(
        `${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/${userId}/totp`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );
      if (response.ok) {
        setIsSettingUp2FA(false);
        setIs2FAEnabled(false);
        setSuccessMessage('Two-factor authentication has been disabled.');
      } else {
        throw new Error('Failed to disable 2FA.');
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      setErrorMessage('Failed to disable 2FA. Please try again.');
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const token = localStorage.getItem('sessionToken');

    try {
      const response = await fetch(
        `${window.REACT_APP_ZITADEL_AUTHORITY}/auth/v1/users/me/password`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            oldPassword: oldPassword,
            newPassword: newPassword,
          }),
        },
      );

      if (response.ok) {
        setSuccessMessage('Password changed successfully.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message.split('(')[0].trim();
        throw new Error(errorMessage || 'Failed to change password');
      }
    } catch (error) {
      setErrorMessage(error.message);
    }
  };

  const togglePasswordVisibility = () => {
    setIsPasswordHidden(!isPasswordHidden);
  };

  return (
    <div className="security-container">
      <h1 className="security-title">Security</h1>
      {successMessage && <span className="success-message">{successMessage}</span>}
      {errorMessage && <span className="error-message">{errorMessage}</span>}
      <div className="security-sections">
        <div className="security-section">
          <div className="section-header">
            <h2 className="section-title">Change Password</h2>
            <button onClick={togglePasswordVisibility} className="toggle-password-btn">
              {isPasswordHidden ? 'Change password' : 'Hide'}
            </button>
          </div>
          <hr className="section-divider" />
          <div className="password-change-form">
            {!isPasswordHidden && (
              <>
                <input
                  type="password"
                  placeholder="Enter old password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="password-input"
                />
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="password-input"
                />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="password-input"
                />
                <button className="change-password-btn" onClick={handlePasswordChange}>
                  Change Password
                </button>
              </>
            )}
          </div>
        </div>
        <div className="security-section">
          <div className="section-header">
            <h2 className="section-title">Manage Two Factor Authentication</h2>
            {is2FAEnabled && <span className="status-enabled">Enabled</span>}
          </div>
          <hr className="section-divider" />
          {is2FAEnabled ? (
            <button className="disable-2fa-btn" onClick={handleDisable2FA}>
              Disable 2FA
            </button>
          ) : (
            <>
              {isSettingUp2FA ? (
                <TOTPSetupComponent uri={totpUri} secret={totpSecret} onVerify={handleVerify2FA} />
              ) : (
                <button className="enable-2fa-btn" onClick={handleEnable2FA}>
                  Enable 2FA
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuthManagement;
