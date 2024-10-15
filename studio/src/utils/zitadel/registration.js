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
import { useGoogleSignIn } from './idp';

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
  const [mfaCode, setMfaCode] = useState('');

  const {
    initiateGoogleSignIn,
    error: googleError,
    step: googleStep,
    totpUri: googleTotpUri,
    totpSecret: googleTotpSecret,
    handleGoogleSkipMfa,
    handleMfaSetup: handleGoogleMfaSetup,
    handleMfaVerify: handleGoogleMfaVerify,
  } = useGoogleSignIn();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const authRequest = searchParams.get('authRequest');
    if (authRequest) {
      setAuthRequestId(authRequest);
      localStorage.setItem('authRequestId', authRequest);
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
      setTotpUri(googleTotpUri);
      setTotpSecret(googleTotpSecret);
    }
  }, [googleStep, googleTotpUri, googleTotpSecret]);

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
      const registerData = await registerUser(registrationData);
      setUserId(registerData.userId);
      localStorage.setItem('userId', registerData.userId);

      const sessionData = await createSession(formData.email);
      setSessionId(sessionData.sessionId);
      setSessionToken(sessionData.sessionToken);

      const verificationData = await verifyPassword(
        sessionData.sessionId,
        sessionData.sessionToken,
        formData.password,
      );
      setSessionToken(verificationData.sessionToken);

      localStorage.setItem('sessionId', sessionData.sessionId);
      localStorage.setItem('sessionToken', verificationData.sessionToken);

      setStep('mfa-choice');
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An unexpected error occurred');
    }
  };

  const handleMfaChoice = async (choice) => {
    if (choice === 'proceed') {
      try {
        const totpData = await startTOTPRegistration(userId, sessionToken);
        setTotpUri(totpData.uri);
        setTotpSecret(totpData.secret);
        setStep('mfa-setup');
      } catch (error) {
        console.error('Error starting TOTP registration:', error);
        setError('Failed to start MFA setup. Please try again.');
      }
    } else {
      completeRegistration();
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
      if (step === 'mfa-verify') {
        await handleGoogleMfaVerify(code);
      } else {
        await verifyTOTPRegistration(userId, sessionToken, code);
      }
      completeRegistration();
    } catch (error) {
      console.error('Error verifying MFA:', error);
      setError('Failed to verify MFA. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await initiateGoogleSignIn();
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred during Google Sign-In. Please try again.');
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div
        style={{
          width: '50%',
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
        <h1
          style={{
            position: 'absolute',
            bottom: '5%',
            fontSize: '38px',
            fontWeight: 'bold',
            color: '#333',
          }}
        >
          DEGA
        </h1>
      </div>

      <div
        style={{ width: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <div style={{ width: '100%', maxWidth: '400px', padding: '0 32px' }}>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '24px',
              textAlign: 'center',
              color: '#333',
            }}
          >
            {step === 'registration'
              ? 'Registration'
              : step === 'mfa-choice'
              ? 'Two-Factor Authentication'
              : step === 'mfa-setup'
              ? 'Set up Two-Factor Authentication'
              : 'Verify Two-Factor Authentication'}
          </h2>

          {error && (
            <p style={{ color: 'red', textAlign: 'center', marginBottom: '16px' }}>{error}</p>
          )}

          {step === 'registration' && (
            <form onSubmit={handleSubmit}>
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
            </form>
          )}

          {step === 'mfa-choice' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <p style={{ marginBottom: '16px', textAlign: 'center' }}>
                Would you like to set up Two-Factor Authentication?
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                <button
                  onClick={() => handleMfaChoice('proceed')}
                  style={{
                    width: '48%',
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
                  Set up MFA
                </button>
                <button
                  onClick={() => handleMfaChoice('skip')}
                  style={{
                    width: '48%',
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
                  Skip
                </button>
              </div>
            </div>
          )}

          {(step === 'mfa-setup' || step === 'mfa-verify') && (
            <>
              <TOTPSetupComponent uri={totpUri} secret={totpSecret} onVerify={handleMfaVerify} />
            </>
          )}

          {step === 'registration' && (
            <>
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
                Sign up with Google
              </button>
            </>
          )}

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <span>
              Already have an account?{' '}
              <Link
                to="/auth/login"
                style={{ color: '#1E1E1E', textDecoration: 'none' }}
                onMouseEnter={(e) => {
                  e.target.style.color = 'blue';
                  e.target.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = '#1E1E1E';
                  e.target.style.textDecoration = 'none';
                }}
              >
                Log in
              </Link>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
