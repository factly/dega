import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import degaImage from './dega.png';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const registrationData = {
      profile: {
        givenName: formData.firstName,
        familyName: formData.lastName,
      },
      email: {
        email: formData.email,
        isVerified: true,
      },
      password: {
        password: formData.password,
        changeRequired: false,
      },
    };

    try {
      // First, attempt to register the user
      const registerResponse = await fetch('https://develop-xtjn2g.zitadel.cloud/v2/users/human', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization:
            'Bearer 7XWp1rpWcgZkgJJdo_km9cbzMVdkIAfNfEGrjjZTZAy0Ehf9ShS3gt1cKBLvLW3akUNw5JI',
        },
        body: JSON.stringify(registrationData),
      });

      if (registerResponse.ok) {
        const registerData = await registerResponse.json();
        localStorage.setItem('userId', registerData.userId);

        // Now, create a session and verify the password
        const sessionResponse = await fetch('https://develop-xtjn2g.zitadel.cloud/v2/sessions', {
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
                loginName: formData.email,
              },
            },
          }),
        });

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();

          // Verify the password
          const passwordVerificationResponse = await fetch(
            `https://develop-xtjn2g.zitadel.cloud/v2/sessions/${sessionData.sessionId}`,
            {
              method: 'PATCH',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
                Authorization:
                  'Bearer 7XWp1rpWcgZkgJJdo_km9cbzMVdkIAfNfEGrjjZTZAy0Ehf9ShS3gt1cKBLvLW3akUNw5JI',
              },
              body: JSON.stringify({
                sessionToken: sessionData.sessionToken,
                checks: {
                  password: {
                    password: formData.password,
                  },
                },
              }),
            },
          );

          if (passwordVerificationResponse.ok) {
            const verificationData = await passwordVerificationResponse.json();
            localStorage.setItem(
              'sessionData',
              JSON.stringify({
                id: sessionData.sessionId,
                token: verificationData.sessionToken,
                creationDate: sessionData.creationDate,
                changeDate: sessionData.changeDate,
                sequence: sessionData.sequence,
                factors: {
                  user: {
                    verifiedAt: sessionData.factors?.user.verifiedAt,
                    id: sessionData.factors?.user.id,
                    loginName: sessionData.factors?.user.loginName,
                  },
                  password: {
                    verifiedAt: new Date().toISOString(),
                  },
                },
              }),
            );
            localStorage.setItem('sessionId', sessionData.sessionId);
            localStorage.setItem('sessionToken', verificationData.sessionToken);
            navigate('/');
          } else {
            const errorData = await passwordVerificationResponse.json();
            setError(errorData.message || 'Failed to verify password');
          }
        } else {
          setError('Failed to create session');
        }
      } else {
        const errorData = await registerResponse.json();
        const errorMessage = errorData.message.split('(')[0].trim();
        setError(errorMessage || 'Failed to register user');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred');
    }
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
        display: 'flex',
      }}
    >
      <div
        style={{
          width: '50%',
          height: '100%',
          backgroundColor: '#f0f0f0',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <img
          src={degaImage}
          alt="DEGA"
          style={{
            width: '40%',
            height: '40%',
            objectFit: 'contain',
            position: 'absolute',
            top: '35%',
            transform: 'translateY(-50%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '5%',
            left: '45%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <h1
            style={{
              fontSize: '38px',
              fontWeight: 'bold',
              color: '#333',
            }}
          >
            DEGA
          </h1>
        </div>
      </div>
      <div
        style={{
          width: '50%',
          height: '100%',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {' '}
        <div
          style={{
            width: '100%',
            maxWidth: '400px',
            padding: '0 32px',
          }}
        >
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '24px',
              textAlign: 'center',
              color: '#333',
            }}
          >
            Registration
          </h2>
          {error && (
            <p style={{ color: 'red', textAlign: 'center', marginBottom: '16px' }}>{error}</p>
          )}
          <form onSubmit={handleSubmit} style={{ marginBottom: '16px' }}>
            {['firstName', 'lastName', 'email', 'password'].map((field) => (
              <div key={field} style={{ marginBottom: '16px' }}>
                <label
                  htmlFor={field}
                  style={{
                    display: 'block',
                    color: '#333',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                  }}
                >
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field === 'password' ? 'password' : 'text'}
                  id={field}
                  name={field}
                  value={formData[field]}
                  onChange={handleChange}
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
            ))}
            <div>
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: '#D53F8C',
                  color: 'white',
                  fontWeight: 'bold',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '16px',
                  cursor: 'pointer',
                  marginBottom: '16px',
                }}
              >
                Sign Up
              </button>
            </div>
          </form>
          <div style={{ textAlign: 'center' }}>
            <Link to="/login/forgotpassword" style={{ color: '#D53F8C', textDecoration: 'none' }}>
              Forgot Password?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
