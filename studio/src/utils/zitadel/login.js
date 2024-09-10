import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { checkTOTP } from './mfa';
import { useGoogleSignIn } from './idp';
import degaImage from '../../assets/dega.png';
import { TOTPSetupComponent } from './mfa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('email');
  const [sessionId, setSessionId] = useState('');
  const [userId, setUserId] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [authRequestId, setAuthRequestId] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const { 
    initiateGoogleSignIn, 
    error: googleError, 
    step: googleStep, 
    totpUri, 
    totpSecret, 
    handleMfaSetup, 
    handleMfaVerify 
  } = useGoogleSignIn();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const authRequest = searchParams.get('authRequest');
    console.log('Auth Request ID:', authRequest);  
    if (authRequest) {
      setAuthRequestId(authRequest);
      getAuthRequestDetails(authRequest);
    }
  }, [location]);

  useEffect(() => {
    if (googleError) {
      setError(googleError);
    }
  }, [googleError]);

  useEffect(() => {
    if (googleStep === 'mfa-setup' || googleStep === 'mfa-verify') {
      setStep(googleStep);
    }
  }, [googleStep]);

  const getAuthRequestDetails = async (authRequestId) => {
    try {
      const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/oidc/auth_requests/${authRequestId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
      } else {
        console.error('Failed to get auth request details');
      }
    } catch (error) {
      console.error('Error getting auth request details:', error);
    }
  };

  const finalizeAuthRequest = async (sessionId, sessionToken) => {
    console.log('Finalizing auth request.....................');
    try {
      const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/oidc/auth_requests/${authRequestId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session: {
            sessionId: sessionId,
            sessionToken: sessionToken
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.callbackUrl) {
          window.location.href = data.callbackUrl;
        } else {
          console.error('No callback URL in the response');
        }
      } else {
        console.error('Failed to finalize auth request');
      }
    } catch (error) {
      console.error('Error finalizing auth request:', error);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const createSessionResponse = await fetch(
        `${window.REACT_APP_ZITADEL_AUTHORITY}/v2/sessions`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
          },
          body: JSON.stringify({
            checks: {
              user: {
                loginName: email,
              },
            },
          }),
        },
      );

      if (createSessionResponse.ok) {
        const sessionData = await createSessionResponse.json();
        localStorage.setItem('sessionData', JSON.stringify(sessionData));
        setSessionId(sessionData.sessionId);
        localStorage.setItem('sessionToken', sessionData.sessionToken);

        // Fetch user details using the session ID
        const userDetailsResponse = await fetch(
          `${window.REACT_APP_ZITADEL_AUTHORITY}/v2/sessions/${sessionData.sessionId}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
            },
          },
        );

        if (userDetailsResponse.ok) {
          const userDetails = await userDetailsResponse.json();
          setUserId(userDetails.session.factors.user.id);
          localStorage.setItem('userId', userDetails.session.factors.user.id);
        } else {
          console.error('Failed to fetch user details');
        }

        setStep('password');
      } else {
        const errorData = await createSessionResponse.json();
        const errorMessage = errorData.message
          ? errorData.message.split('(')[0].trim()
          : 'Failed to create session';
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
        `${window.REACT_APP_ZITADEL_AUTHORITY}/v2/sessions/${sessionId}`,
        {
          method: 'PATCH',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
          },
          body: JSON.stringify({
            sessionToken: sessionData.token,
            checks: {
              password: {
                password: password,
              },
            },
          }),
        },
      );
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('sessionToken', data.sessionToken);
        setStep('mfa');
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

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const sessionData = JSON.parse(localStorage.getItem('sessionData'));
      const result = await checkTOTP(sessionId, sessionData.token, totpCode);
      console.log('MFA Result:..................', result.sessionToken);
      if (result.sessionToken) {
        localStorage.setItem('sessionToken', result.sessionToken);
        await finalizeAuthRequest(sessionId, result.sessionToken);
        // The redirect will be handled by finalizeAuthRequest
      } else {
        setError('Invalid MFA code. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred during MFA verification');
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await initiateGoogleSignIn();
    if (result && result.error) {
      setError(result.error);
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
            {step === 'email'
              ? 'Login'
              : step === 'password'
              ? 'Enter Password'
              : step === 'mfa'
              ? 'MFA Verification'
              : step === 'mfa-setup'
              ? 'Set up Two-Factor Authentication'
              : 'Verify Two-Factor Authentication'}
          </h2>
          {error && (
            <p style={{ color: 'red', textAlign: 'center', marginBottom: '16px' }}>{error}</p>
          )}
          {step === 'email' && (
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
          )}
          {step === 'password' && (
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
          )}
          {step === 'mfa' && (
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
          )}
          {step === 'mfa-setup' && (
            <TOTPSetupComponent 
              uri={totpUri} 
              secret={totpSecret} 
              onVerify={handleMfaSetup} 
            />
          )}
          {step === 'mfa-verify' && (
            <form onSubmit={(e) => { e.preventDefault(); handleMfaVerify(mfaCode); }} style={{ marginBottom: '16px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label
                  htmlFor="mfaCode"
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
                  id="mfaCode"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
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
          )}
          {step === 'email' && (
            <div style={{ marginBottom: '16px' }}>
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
          )}
          <div style={{ textAlign: 'center' }}>
            {step === 'email' ? (
              <Link to="/auth/registration" style={{ color: '#1E1E1E', textDecoration: 'none' }}>
                Don't have an account? Sign up
              </Link>
            ) : step === 'password' ? (
              <Link to="/login/forgotpassword" style={{ color: '#1E1E1E', textDecoration: 'none' }}>
                Forgot Password?
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;