import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Form, Input, Button, Space, Typography, Row, Col, Divider, Card } from 'antd';
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

const { Title, Text } = Typography;

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
    <Row style={{ minHeight: '100vh' }}>
      <Col span={12} style={{ background: '#f0f0f0', position: 'relative' }}>
        <div
          style={{
            height: '100%',
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
              objectFit: 'contain',
              position: 'absolute',
              top: '35%',
              transform: 'translateY(-50%)',
            }}
          />
          <Title
            style={{
              position: 'absolute',
              bottom: '5%',
              fontSize: '38px',
              fontWeight: 'bold',
            }}
          >
            DEGA
          </Title>
        </div>
      </Col>

      <Col span={12}>
        <div
          style={{
            padding: '32px',
            maxWidth: '400px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            minHeight: '100%',
          }}
        >
          <Title level={2} style={{ textAlign: 'center', marginBottom: '24px' }}>
            {step === 'registration'
              ? 'Registration'
              : step === 'mfa-choice'
              ? 'Two-Factor Authentication'
              : step === 'mfa-setup'
              ? 'Set up Two-Factor Authentication'
              : 'Verify Two-Factor Authentication'}
          </Title>

          {error && (
            <Text type="danger" style={{ textAlign: 'center', marginBottom: '16px' }}>
              {error}
            </Text>
          )}

          {step === 'registration' && (
            <Form onFinish={handleSubmit} layout="vertical">
              <Form.Item
                label="First Name"
                name="firstName"
                rules={[{ required: true, message: 'Please input your first name!' }]}
              >
                <Input
                  size="large"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleChange({ target: { name: 'firstName', value: e.target.value } })
                  }
                />
              </Form.Item>

              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[{ required: true, message: 'Please input your last name!' }]}
              >
                <Input
                  size="large"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleChange({ target: { name: 'lastName', value: e.target.value } })
                  }
                />
              </Form.Item>

              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Please input your email!' },
                  { type: 'email', message: 'Please enter a valid email!' },
                ]}
              >
                <Input
                  size="large"
                  value={formData.email}
                  onChange={(e) =>
                    handleChange({ target: { name: 'email', value: e.target.value } })
                  }
                />
              </Form.Item>

              <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: 'Please input your password!' }]}
              >
                <Input.Password
                  size="large"
                  value={formData.password}
                  onChange={(e) =>
                    handleChange({ target: { name: 'password', value: e.target.value } })
                  }
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: '8px' }}>
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
          )}

          {step === 'mfa-choice' && (
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Text style={{ textAlign: 'center' }}>
                Would you like to set up Two-Factor Authentication?
              </Text>
              <Row gutter={16}>
                <Col span={12}>
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={() => handleMfaChoice('proceed')}
                    style={{ backgroundColor: '#1E1E1E' }}
                  >
                    Set up MFA
                  </Button>
                </Col>
                <Col span={12}>
                  <Button
                    size="large"
                    block
                    onClick={() => handleMfaChoice('skip')}
                    style={{ backgroundColor: '#6B7280', color: 'white' }}
                  >
                    Skip
                  </Button>
                </Col>
              </Row>
            </Space>
          )}

          {(step === 'mfa-setup' || step === 'mfa-verify') && (
            <TOTPSetupComponent uri={totpUri} secret={totpSecret} onVerify={handleMfaVerify} />
          )}

          {step === 'registration' && (
            <>
              <Divider style={{ margin: '8px 0' }}>or</Divider>
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
            </>
          )}

          <div className="ant-row" style={{ justifyContent: 'center', marginTop: '16px' }}>
            <Text style={{ color: '#15171a' }}>
              Already have an account?{' '}
              <Link
                to="/auth/login"
                style={{
                  color: '#1E1E1E',
                  textDecoration: 'none',
                  fontWeight: 500,
                  transition: 'all 0.3s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#1890ff';
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#1E1E1E';
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                Log in
              </Link>
            </Text>
          </div>
        </div>
      </Col>
    </Row>
  );
};

export default RegistrationForm;
