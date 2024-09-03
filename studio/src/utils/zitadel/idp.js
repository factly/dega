import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useGoogleSignIn = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  const params = new URLSearchParams(location.search);
    const intentId = params.get('id');
    const token = params.get('token');

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
            Authorization:
              'Bearer 7XWp1rpWcgZkgJJdo_km9cbzMVdkIAfNfEGrjjZTZAy0Ehf9ShS3gt1cKBLvLW3akUNw5JI',
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
    const userId = providerData.idpInformation?.rawInformation?.User?.sub;
    if (userId) {
      // User exists, proceed with login
      await loginUser(userId, intentId, token);
    } else {
      // User doesn't exist, proceed with registration
      await registerUser(providerData.idpInformation?.rawInformation?.User, intentId, token);
    }
  };

  const loginUser = async (userId, intentId, token) => {
    try {
      const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/sessions`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization:
            'Bearer 7XWp1rpWcgZkgJJdo_km9cbzMVdkIAfNfEGrjjZTZAy0Ehf9ShS3gt1cKBLvLW3akUNw5JI',
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
        localStorage.setItem('sessionToken', sessionData.token);
        navigate('/');
      } else {
        console.error('Failed to login');
        setError('Failed to login. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred during login. Please try again later.');
    }
  };

  const registerUser = async (userData, intentId, token) => {
    try {
      const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/human`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization:
            'Bearer 7XWp1rpWcgZkgJJdo_km9cbzMVdkIAfNfEGrjjZTZAy0Ehf9ShS3gt1cKBLvLW3akUNw5JI',
        },
        body: JSON.stringify({
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
              idpId: '282701719060623464',
              idpExternalId: userData.sub,
            },
          ],
        }),
      });

      if (response.ok) {
        const newUserData = await response.json();
        await loginUser(newUserData.userId, intentId, token);
      } else {
        console.error('Failed to register user');
        setError('Failed to register. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('An error occurred during registration. Please try again later.');
    }
  };

  const initiateGoogleSignIn = async () => {
    try {
      const response = await fetch(`${window.REACT_APP_ZITADEL_AUTHORITY}/v2/idp_intents`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization:
            'Bearer 7XWp1rpWcgZkgJJdo_km9cbzMVdkIAfNfEGrjjZTZAy0Ehf9ShS3gt1cKBLvLW3akUNw5JI',
        },
        body: JSON.stringify({
          idpId: '282701719060623464',
          urls: {
            successUrl: 'http://localhost:3000/auth/login',
            failureUrl: 'http://localhost:3000',
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

  return { initiateGoogleSignIn, error };
};