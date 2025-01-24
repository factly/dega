import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { checkTOTP } from '../../actions/mfa';
import { useGoogleSignIn } from './idp';
import degaImage from '../../assets/dega-1.png';
import { TOTPSetupComponent } from './mfa';
import {
  createSession,
  getUserDetails,
  verifyPassword,
  finalizeAuthRequest,
  checkUser,
  checkEmailVerification,
  resendVerificationEmail,
} from '../../actions/login';
import { requestPasswordReset } from '../../actions/forgotPassword';
import EmailInput from './login/emailInput';
import Password from './login/Password.js';
import Mfa from './login/mfa.js';
import MfaVerify from './login/mfaverify.js';
import RequestReset from './login/requestreset';
import AuthLayout from './Authlayout';
import EmailVerification from './login/EmailVerification.js';


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
  const [isLoading, setIsLoading] = useState(false);
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
      // getAuthRequestDetails(authRequest);
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
    return data;
  };

  const handleEmailSubmit = async (values) => {
    setError('');
    setIsLoading(true);
    try {
      const users = await checkUser(values.email);
      if (users.result && users.result.length > 0) {
        const sessionData = await createSession(users.result[0].userId);
        localStorage.setItem('sessionData', JSON.stringify(sessionData));
        setSessionId(sessionData.sessionId);
        localStorage.setItem('sessionToken', sessionData.sessionToken);

        const userDetails = await getUserDetails(sessionData.sessionId);
        const userId = userDetails.session.factors.user.id;
        setUserId(userId);
        localStorage.setItem('userId', userId);
        localStorage.setItem('userEmail', values.email);

        // Check email verification status
        const isEmailVerified = await checkEmailVerification(userId);
        if (!isEmailVerified) {
          setStep('verify-email');
          return;
        }

        setStep('password');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An unexpected error occurred. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setError('');
    setIsLoading(true);
    try {
      await resendVerificationEmail(userId);
      setError('Verification email has been resent. Please check your inbox.');
    } catch (error) {
      setError(error.message || 'Failed to resend verification email. Please try again.');
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
      setStep('reset-message');
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
      // Commented out auth request finalization
      const authRequestId = localStorage.getItem('authRequestId');
      const finalizeResult = await finalizeAuthRequest(authRequestId, sessionId, sessionToken);
      if (finalizeResult.callbackUrl) {
        window.location.href = finalizeResult.callbackUrl;
      } else {
        console.error('No callback URL in the response');
        setError('Login successful, but redirect failed. Please try again.');
      }

      // Instead, just set the session token and consider login successful
      // localStorage.setItem('sessionToken', sessionToken);
      // console.log('Login successful');
      // Redirect to home page after successful login
      // window.location.href = '/';
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
    localStorage.removeItem('sessionData');
    localStorage.removeItem('sessionToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
  };


  const getTitle = () => {
    switch (step) {
      case 'email':
        return 'Login';
      case 'password':
        return 'Enter Password';
      case 'mfa':
        return 'MFA Verification';
      case 'mfa-setup':
        return 'Set up Two-Factor Authentication';
      case 'mfa-verify':
        return 'Verify Two-Factor Authentication';
      case 'reset-request':
        return 'Reset Password';
      case 'reset-message':
        return 'Reset Request Sent';
      default:
        return 'Login';
    }
  };

  const renderForm = () => {
    switch (step) {
      case 'email':
        return (
          <EmailInput
            email={email}
            setEmail={setEmail}
            onSubmit={handleEmailSubmit}
            error={error}
            handleGoogleSignIn={handleGoogleSignIn}
          />
        );
      case 'verify-email':
        return (
          <EmailVerification
            userEmail={localStorage.getItem('userEmail')}
            userId={userId}
            onResendVerification={handleResendVerification}
            error={error}
          />
        );
      case 'password':
        return (
          <Password
            password={password}
            setPassword={setPassword}
            onSubmit={handlePasswordSubmit}
            onForgotPassword={() => setStep('reset-request')}
          />
        );
      case 'reset-request':
        return <RequestReset userEmail={email} onSubmit={handleRequestReset} />;
      case 'reset-message':
        return (
          <div className="text-center p-6 space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center"></div>
            <p className="text-gray-600">
              We've sent password reset instructions to your email address. Please check your inbox
              and follow the link to reset your password.
            </p>
          </div>
        );
      case 'mfa':
        return <Mfa totpCode={totpCode} setTotpCode={setTotpCode} onSubmit={handleMfaSubmit} />;
      case 'mfa-setup':
        return <TOTPSetupComponent uri={totpUri} secret={totpSecret} onVerify={handleMfaSetup} />;
      case 'mfa-verify':
        return (
          <MfaVerify mfaCode={mfaCode} setMfaCode={setMfaCode} onSubmit={handleMfaVerifySubmit} />
        );
      default:
        return null;
    }
  };

  return (
    <AuthLayout
      title={getTitle()}
      error={error}
      showBackButton={step !== 'email'}
      onBackClick={resetLoginProcess}
      logoSrc={degaImage}
    >
      {renderForm()}
    </AuthLayout>
  );
};

export default Login;
