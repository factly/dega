import React from 'react';
import { handleMfaChoice } from '../login';

const MfaChoiceStep = ({ }) => {
  return (
    <>
    <h2 className="text-xl font-semibold mb-4 text-center">Two-Factor Authentication</h2>
    <p className="text-center mb-4">
      Would you like to proceed with Two-Factor Authentication?
    </p>
      <button className='auth-form-button'
        onClick={() => handleMfaChoice('proceed')}
      >
        Proceed
      </button>
      <button className="auth-form-skip-button"
        onClick={() => handleMfaChoice('skip')}
      >
        Skip
      </button>
  </>
  );
};

export default MfaChoiceStep;