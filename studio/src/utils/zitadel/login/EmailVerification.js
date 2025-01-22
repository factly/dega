import React, { useState, useEffect } from 'react';
import { Button, Space, Typography, Alert } from 'antd';
import { MailOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const EmailVerification = ({ 
  userEmail, 
  userId, 
  onResendVerification, 
  error 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    // Initialize countdown from localStorage or default to 0
    const savedCooldown = parseInt(localStorage.getItem('resendCooldown'));
    const cooldownEndTime = parseInt(localStorage.getItem('cooldownEndTime'));
    
    if (cooldownEndTime && savedCooldown) {
      const remainingTime = Math.max(0, Math.floor((cooldownEndTime - Date.now()) / 1000));
      if (remainingTime > 0) {
        setResendCooldown(remainingTime);
      }
    }
  }, []);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => {
          const newValue = prev - 1;
          if (newValue === 0) {
            localStorage.removeItem('resendCooldown');
            localStorage.removeItem('cooldownEndTime');
          }
          return newValue;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0) {
      return;
    }

    setIsLoading(true);
    try {
      await onResendVerification();
      
      // Set cooldown period (60 seconds)
      const cooldownPeriod = 60;
      setResendCooldown(cooldownPeriod);
      
      // Store cooldown information
      const endTime = Date.now() + (cooldownPeriod * 1000);
      localStorage.setItem('resendCooldown', cooldownPeriod.toString());
      localStorage.setItem('cooldownEndTime', endTime.toString());
      
      setStatusMessage('Verification email has been resent successfully.');
    } catch (err) {
      setStatusMessage('Failed to resend verification email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const iconStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#e6f4ff',
    marginBottom: '24px'
  };

  return (
    <Space direction="vertical" size={16} style={{ width: '100%', textAlign: 'center', padding: '24px' }}>
      <div style={iconStyle}>
        <MailOutlined style={{ fontSize: '24px', color: '#1890ff' }} />
      </div>

      <Title level={2} style={{ marginBottom: '8px' }}>Check your email</Title>
      
      <Space direction="vertical" size={8}>
        <Text>We've sent a verification link to:</Text>
        <Text strong>{userEmail}</Text>
        <Text type="secondary">Click the link in the email to verify your account.</Text>
      </Space>

      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          style={{ marginTop: '16px' }}
        />
      )}

      {statusMessage && (
        <Alert
          message={statusMessage}
          type="info"
          showIcon
          style={{ marginTop: '16px' }}
        />
      )}

      <Space direction="vertical" size={8} style={{ width: '100%', marginTop: '16px' }}>
        <Button
          onClick={handleResend}
          disabled={resendCooldown > 0 || isLoading}
          type="primary"
          icon={<ReloadOutlined spin={isLoading} />}
          size="large"
          style={{ width: '100%' }}
        >
          {resendCooldown > 0
            ? `Resend available in ${resendCooldown}s`
            : 'Resend verification email'}
        </Button>

        <Text type="secondary" style={{ fontSize: '14px' }}>
          Make sure to check your spam folder if you don't see the email.
        </Text>
      </Space>
    </Space>
  );
};

export default EmailVerification;