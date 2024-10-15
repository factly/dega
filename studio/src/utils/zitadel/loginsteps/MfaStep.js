import React from 'react';

const MfaStep = ({ totpCode, setTotpCode, handleMfaSubmit }) => {
  return (
    <form onSubmit={handleMfaSubmit} style={{ marginBottom: '16px' }}>
      <div style={{ marginBottom: '16px' }}>
        <label
          htmlFor="totpCode"
          style={{
            display: 'block',
            color: '#333',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '8px',
          }}
        >
          Enter MFA Code
        </label>
        <input
          type="text"
          id="totpCode"
          value={totpCode}
          onChange={(e) => setTotpCode(e.target.value)}
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
          Verify MFA
        </button>
      </div>
    </form>
  );
};

export default MfaStep;
