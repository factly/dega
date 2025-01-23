import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Typography, Spin, Result, Button } from 'antd';

const { Text } = Typography;

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');
  const verificationAttempted = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      // Return early if verification was already attempted
      if (verificationAttempted.current) return;

      try {
        const params = new URLSearchParams(location.search);
        const userId = params.get('userID');
        const code = params.get('code');

        if (!userId || !code) {
          setStatus('failed');
          setError('Missing verification parameters');
          return;
        }

        // Set the flag before making the API call
        verificationAttempted.current = true;

        const response = await fetch(
          `${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/${userId}/email/verify`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Accept: 'application/json',
              Authorization: `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
            },
            body: JSON.stringify({
              verificationCode: code,
            }),
          },
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message?.split('(')[0].trim() || 'Verification failed');
        }

        await response.json();
        setStatus('success');

        // Redirect to login after a short delay
        setTimeout(() => {
          navigate('/auth/login');
        }, 3000);
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('failed');
        setError(error.message || 'Verification failed. Please try again or contact support.');
      }
    };

    verifyEmail();
  }, [location.search, navigate]);

  const renderContent = () => {
    switch (status) {
      case 'verifying':
        return (
          <Result
            icon={<Spin size="large" />}
            title="Verifying your email"
            subTitle="Please wait while we verify your email address..."
          />
        );

      case 'success':
        return (
          <Result
            status="success"
            title="Email Verified!"
            subTitle={
              <>
                <Text>Your email has been successfully verified.</Text>
                <br />
                <Text type="secondary">Redirecting to login page...</Text>
              </>
            }
            extra={[
              <Button
                type="primary"
                key="login"
                onClick={() => navigate('/auth/login')}
                className="w-full md:w-auto"
              >
                Go to Login
              </Button>,
            ]}
          />
        );

      case 'failed':
        return (
          <Result
            status="error"
            title="Verification Failed"
            subTitle={
              <>
                <Text>{error}</Text>
                <br />
                <Text type="secondary">
                  Please try clicking the verification link again or request a new verification
                  email.
                </Text>
              </>
            }
            extra={[
              <Button
                type="primary"
                key="login"
                onClick={() => navigate('/auth/login')}
                className="w-full md:w-auto"
              >
                Return to Login
              </Button>,
            ]}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen flex justify-center items-center p-6">
      <div className="w-full max-w-md">{renderContent()}</div>
    </div>
  );
};

export default VerifyEmail;
