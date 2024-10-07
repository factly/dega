import React from 'react';
import {TOTPSetupComponent} from '../mfa';

const MfaSetupStep = ({ uri, secret, onVerify }) => {
  return <TOTPSetupComponent uri={uri} secret={secret} onVerify={onVerify} />;
};

export default MfaSetupStep;