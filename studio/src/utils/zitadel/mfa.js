import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

export { startTOTPRegistration, verifyTOTPRegistration } from '../../actions/mfa';
export { checkTOTP } from '../../actions/mfa';

export const TOTPSetupComponent = ({ uri, secret, onVerify }) => {
  const [verificationCode, setVerificationCode] = useState('');

  const handleVerify = () => {
    onVerify(verificationCode);
  };

  return (
    <div>
      <h3
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '24px',
          textAlign: 'center',
          color: '#333',
        }}
      >
        Set up Two-Factor Authentication
      </h3>
      <p style={{ marginBottom: '16px', textAlign: 'center' }}>
        Scan this QR code with your authenticator app:
      </p>
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
        <QRCodeCanvas value={uri} />
      </div>
      <p style={{ marginBottom: '16px', textAlign: 'center' }}>
        Or enter this secret manually: <strong>{secret}</strong>
      </p>
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
          Verify
        </button>
      </div>
    </div>
  );
};
