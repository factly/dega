import React from 'react';

const EmailStep = ({ email, setEmail, handleEmailSubmit, handleGoogleSignIn }) => {
  return (
    <>
      <form onSubmit={handleEmailSubmit} style={{ marginBottom: '16px' }}>
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              color: '#333',
              fontSize: '14px',
              fontWeight: 'bold',
              marginBottom: '8px',
            }}
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            Next
          </button>
        </div>
      </form>
      <div style={{ marginBottom: '16px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '16px 0',
          }}
        >
          <div style={{ flex: 1, height: '1px', backgroundColor: '#ccc' }} />
          <span style={{ margin: '0 10px', color: '#666', fontSize: '14px' }}>or</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: '#ccc' }} />
        </div>
        <button
          onClick={handleGoogleSignIn}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: '#4285F4',
            color: 'white',
            fontWeight: 'bold',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src="https://developers.google.com/identity/images/g-logo.png"
            alt="Google logo"
            style={{ width: '18px', height: '18px', marginRight: '10px' }}
          />
          Sign in with Google
        </button>
      </div>
    </>
  );
};

export default EmailStep;
