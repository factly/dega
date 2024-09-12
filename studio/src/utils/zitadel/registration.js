import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import degaImage from '../../assets/dega.png';
import { TOTPSetupComponent } from './mfa';
import { startTOTPRegistration, verifyTOTPRegistration } from '../../actions/mfa';
import {
  registerUser,
  createSession,
  verifyPassword,
  getAuthRequestDetails,
  finalizeAuthRequest,
} from '../../actions/registration';

const RegistrationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [step, setStep] = useState('registration');
  const [userId, setUserId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [totpUri, setTotpUri] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [authRequestId, setAuthRequestId] = useState('');


  useEffect(() => {
    const storedAuthRequestId = localStorage.getItem('authRequestId');
    if (storedAuthRequestId) {
      setAuthRequestId(storedAuthRequestId);
    }
  }, []);


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
      // Register the user
      const registerData = await registerUser(registrationData);
      setUserId(registerData.userId);
      localStorage.setItem('userId', registerData.userId);

      // Create a session for the new user
      const sessionData = await createSession(formData.email);
      setSessionId(sessionData.sessionId);
      setSessionToken(sessionData.sessionToken);

      // Verify the password
      const verificationData = await verifyPassword(
        sessionData.sessionId,
        sessionData.sessionToken,
        formData.password,
      );
      setSessionToken(verificationData.sessionToken);

      // Store user ID, session ID, and session token in local storage
      localStorage.setItem('userId', registerData.userId);
      localStorage.setItem('sessionId', sessionData.sessionId);
      localStorage.setItem('sessionToken', verificationData.sessionToken);

      // Start TOTP registration
      const totpData = await startTOTPRegistration(
        registerData.userId,
        verificationData.sessionToken,
      );
      setTotpUri(totpData.uri);
      setTotpSecret(totpData.secret);
      setStep('mfa-setup');
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An unexpected error occurred');
    }
  };

  const handleSkipMfa = () => {
    completeRegistration();
  };

  const completeRegistration = async () => {
    try {
      if (authRequestId) {
        const finalizeResult = await finalizeAuthRequest(authRequestId, sessionId, sessionToken);
        if (finalizeResult.callbackUrl) {
          window.location.href = finalizeResult.callbackUrl;
        } else {
          console.error('No callback URL in the response');
          setError('Registration successful, but redirect failed. Please try again.');
        }
      } else {
        console.log('Registration completed successfully');
        navigate('/');
      }
    } catch (error) {
      console.error('Error finalizing registration:', error);
      setError('An unexpected error occurred during registration finalization');
    }
  };

  const handleMfaVerify = async (code) => {
    try {
      await verifyTOTPRegistration(userId, sessionToken, code);
      completeRegistration();
    } catch (error) {
      console.error('Error verifying MFA:', error);
      setError('Failed to verify MFA. Please try again.');
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
            {step === 'registration' ? 'Registration' : 'MFA Setup'}
          </h2>
          {error && (
            <p style={{ color: 'red', textAlign: 'center', marginBottom: '16px' }}>{error}</p>
          )}
          {step === 'registration' ? (
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
                    backgroundColor: '#1E1E1E',
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
          ) : (
            <>
              <TOTPSetupComponent uri={totpUri} secret={totpSecret} onVerify={handleMfaVerify} />
              <div style={{ marginTop: '16px' }}>
                <button
                  onClick={handleSkipMfa}
                  style={{
                    width: '100%',
                    padding: '10px',
                    backgroundColor: '#6B7280',
                    color: 'white',
                    fontWeight: 'bold',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '16px',
                    cursor: 'pointer',
                  }}
                >
                  Skip Two-Factor Authentication
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
