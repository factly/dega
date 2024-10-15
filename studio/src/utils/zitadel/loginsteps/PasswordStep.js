import React from 'react';

const PasswordStep = ({ password, setPassword, handlePasswordSubmit }) => {
  return (
    <form onSubmit={handlePasswordSubmit} style={{ marginBottom: '16px' }}>
      <div style={{ marginBottom: '16px' }}>
        <label
          htmlFor="password"
          style={{
            display: 'block',
            color: '#333',
            fontSize: '14px',
            fontWeight: 'bold',
            marginBottom: '8px',
          }}
        >
          Password
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          Log In
        </button>
      </div>
    </form>
  );
};

export default PasswordStep;
