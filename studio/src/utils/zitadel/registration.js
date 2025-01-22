import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Form, Input, Button, Space, Typography, Divider } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';
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
import AuthLayout from './Authlayout';

const { Text } = Typography;

const RegistrationForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState('');
  const [step, setStep] = useState('registration');
  const [userId, setUserId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [sessionToken, setSessionToken] = useState('');
  const [totpUri, setTotpUri] = useState('');
  const [totpSecret, setTotpSecret] = useState('');
  const [authRequestId, setAuthRequestId] = useState('');

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

  const handleSubmit = async (values) => {
    setError('');

    const registrationData = {
      profile: {
        givenName: values.firstName,
        familyName: values.lastName,
      },
      email: {
        email: values.email,
        isVerified: true,
      },
      password: {
        password: values.password,
        changeRequired: false,
      },
    };

    try {
      const registerData = await registerUser(registrationData);
      setUserId(registerData.userId);
      localStorage.setItem('userId', registerData.userId);

      const sessionData = await createSession(values.email);
      setSessionId(sessionData.sessionId);
      setSessionToken(sessionData.sessionToken);

      const verificationData = await verifyPassword(
        sessionData.sessionId,
        sessionData.sessionToken,
        values.password,
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

  const getTitle = () => {
    switch (step) {
      case 'registration':
        return 'Registration';
      case 'mfa-choice':
        return 'Two-Factor Authentication';
      case 'mfa-setup':
        return 'Set up Two-Factor Authentication';
      case 'mfa-verify':
        return 'Verify Two-Factor Authentication';
      default:
        return 'Registration';
    }
  };

  const renderForm = () => {
    switch (step) {
      case 'registration':
        return (
          <>
            <Form onFinish={handleSubmit} layout="vertical">
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[{ message: 'Please input your first name!' }]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[{ message: 'Please input your last name!' }]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                ]}
              >
                <Input size="large" />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ message: 'Please input your password!' }]}
              >
                <Input.Password size="large" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  block
                  style={{ backgroundColor: '#1E1E1E' }}
                >
                  Sign Up
                </Button>
              </Form.Item>
            </Form>

            <Divider>or</Divider>

            <Button
              icon={<GoogleOutlined />}
              size="large"
              block
              onClick={handleGoogleSignIn}
              style={{
                backgroundColor: '#4285F4',
                color: 'white',
              }}
            >
              Sign up with Google
            </Button>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Text>
                Already have an account? <Link to="/auth/login">Log in</Link>
              </Text>
            </div>
          </>
        );

      case 'mfa-choice':
        return (
          <Space direction="vertical" size="middle" style={{ width: '100%', textAlign: 'center' }}>
            <Text>Would you like to set up Two-Factor Authentication?</Text>
            <div style={{ display: 'flex', gap: '16px' }}>
              <Button
                type="primary"
                size="large"
                onClick={() => handleMfaChoice('proceed')}
                style={{ flex: 1, backgroundColor: '#1E1E1E' }}
              >
                Set up MFA
              </Button>
              <Button
                size="large"
                onClick={() => handleMfaChoice('skip')}
                style={{ flex: 1, backgroundColor: '#6B7280', color: 'white' }}
              >
                Skip
              </Button>
            </div>
          </Space>
        );

      case 'mfa-setup':
      case 'mfa-verify':
        return <TOTPSetupComponent uri={totpUri} secret={totpSecret} onVerify={handleMfaVerify} />;

<<<<<<< Updated upstream
=======
      case 'verification-pending':
        return (
          <Space direction="vertical" size="middle" style={{ width: '100%', textAlign: 'center' }}>
            <Alert
              message="Verify Your Email"
              description={
                <>
                  <p>We've sent you a verification email</p>
                  <p>
                    Please check your inbox and click the verification link to complete your
                    registration.
                  </p>
                </>
              }
              type="info"
              showIcon
            />
            <div style={{ marginTop: '16px' }}>
              <Link to="/auth/login">Return to Login</Link>
            </div>
          </Space>
        );

>>>>>>> Stashed changes
      default:
        return null;
    }
  };

  return (
    <AuthLayout title={getTitle()} error={error} logoSrc={degaImage}>
      {renderForm()}
    </AuthLayout>
  );
};

export default RegistrationForm;
