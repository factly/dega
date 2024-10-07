import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { checkTOTP } from '../../actions/mfa';
import { useGoogleSignIn } from './idp';
import degaImage from '../../assets/dega.png';
import {
  createSession,
  getUserDetails,
  verifyPassword,
  getAuthRequestDetails,
  finalizeAuthRequest,
} from '../../actions/login';
import { requestPasswordReset, resetPassword } from '../../actions/forgotPassword';
import { checkUserExists } from '../../actions/idp';

import EmailStep from './loginsteps/EmailStep';
import PasswordStep from './loginsteps/PasswordStep';
import MfaStep from './loginsteps/MfaStep';
import MfaSetupStep from './loginsteps/MfaSetupStep';
import MfaVerifyStep from './loginsteps/MfaVerifyStep';
import ResetRequestStep from './loginsteps/ResetRequestStep';
import ResetRequestStep2 from './loginsteps/ResetRequestStep2';
import ResetVerifyStep from './loginsteps/ResetVerifyStep';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [step, setStep] = useState('email');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [userId, setUserId] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [authRequestId, setAuthRequestId] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const location = useLocation();

  const {
    initiateGoogleSignIn,
    error: googleError,
    step: googleStep,
    totpUri,
    totpSecret,
    handleMfaSetup,
    handleMfaVerify,
    handleskipGoogleMfa,
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
    }
  }, [googleStep]);

  const getAuthMethods = async (userId) => {
    const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/${userId}/authentication_methods`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('sessionToken')}`,
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch authentication methods');
    }
    const data = await response.json();
    console.log('Auth methods response:', data);
    return data;
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const sessionData = await createSession(email);
      localStorage.setItem('sessionData', JSON.stringify(sessionData));
      setSessionId(sessionData.sessionId);
      localStorage.setItem('sessionToken', sessionData.sessionToken);

      const userDetails = await getUserDetails(sessionData.sessionId);
      setUserId(userDetails.session.factors.user.id);
      localStorage.setItem('userId', userDetails.session.factors.user.id);
      localStorage.setItem('userEmail', email);

      setStep('password');
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An unexpected error occurred. Please try again later.');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
  
    try {
      const sessionData = JSON.parse(localStorage.getItem('sessionData'));
      const result = await verifyPassword(sessionId, sessionData.token, password);
      localStorage.setItem('sessionToken', result.sessionToken);
  
      const authMethods = await getAuthMethods(userId);
      if (authMethods.authMethodTypes && authMethods.authMethodTypes.includes('AUTHENTICATION_METHOD_TYPE_TOTP')) {
        setStep('mfa');
      } else {
        await finalizeLogin(result.sessionToken);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An unexpected error occurred');
    }
  };

  const handleMfaSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const sessionData = JSON.parse(localStorage.getItem('sessionData'));
      const result = await checkTOTP(sessionId, sessionData.token, totpCode);
      if (result.sessionToken) {
        localStorage.setItem('sessionToken', result.sessionToken);
        const finalizeResult = await finalizeAuthRequest(
          authRequestId,
          sessionId,
          result.sessionToken,
        );
        if (finalizeResult.callbackUrl) {
          window.location.href = finalizeResult.callbackUrl;
        } else {
          console.error('No callback URL in the response');
        }
      } else {
        setError('Invalid MFA code. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred during MFA verification');
    }
  };

  const handleSkipMfa = async () => {
    try {
      const sessionToken = localStorage.getItem('sessionToken');
      if (!sessionToken) {
        throw new Error('No session token found');
      }
      await finalizeLogin(sessionToken);
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred while skipping MFA');
    }
  };

  const finalizeLogin = async (sessionToken) => {
    try {
      if (!sessionToken) {
        throw new Error('No session token provided');
      }
      const authRequestId = localStorage.getItem('authRequestId');
      const finalizeResult = await finalizeAuthRequest(authRequestId, sessionId, sessionToken);
      if (finalizeResult.callbackUrl) {
        window.location.href = finalizeResult.callbackUrl;
      } else {
        console.error('No callback URL in the response');
        setError('Login successful, but redirect failed. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(`An unexpected error occurred during login finalization: ${error.message}`);
    }
  };

  const handleGoogleSignIn = async () => {
    const result = await initiateGoogleSignIn();
    if (result && result.error) {
      setError(result.error);
    }
  };

  const handleRequestResetEmail = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await checkUserExists(email);
      const userId = localStorage.getItem('userId');
      console.log('userId', userId);
      await requestPasswordReset(userId);
      setStep('reset-verify');
    } catch (error) {
      setError(`An error occurred: ${error.message}`);
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await requestPasswordReset(userId);
      setStep('reset-verify');
    } catch (error) {
      setError(`An error occurred: ${error.message}`);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const userId = localStorage.getItem('userId');
      await resetPassword(userId, newPassword, verificationCode);
      setStep('email');
      setError('Password reset successful. Please log in with your new password.');
    } catch (error) {
      setError(`An error occurred: ${error.message}`);
    }
  };

  const resetLoginProcess = () => {
    setEmail('');
    setPassword('');
    setError('');
    setStep('email');
    setSessionId('');
    setUserId('');
    setTotpCode('');
    setMfaCode('');
    setVerificationCode('');
    setNewPassword('');
    localStorage.removeItem('sessionData');
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
  };

  const BackArrowIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M19 12H5M12 19L5 12L12 5"
        stroke="#1E1E1E"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const BackArrowButton = ({ onClick }) => (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        borderRadius: '50%',
        transition: 'background-color 0.3s ease',
        position: 'static',
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = '#f0f0f0';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'transparent';
      }}
    >
      <BackArrowIcon />
    </button>
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden', display: 'flex' }}>
      <div style={{ width: '50%', height: '100%', backgroundColor: '#f0f0f0', position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <img
          src={degaImage}
          alt="DEGA"
          style={{ width: '40%', height: '40%', objectFit: 'contain', position: 'absolute', top: '35%', transform: 'translateY(-50%)' }}
        />
        <div style={{ position: 'absolute', bottom: '5%', left: '45%', transform: 'translateX(-50%)', display: 'flex', alignItems: 'center' }}>
          <h1 style={{ fontSize: '38px', fontWeight: 'bold', color: '#333' }}>DEGA</h1>
        </div>
      </div>
      <div style={{ width: '50%', height: '100%', backgroundColor: 'white', display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ width: '100%', maxWidth: '400px', padding: '0 32px' }}>
          {step !== 'email' && <BackArrowButton onClick={resetLoginProcess} />}
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center', color: '#333' }}>
            {step === 'email'
              ? 'Login'
              : step === 'password'
                ? 'Enter Password'
                : step === 'mfa'
                  ? 'MFA Verification'
                  : step === 'mfa-setup'
                    ? 'Set up Two-Factor Authentication'
                    : step === 'mfa-verify'
                      ? 'Verify Two-Factor Authentication'
                      : step === 'reset-request'
                        ? 'Reset Password'
                        : step === 'reset-verify'
                          ? 'Enter Verification Code'
                          : 'Login'}
          </h2>
          {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: '16px' }}>{error}</p>}
          {step === 'email' && <EmailStep email={email} setEmail={setEmail} handleEmailSubmit={handleEmailSubmit} handleGoogleSignIn={handleGoogleSignIn} />}
          {step === 'password' && <PasswordStep password={password} setPassword={setPassword} handlePasswordSubmit={handlePasswordSubmit} />}
          {step === 'mfa' && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              fontWeight: 'bold',
              gap: '20px'
            }}>
              <MfaStep totpCode={totpCode} setTotpCode={setTotpCode} handleMfaSubmit={handleMfaSubmit} />
              <button onClick={handleSkipMfa}>Skip</button>
            </div>
          )}
          {step === 'mfa-setup' && <MfaSetupStep uri={totpUri} secret={totpSecret} onVerify={handleMfaSetup} />}
          {step === 'mfa-verify' && <MfaVerifyStep mfaCode={mfaCode} setMfaCode={setMfaCode} handleMfaVerify={handleMfaVerify} />}
          {step === 'reset-request' && <ResetRequestStep email={email} handleRequestReset={handleRequestReset} />}
          {step === 'reset-request2' && <ResetRequestStep2 email={email} handleRequestReset={handleRequestResetEmail} />}
          {step === 'reset-verify' && <ResetVerifyStep verificationCode={verificationCode} setVerificationCode={setVerificationCode} newPassword={newPassword} setNewPassword={setNewPassword} handleResetPassword={handleResetPassword} />}

          <div style={{ textAlign: 'center' }}>
            {step === 'email' && (
              <>
                <span>
                  Don't have an account?{' '}
                  <Link to={`/auth/registration?authRequest=${authRequestId}`} style={{ color: '#1E1E1E', textDecoration: 'none' }}>
                    Sign up
                  </Link>
                </span>
                <div style={{ marginTop: '10px' }}>
                  <span onClick={() => setStep('reset-request')} style={{ color: '#1E1E1E', textDecoration: 'none', cursor: 'pointer' }}>
                    Forgot Password?
                  </span>
                </div>
              </>
            )}
            {step === 'password' && (
              <div style={{ marginTop: '10px' }}>
                <span onClick={() => setStep('reset-request')} style={{ color: '#1E1E1E', textDecoration: 'none', cursor: 'pointer' }}>
                  Forgot Password?
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;