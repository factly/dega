import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import degaImage from './dega.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('email');
  const [sessionId, setSessionId] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if we're on the success route and have an intent ID and token
    if (location.pathname === '/auth/login' && location.search.includes('intent_id')) {
      const params = new URLSearchParams(location.search);
      const intentId = params.get('intent_id');
      const token = params.get('token');
      if (intentId && token) {
        getProviderInformation(intentId, token);
      }
    }
  }, [location]);

  const getProviderInformation = async (intentId, token) => {
    try {
      const response = await fetch(`https://develop-xtjn2g.zitadel.cloud/v2/idp_intents/${intentId}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': 'Bearer 7XWp1rpWcgZkgJJdo_km9cbzMVdkIAfNfEGrjjZTZAy0Ehf9ShS3gt1cKBLvLW3akUNw5JI',
        },
        body: JSON.stringify({
          idpIntentToken: token
        }),
      });

      if (response.ok) {
        const data = await response.json();
        handleSuccessfulLogin(data);
      } else {
        console.error('Failed to get provider information');
        setError('Failed to complete login. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again later.');
    }
  };

  const handleSuccessfulLogin = (providerData) => {
    const userInfo = providerData.idpInformation.rawInformation.User;
    localStorage.setItem('userInfo', JSON.stringify(userInfo));
    navigate('/dashboard');
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const createSessionResponse = await fetch('https://develop-xtjn2g.zitadel.cloud/v2/sessions', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer 7XWp1rpWcgZkgJJdo_km9cbzMVdkIAfNfEGrjjZTZAy0Ehf9ShS3gt1cKBLvLW3akUNw5JI',
        },
        body: JSON.stringify({
          checks: {
            user: {
              loginName: email,
            },
          },
        }),
      });

      if (createSessionResponse.ok) {
        const sessionData = await createSessionResponse.json();
        localStorage.setItem('sessionData', JSON.stringify(sessionData));
        setSessionId(sessionData.sessionId);
        localStorage.setItem('sessionToken', sessionData.sessionToken);
        setStep('password');
        // Update URL without navigating
        window.history.pushState({}, '', `/auth/login?session=${sessionData.sessionId}`);
      } else {
        const errorData = await createSessionResponse.json();
        const errorMessage = errorData.message ? errorData.message.split('(')[0].trim() : 'Failed to create session';
        console.error('Failed to create session:', errorMessage);
        setError(errorMessage || 'Failed to create session. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred. Please try again later.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const sessionData = JSON.parse(localStorage.getItem('sessionData'));

      const response = await fetch(
        `https://develop-xtjn2g.zitadel.cloud/v2/sessions/${sessionId}`,
        {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: 'Bearer 7XWp1rpWcgZkgJJdo_km9cbzMVdkIAfNfEGrjjZTZAy0Ehf9ShS3gt1cKBLvLW3akUNw5JI',
          },
          body: JSON.stringify({
            sessionToken: sessionData.token,
            checks: {
              password: {
                password: password,
              },
            },
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('sessionToken', data.sessionToken);
        
        const sessionResponse = await fetch(`https://develop-xtjn2g.zitadel.cloud/v2/sessions/${sessionId}`, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            Authorization: 'Bearer 7XWp1rpWcgZkgJJdo_km9cbzMVdkIAfNfEGrjjZTZAy0Ehf9ShS3gt1cKBLvLW3akUNw5JI',
          },
        });

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          localStorage.setItem('currentSessionData', JSON.stringify(sessionData));
          
          const userVerified = sessionData.session.factors.user.verifiedAt;
          const passwordVerified = sessionData.session.factors.password.verifiedAt;
          if (userVerified && passwordVerified) {
            navigate('/dashboard');
          } else {
            setError('User or password verification failed.');
          }
        } else {
          setError('Failed to fetch current session state');
        }
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.message.split('(')[0].trim();
        setError(errorMessage || 'Invalid password');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const response = await fetch('https://develop-xtjn2g.zitadel.cloud/v2/idp_intents', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: 'Bearer 7XWp1rpWcgZkgJJdo_km9cbzMVdkIAfNfEGrjjZTZAy0Ehf9ShS3gt1cKBLvLW3akUNw5JI',
        },
        body: JSON.stringify({
          idpId: '32716844543-jc9oc9g7s83o7n47npu8q99aoge5jn0a.apps.googleusercontent.com', 
          urls: {
            successUrl: 'http://localhost:3000/auth/login',
            failureUrl: 'http://localhost:3000/auth/login'
          }
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.authUrl;
      } else {
        console.error('Failed to initiate Google Sign-In');
        setError('Failed to initiate Google Sign-In. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again later.');
    }
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '100vh',
      overflow: 'hidden',
      display: 'flex'
    }}>
      <div style={{
        width: '50%',
        height: '100%',
        backgroundColor: '#f0f0f0',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <img 
          src={degaImage}
          alt="Dega logo" 
          style={{
            width: '40%',
            height: '40%',
            objectFit: 'contain',
            position: 'absolute',
            top: '35%', 
            transform: 'translateY(-50%)'
          }}
        />
      </div>

      <div style={{
        width: '50%',
        height: '100%',
        backgroundColor: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '400px',
          padding: '0 32px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '24px',
            textAlign: 'center',
            color: '#333'
          }}>Login</h2>
          {error && <p style={{color: 'red', textAlign: 'center', marginBottom: '16px'}}>{error}</p>}
          {step === 'email' ? (
            <form onSubmit={handleEmailSubmit} style={{marginBottom: '16px'}}>
              <div style={{marginBottom: '16px'}}>
                <label htmlFor="email" style={{
                  display: 'block',
                  color: '#333',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '8px'
                }}>
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
                    fontSize: '16px'
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
                    backgroundColor: '#D53F8C',
                    color: 'white',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    cursor: 'pointer',
                    marginBottom: '16px'
                  }}
                >
                  Next
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} style={{marginBottom: '16px'}}>
              <div style={{marginBottom: '16px'}}>
                <label htmlFor="password" style={{
                  display: 'block',
                  color: '#333',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  marginBottom: '8px'
                }}>
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
                    fontSize: '16px'
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
                    backgroundColor: '#D53F8C',
                    color: 'white',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    cursor: 'pointer'
                  }}
                >
                  Log In
                </button>
              </div>
            </form>
          )}
          {step === 'email' && (
            <div style={{marginBottom: '16px'}}>
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
                  justifyContent: 'center'
                }}
              >
                <img 
                  src="https://developers.google.com/identity/images/g-logo.png" 
                  alt="Google logo" 
                  style={{width: '18px', height: '18px', marginRight: '10px'}}
                />
                Sign in with Google
              </button>
            </div>
          )}
          <div style={{textAlign: 'center'}}>
            {step === 'email' ? (
              <Link to="/auth/login/registration" style={{color: '#D53F8C', textDecoration: 'none'}}>
                Don't have an account? Sign up
              </Link>
            ) : (
              <Link to="/login/forgotpassword" style={{color: '#D53F8C', textDecoration: 'none'}}>
                Forgot Password?
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;