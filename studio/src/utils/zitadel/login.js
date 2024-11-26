import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { checkTOTP } from '../../actions/mfa';
import { useGoogleSignIn } from './idp';
import degaImage from '../../assets/dega.png';
import { TOTPSetupComponent } from './mfa';
import {
  createSession,
  getUserDetails,
  verifyPassword,
  getAuthRequestDetails,
  finalizeAuthRequest,
} from '../../actions/login';
import { requestPasswordReset, resetPassword } from '../../actions/forgotPassword';
import EmailInput from './login/emailInput';
import Password from './login/Password.js';
import Mfa from './login/mfa.js';
import MfaVerify from './login/mfaverify.js';
import RequestReset from './login/requestreset';
import ResetPassword from './login/resetpassword';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [step, setStep] = useState('email');
  const [sessionId, setSessionId] = useState('');
  const [userId, setUserId] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [authRequestId, setAuthRequestId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
  } = useGoogleSignIn();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const authRequest = searchParams.get('authRequest');
    if (authRequest) {
      setAuthRequestId(authRequest);
      localStorage.setItem('authRequestId', authRequest);
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

  const getAuthMethods = async (userId) => {
    const response = await fetch(
      `${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/${userId}/authentication_methods`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${localStorage.getItem('sessionToken')}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error('Failed to fetch authentication methods');
    }
    const data = await response.json();
    console.log('Auth methods response:', data);
    return data;
  };

  const handleEmailSubmit = async (values) => {
    setError('');
    setIsLoading(true);
    try {
      const sessionData = await createSession(values.email);
      localStorage.setItem('sessionData', JSON.stringify(sessionData));
      setSessionId(sessionData.sessionId);
      localStorage.setItem('sessionToken', sessionData.sessionToken);

      const userDetails = await getUserDetails(sessionData.sessionId);
      setUserId(userDetails.session.factors.user.id);
      localStorage.setItem('userId', userDetails.session.factors.user.id);
      localStorage.setItem('userEmail', values.email);

      setStep('password');
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (values) => {
    setError('');
    setIsLoading(true);
    try {
      const sessionData = JSON.parse(localStorage.getItem('sessionData'));
      const result = await verifyPassword(sessionId, sessionData.token, values.password);
      localStorage.setItem('sessionToken', result.sessionToken);

      const authMethods = await getAuthMethods(userId);
      if (
        authMethods.authMethodTypes &&
        authMethods.authMethodTypes.includes('AUTHENTICATION_METHOD_TYPE_TOTP')
      ) {
        setStep('mfa');
      } else {
        await finalizeLogin(result.sessionToken);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Invalid password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestReset = async () => {
    setError('');
    try {
      await requestPasswordReset(userId);
      setStep('reset-verify');
    } catch (error) {
      setError(`An error occurred: ${error.message}`);
    }
  };

  const handleResetPassword = async (values) => {
    setError('');
    setSuccessMessage('');
    try {
      await resetPassword(userId, values.newPassword, values.verificationCode);
      setStep('email');
      setSuccessMessage('Password reset successful. Please log in with your new password.');  // Set success message instead of error
    } catch (error) {
      setError(`An error occurred: ${error.message}`);
    }
  };

  const handleMfaSubmit = async (values) => {
    setError('');
    setIsLoading(true);
  
    try {
      const sessionData = JSON.parse(localStorage.getItem('sessionData'));
      const result = await checkTOTP(sessionId, sessionData.token, values.totpCode);
      if (result.sessionToken) {
        localStorage.setItem('sessionToken', result.sessionToken);
        await finalizeLogin(result.sessionToken);
      } else {
        setError('Invalid MFA code. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred during MFA verification');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMfaVerifySubmit = (values) => {
    handleMfaVerify(values.mfaCode);
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

  const BackArrowButton = ({ onClick }) => (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '8px',
        borderRadius: '50%',
        transition: 'background-color 0.3s ease',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
      }}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = '#f0f0f0';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = 'transparent';
      }}
    >
      <ArrowLeftOutlined style={{ fontSize: '20px', color: '#1E1E1E' }} />
    </button>
  );

  return (
    <div style={{ display: 'flex', width: '100%', height: '100vh', overflow: 'hidden' }}>
      {/* Left side with logo */}
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
            position: 'absolute',
            top: '35%',
            transform: 'translateY(-50%)',
            objectFit: 'contain',
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
          <h1 style={{ fontSize: '38px', fontWeight: 'bold', color: '#333' }}>DEGA</h1>
        </div>
      </div>

      {/* Right side with login form */}
      <div
        style={{
          width: '50%',
          height: '100%',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '0 20px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ width: '100%', maxWidth: '400px' }}>
          {step !== 'email' && <BackArrowButton onClick={resetLoginProcess} />}
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
              : step === 'mfa-verify'
              ? 'Verify Two-Factor Authentication'
              : step === 'reset-request'
              ? 'Reset Password'
              : step === 'reset-verify'
              ? 'Enter Verification Code'
              : 'Login'}
          </h2>

          {error && (
            <p style={{ color: 'red', textAlign: 'center', marginBottom: '16px' }}>{error}</p>
          )}

          {step === 'email' && (
            <>
              <EmailInput
                email={email}
                setEmail={setEmail}
                onSubmit={handleEmailSubmit}
                error={error}
                handleGoogleSignIn={handleGoogleSignIn}
              />
              {/* <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <span
                  onClick={() => setStep('reset-request')}
                  style={{ color: '#1E1E1E', textDecoration: 'none', cursor: 'pointer' }}
                >
                  Forgot Password?
                </span>
              </div> */}
            </>
          )}

          {step === 'password' && (
            <Password
              password={password}
              setPassword={setPassword}
              onSubmit={handlePasswordSubmit}
              onForgotPassword={() => setStep('reset-request')}
            />
          )}

          {step === 'reset-request' && (
            <RequestReset userEmail={email} onSubmit={handleRequestReset} />
          )}

          {step === 'reset-verify' && (
            <ResetPassword
              verificationCode={verificationCode}
              setVerificationCode={setVerificationCode}
              newPassword={newPassword}
              setNewPassword={setNewPassword}
              onSubmit={handleResetPassword}
            />
          )}

          {step === 'mfa' && (
            <Mfa totpCode={totpCode} setTotpCode={setTotpCode} onSubmit={handleMfaSubmit} />
          )}

          {step === 'mfa-setup' && (
            <TOTPSetupComponent uri={totpUri} secret={totpSecret} onVerify={handleMfaSetup} />
          )}

          {step === 'mfa-verify' && (
            <MfaVerify mfaCode={mfaCode} setMfaCode={setMfaCode} onSubmit={handleMfaVerifySubmit} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
