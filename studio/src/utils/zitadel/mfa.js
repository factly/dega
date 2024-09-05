import React, { useState } from 'react';  
import QRCode from 'qrcode.react';

// Registration functions
export const startTOTPRegistration = async (userId, token, data = {}) => {
  try {
    const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/${userId}/totp`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to start TOTP registration');
    }
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.error('Error starting TOTP registration:', error);
    throw error;
  }
};

export const verifyTOTPRegistration = async (userId, token, code) => {
  try {
    const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/${userId}/totp/verify`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      throw new Error('Failed to verify TOTP registration');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying TOTP registration:', error);
    throw error;
  }
};

// Login function
export const checkTOTP = async (sessionId, sessionToken, code) => {
  try {
    const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
      },
      body: JSON.stringify({
        sessionToken,
        checks: {
          totp: {
            code,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to check TOTP');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error checking TOTP:', error);
    throw error;
  }
};

export const TOTPSetupComponent = ({ uri, secret, onVerify }) => {
  const [verificationCode, setVerificationCode] = useState('');

  const handleVerify = () => {
    onVerify(verificationCode);
  };

  return (
    <div>
      <h3 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '24px',
        textAlign: 'center',
        color: '#333',
      }}>
        Set up Two-Factor Authentication
      </h3>
      <p style={{ marginBottom: '16px', textAlign: 'center' }}>Scan this QR code with your authenticator app:</p>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <QRCode value={uri} />
      </div>
      <p style={{ marginBottom: '16px', textAlign: 'center' }}>Or enter this secret manually: <strong>{secret}</strong></p>
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
          Enter Verification Code
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
      <div>
        <button
          onClick={handleVerify}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#D53F8C',
            color: 'white',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '16px',
          }}
        >
          Verify
        </button>
      </div>
    </div>
  );
};