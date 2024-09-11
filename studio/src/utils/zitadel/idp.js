import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { startTOTPRegistration, verifyTOTPRegistration, checkTOTP } from '../../actions/mfa';
import {
  getProviderInformation,
  checkUserExists,
  linkExistingUser,
  createSession,
  registerUser,
  initiateGoogleSignIn,
} from '../../actions/idp';

export const useGoogleSignIn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [step, setStep] = useState('initial');
  const [totpUri, setTotpUri] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [sessionToken, setSessionToken] = useState('');

  const params = new URLSearchParams(location.search);
  const intentId = params.get('id');
  const token = params.get('token');
  const userId = params.get('user');

  useEffect(() => {
    if (intentId && token) {
      handleProviderInformation(intentId, token);
    }
  }, [location]);

  const handleProviderInformation = async (intentId, token) => {
    try {
      const providerData = await getProviderInformation(intentId, token);
      await handleAuthenticationFlow(providerData, intentId, token);
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again later.');
    }
  };

  const handleAuthenticationFlow = async (providerData, intentId, token) => {
    const email = providerData.idpInformation?.rawInformation?.User?.email;

    try {
      if (userId) {
        await loginUser(userId, intentId, token);
      } else if (email) {
        const existingUser = await checkUserExists(email);
        if (existingUser) {
          await handleExistingUser(existingUser, providerData, intentId, token);
        } else {
          await handleNewUser(providerData.idpInformation?.rawInformation?.User, intentId, token);
        }
      } else {
        throw new Error('Unable to determine user email');
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'An error occurred. Please try again later.');
    }
  };

  const handleExistingUser = async (existingUser, providerData, intentId, token) => {
    try {
      await linkExistingUser(existingUser.userId, providerData);
      const sessionData = await createSession(existingUser.userId);
      setSessionId(sessionData.sessionId);
      setSessionToken(sessionData.sessionToken);
      setStep('mfa-verify');
    } catch (error) {
      console.error('Error handling existing user:', error);
      setError('An error occurred while linking your account. Please try again later.');
    }
  };

  const loginUser = async (userId, intentId, token) => {
    try {
      const sessionData = await createSession(userId, intentId, token);
      setSessionId(sessionData.sessionId);
      setSessionToken(sessionData.sessionToken);
      setStep('mfa-verify');
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred during login. Please try again later.');
    }
  };

  const handleNewUser = async (userData, intentId, token) => {
    try {
      const newUserData = await registerUser(userData, intentId, token);
      localStorage.setItem('userId', newUserData.userId);

      const sessionData = await createSession(newUserData.userId, intentId, token);
      setSessionId(sessionData.sessionId);
      setSessionToken(sessionData.sessionToken);

      const totpData = await startTOTPRegistration(
        newUserData.userId,
        window.REACT_APP_ZITADEL_PAT,
      );
      setTotpUri(totpData.uri);
      setTotpSecret(totpData.secret);
      setStep('mfa-setup');
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred during registration. Please try again later.');
    }
  };

  const handleMfaSetup = async (code) => {
    try {
      const userId = localStorage.getItem('userId');
      await verifyTOTPRegistration(userId, sessionToken, code);
      navigate('/');
    } catch (error) {
      console.error('Error verifying MFA:', error);
      setError('Failed to verify MFA. Please try again.');
    }
  };

  const handleMfaVerify = async (code) => {
    try {
      const result = await checkTOTP(sessionId, sessionToken, code);
      if (result.sessionToken) {
        localStorage.setItem('sessionToken', result.sessionToken);
        navigate('/');
      } else {
        setError('Invalid MFA code. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying MFA:', error);
      setError('Failed to verify MFA. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const data = await initiateGoogleSignIn(window.PUBLIC_URL);
      window.location.href = data.authUrl;
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again later.');
    }
  };

  return {
    initiateGoogleSignIn: handleGoogleSignIn,
    error,
    step,
    totpUri,
    totpSecret,
    handleMfaSetup,
    handleMfaVerify,
  };
};
