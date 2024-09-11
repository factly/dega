import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  startTOTPRegistration,
  verifyTOTPRegistration,
  checkTOTP,
} from './mfa';

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
      getProviderInformation(intentId, token);
    }
  }, [location]);

  const getProviderInformation = async (intentId, token) => {
    try {
      const response = await fetch(
        `${window.REACT_APP_ZITADEL_AUTHORITY}/v2/idp_intents/${intentId}`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
          },
          body: JSON.stringify({
            idpIntentToken: token,
          }),
        },
      );

      if (response.ok) {
        const data = await response.json();
        handleAuthenticationFlow(data, intentId, token);
      } else {
        console.error('Failed to get provider information');
        setError('Failed to complete login. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred. Please try again later.');
    }
  };

  const handleAuthenticationFlow = async (providerData, intentId, token) => {
    const email = providerData.idpInformation?.rawInformation?.User?.email;

    if (userId) {
      // 'user' parameter is present in URL, proceed with login
      await loginUser(userId, intentId, token);
    } else if (email) {
      // Check if user exists in ZITADEL
      const existingUser = await checkUserExists(email);
      if (existingUser) {
        // User exists in ZITADEL, link IDP to existing user
        await linkExistingUser(existingUser, providerData, intentId, token);
      } else {
        // User doesn't exist in ZITADEL, proceed with registration
        await registerUser(
          providerData.idpInformation?.rawInformation?.User,
          intentId,
          token,
          providerData,
        );
      }
    } else {
      console.error('Unable to determine user email');
      setError('An error occurred. Please try again later.');
    }
  };

  const checkUserExists = async (email) => {
    try {
      const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
        },
        body: JSON.stringify({
          query: {
            offset: '0',
            limit: 1,
            asc: true,
          },
          queries: [
            {
              emailQuery: {
                emailAddress: email,
                method: 'TEXT_QUERY_METHOD_EQUALS',
              },
            },
          ],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.result && data.result.length > 0) {
          return data.result[0];
        } else {
          return null;
        }
      } else {
        throw new Error('Failed to check user existence');
      }
    } catch (error) {
      console.error('Error checking user existence:', error);
      return null;
    }
  };

  const linkExistingUser = async (existingUser, providerData, intentId, token) => {
    try {
      const userId = existingUser.userId;

      const response = await fetch(
        `${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/${userId}/links`,
        {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
          },
          body: JSON.stringify({
            idpLink: {
              idpId: `${window.REACT_APP_ZITADEL_IDP_ID}`,
              userId: providerData.idpInformation?.rawInformation?.User?.sub,
              userName: providerData.idpInformation?.rawInformation?.User?.name,
            },
          }),
        },
      );

      if (response.ok) {
        // Create a session for the existing user
        const sessionResponse = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/sessions`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
          },
          body: JSON.stringify({
            checks: {
              user: {
                userId: userId,
              },
            },
          }),
        });

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          setSessionId(sessionData.sessionId);
          setSessionToken(sessionData.sessionToken);
          setStep('mfa-verify');
        } else {
          console.error('Failed to create session');
          setError('Failed to create session. Please try again.');
        }
      } else {
        console.error('Failed to link user to IDP');
        setError('Failed to link account. Please try again.');
      }
    } catch (error) {
      console.error('Error linking user to IDP:', error);
      setError('An error occurred while linking your account. Please try again later.');
    }
  };

  const loginUser = async (userId, intentId, token) => {
    try {
      const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/sessions`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
        },
        body: JSON.stringify({
          checks: {
            user: {
              userId: userId,
            },
            idpIntent: {
              idpIntentId: intentId,
              idpIntentToken: token,
            },
          },
        }),
      });

      if (response.ok) {
        const sessionData = await response.json();
        setSessionId(sessionData.sessionId);
        setSessionToken(sessionData.sessionToken);
        setStep('mfa-verify');
      } else {
        console.error('Failed to login');
        setError('Failed to login. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred during login. Please try again later.');
    }
  };

  const registerUser = async (userData, intentId, token, providerData) => {
    try {
      const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/human`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
        },
        body: JSON.stringify({
          username: userData.email,
          profile: {
            givenName: userData.given_name,
            familyName: userData.family_name,
            displayName: userData.name,
          },
          email: {
            email: userData.email,
            isVerified: userData.email_verified,
          },
          idpLinks: [
            {
              idpId: `${window.REACT_APP_ZITADEL_IDP_ID}`,
              idpExternalId: userData.sub,
              userId: userData.sub,
              userName: userData.email,
            },
          ],
        }),
      });

      if (response.ok) {
        const newUserData = await response.json();
        localStorage.setItem('userId', newUserData.userId);

        // Create a session for the new user
        const sessionResponse = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/sessions`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
          },
          body: JSON.stringify({
            checks: {
              user: {
                userId: newUserData.userId,
              },
              idpIntent: {
                idpIntentId: intentId,
                idpIntentToken: token,
              },
            },
          }),
        });

        if (sessionResponse.ok) {
          const sessionData = await sessionResponse.json();
          setSessionId(sessionData.sessionId);
          setSessionToken(sessionData.sessionToken);

          // Start TOTP registration
          const totpData = await startTOTPRegistration(
            newUserData.userId,
            window.REACT_APP_ZITADEL_PAT,
          );
          setTotpUri(totpData.uri);
          setTotpSecret(totpData.secret);
          setStep('mfa-setup');
        } else {
          console.error('Failed to create session');
          setError('Failed to create session. Please try again.');
        }
      } else {
        const errorData = await response.json();
        console.error('Failed to register user:', errorData);
        setError(`Failed to register. ${errorData.message || 'Please try again.'}`);
      }
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

  const initiateGoogleSignIn = async () => {
    try {
      const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/idp_intents`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
        },
        body: JSON.stringify({
          idpId: `${window.REACT_APP_ZITADEL_IDP_ID}`,
          urls: {
            successUrl: `${window.PUBLIC_URL}/auth/login`,
            failureUrl: `${window.PUBLIC_URL}`,
          },
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

  return {
    initiateGoogleSignIn,
    error,
    step,
    totpUri,
    totpSecret,
    handleMfaSetup,
    handleMfaVerify,
  };
};
