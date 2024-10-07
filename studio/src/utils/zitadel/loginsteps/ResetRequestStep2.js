import React from 'react';

const ResetRequest2Step = ({ email, setEmail, handleRequestResetEmail, isSubmitting }) => {
  return (
    <form onSubmit={handleRequestResetEmail} style={{ marginBottom: '16px' }}>
      <div style={{ marginBottom: '16px' }}>
        <p style={{ color: '#333', fontSize: '14px', marginBottom: '8px' }}>
          A verification code will be sent to:
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          style={{ width: '100%', padding: '10px', fontSize: '16px', borderRadius: '4px', border: '1px solid #ccc' }}
        />
      </div>
      <div>
        <button type="submit" disabled={isSubmitting} style={{ width: '100%', padding: '10px', backgroundColor: '#1E1E1E', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}>
          {isSubmitting ? 'Sending...' : 'Send Verification Code'}
        </button>
      </div>
    </form>
  );
};

export default ResetRequest2Step;