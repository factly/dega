import React, { useState, useEffect } from 'react';

const LoginPassword = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [sessionInfo, setSessionInfo] = useState({ id: '', token: '' });

  useEffect(() => {
    const storedSessionId = localStorage.getItem('sessionId');
    const storedSessionToken = localStorage.getItem('sessionToken');
    setSessionInfo({ id: storedSessionId, token: storedSessionToken });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (!sessionInfo.id || !sessionInfo.token) {
        throw new Error('Session ID or token is missing');
      }

      const response = await fetch(
        `https://develop-xtjn2g.zitadel.cloud/v2/sessions/${sessionInfo.id}`,
        {
          method: 'PATCH',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 7XWp1rpWcgZkgJJdo_km9cbzMVdkIAfNfEGrjjZTZAy0Ehf9ShS3gt1cKBLvLW3akUNw5JI',
          },
          body: JSON.stringify({
            sessionToken: sessionInfo.token,
            checks: {
              password: {
                password: "Secr3tP4ssw0rd!",
              },
            },
          }),
        }
      );

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (response.ok) {
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (error) {
          console.error('Failed to parse response as JSON:', error);
          setError('Unexpected response format from server');
          return;
        }

        console.log('Parsed response data:', data);

        localStorage.setItem(
          'session',
          JSON.stringify({
            password: {
              verifiedAt: "2023-06-14T05:32:38.972712Z",
            },
          })
        );

        if (data.sessionToken) {
          localStorage.setItem('sessionToken', data.sessionToken);
        }

        window.location.href = 'http://www.exakdfjenfmple.com';
      } else {
        console.error('Failed to validate password:', response.status, responseText);
        setError(`Server error: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(`An error occurred: ${error.message}`);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Enter Password</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        {error && <p className="text-red-500">{error}</p>}
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md">
          Next
        </button>
      </form>
    </div>
  );
};

export default LoginPassword;