import React from 'react';

const ResetVerifyStep = ({ verificationCode, setVerificationCode, newPassword, setNewPassword, handleResetPassword }) => {
  return (
    <form onSubmit={handleResetPassword} style={{ marginBottom: '16px' }}>
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="verificationCode" style={{ display: 'block', color: '#333', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
          Verification Code
        </label>
        <input
          type="text"
          id="verificationCode"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px' }}
          required
        />
      </div>
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="newPassword" style={{ display: 'block', color: '#333', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
          New Password
        </label>
        <input
          type="password"
          id="newPassword"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px' }}
          required
        />
      </div>
      <div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#1E1E1E', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}>
          Reset Password
        </button>
      </div>
    </form>
  );
};

export default ResetVerifyStep;