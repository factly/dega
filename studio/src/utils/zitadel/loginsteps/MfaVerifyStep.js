import React from 'react';

const MfaVerifyStep = ({ mfaCode, setMfaCode, handleMfaVerify, handleSkipGoogleMfa }) => {
  return (
    <form onSubmit={(e) => { e.preventDefault(); handleMfaVerify(mfaCode); }} style={{ marginBottom: '16px' }}>
      <div style={{ marginBottom: '16px' }}>
        <label htmlFor="mfaCode" style={{ display: 'block', color: '#333', fontSize: '14px', fontWeight: 'bold', marginBottom: '8px' }}>
          Enter MFA Code
        </label>
        <input
          type="text"
          id="mfaCode"
          value={mfaCode}
          onChange={(e) => setMfaCode(e.target.value)}
          style={{ width: '100%', padding: '8px 12px', border: '1px solid #ccc', borderRadius: '4px', fontSize: '16px' }}
          required
        />
      </div>
      <div>
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#1E1E1E', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}>
          Verify MFA
        </button>
      </div>
      <div>
        <button onClick={handleSkipGoogleMfa} style={{ width: '100%', padding: '10px', backgroundColor: '#6B7280', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer', marginTop: '8px' }}>
          Skip Two-Factor Authentication
        </button>
      </div>
    </form>
  );
};

export default MfaVerifyStep;