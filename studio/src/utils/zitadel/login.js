import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoginEmail = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('https://develop-xtjn2g.zitadel.cloud/v2/sessions', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization:
            'Bearer 7XWp1rpWcgZkgJJdo_km9cbzMVdkIAfNfEGrjjZTZAy0Ehf9ShS3gt1cKBLvLW3akUNw5JI',
        },
        body: JSON.stringify({
          checks: {
            user: {
              loginName: 'minnie-mouse@fabi.zitadel.app',
            },
          },
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem(
          'session',
          JSON.stringify({
            id: '218480890961985793',
            creationDate: '2023-06-14T05:32:38.977954Z',
            changeDate: '2023-06-14T05:32:39.007096Z',
            sequence: '580',
            factors: {
              user: {
                verifiedAt: '2023-06-14T05:32:38.972712Z',
                id: 'd654e6ba-70a3-48ef-a95d-37c8d8a7901a',
                loginName: 'minnie-mouse@fabi.zitadel.app',
              },
            },
          }),
        );
        navigate('/login/password');
      } else {
        console.error('Failed to create session');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Login</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md">
          Next
        </button>
      </form>
    </div>
  );
};

export default LoginEmail;
