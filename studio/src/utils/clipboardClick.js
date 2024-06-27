import React from 'react';
import { Button, Input, Alert, Space } from 'antd';
import { addErrorNotification } from '../actions/notifications';
import { useDispatch } from 'react-redux';

function ClipBoardCopy({ text }) {
  const dispatch = useDispatch();
  const [isCopied, setIsCopied] = React.useState(false);
  async function copyTextToClipboard(text) {
    if ('clipboard' in navigator) {
      return await navigator.clipboard.writeText(text);
    } else {
      return document.execCommand('copy', true, text);
    }
  }

  const handleCopyClick = () => {
    copyTextToClipboard(text)
      .then(() => {
        // If successful, update the isCopied state value
        setIsCopied(true);
        setTimeout(() => {
          setIsCopied(false);
        }, 5000);
      })
      .catch((err) => {
        dispatch(addErrorNotification('Could not copy token'));
      });
  };

  return (
    <Space direction="vertical">
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
        }}
      >
        <Input readOnly={true} placeholder="token" value={text} />
        <Button primary="true" onClick={handleCopyClick}>
          {isCopied ? 'Copied!' : 'Copy'}
        </Button>
      </div>
      <Alert
        type={isCopied ? 'success' : 'error'}
        description={
          'Make sure to copy your personal access token now. You won’t be able to see it again!'
        }
      />
    </Space>
  );
}

export default ClipBoardCopy;
