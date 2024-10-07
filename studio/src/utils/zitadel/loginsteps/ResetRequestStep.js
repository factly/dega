import React from 'react';

const ResetRequestStep = ({ email, handleRequestReset }) => {
  return (
    <form onSubmit={handleRequestReset} style={{ marginBottom: '16px' }}>
      <div style={{ marginBottom: '16px' }}>
        <p style={{ color: '#333', fontSize: '14px', marginBottom: '8px' }}>
          A verification code will be sent to: <strong>{email}</strong>
        </p>
      </div>
      <div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#1E1E1E', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}>
          Send Verification Code
        </button>
      </div>
    </form>
  );
};

export default ResetRequestStep;