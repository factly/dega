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
  getAuthRequestDetails,
  finalizeAuthRequest,
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
  const [authRequestId, setAuthRequestId] = useState('');

  const params = new URLSearchParams(location.search);
  const intentId = params.get('id');
  const token = params.get('token');
  const userId = params.get('user');

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const authRequest = searchParams.get('authRequest');
    if (authRequest) {
      setAuthRequestId(authRequest);
      localStorage.setItem('authRequestId', authRequest);
      getAuthRequestDetails(authRequest);
    } else {
      const storedAuthRequestId = localStorage.getItem('authRequestId');
      if (storedAuthRequestId) {
        setAuthRequestId(storedAuthRequestId);
      }
    }
  }, [location]);

  useEffect(() => {
    if (intentId && token) {
      handleProviderInformation(intentId, token);
    }
  }, [intentId, token]);


  const handleAuthRequestDetails = async (authRequestId) => {
    try {
      const details = await getAuthRequestDetails(authRequestId);
    } catch (error) {
      console.error('Error fetching auth request details:', error);
      setError('An error occurred while fetching auth request details.');
    }
  };

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
        sessionData.sessionToken
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
      await completeAuthentication();
    } catch (error) {
      console.error('Error verifying MFA:', error);
      setError('Failed to verify MFA. Please try again.');
    }
  };

  const handleMfaVerify = async (code) => {
    try {
      const result = await checkTOTP(sessionId, sessionToken, code);
      if (result.sessionToken) {
        localStorage.setItem('sessionToken', sessionToken);
        // Update the state with the new sessionToken
        setSessionToken(result.sessionToken);
        await completeAuthentication(sessionId, result.sessionToken);
      } else {
        setError('Invalid MFA code. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying MFA:', error);
      setError('Failed to verify MFA. Please try again.');
    }
  };

  const handleskipGoogleMfa = async () => {
    try {
      if (!sessionId || !sessionToken) {
        throw new Error('Session information is missing');
      }
      await completeAuthentication(sessionId, sessionToken);
    } catch (error) {
      console.error('Error:', error);
      setError('An unexpected error occurred while skipping MFA');
    }
  };

  const completeAuthentication = async (currentSessionId, currentSessionToken) => {
    try {
      if (!currentSessionToken) {
        throw new Error('Session information is missing');
      }

      const storedAuthRequestId = authRequestId || localStorage.getItem('authRequestId');
      if (storedAuthRequestId) {
        const finalizeResult = await finalizeAuthRequest(storedAuthRequestId, currentSessionId, currentSessionToken);
        if (finalizeResult.callbackUrl) {
          localStorage.removeItem('authRequestId');
          window.location.href = finalizeResult.callbackUrl;
        } else {
          console.error('No callback URL in the response');
          setError('Authentication successful, but redirect failed. Please try again.');
        }
      }
        
    } catch (error) {
      console.error('Error completing authentication:', error);
      setError('An error occurred while completing authentication. Please try again.');
    }
  };



  const handleGoogleSignIn = async () => {
    try {
      const data = await initiateGoogleSignIn(window.PUBLIC_URL);
      const storedAuthRequestId = localStorage.getItem('authRequestId');
      if (storedAuthRequestId) {
        data.authUrl += `&authRequest=${storedAuthRequestId}`;
      }
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
    handleskipGoogleMfa,
  };
};