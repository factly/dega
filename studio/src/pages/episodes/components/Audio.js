import React from 'react';
import UppyUploader from '../../../components/Uppy';
import { Modal, Space, Button } from 'antd';

const Audio = ({ url, onUpload }) => {
  const [show, setShow] = React.useState(false);
  return (
    <>
      <Modal
        open={show}
        onCancel={() => setShow(false)}
        closable={false}
        width={'800px'}
        footer={[
          <Button key="back" onClick={() => setShow(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              setShow(false);
            }}
          >
            Submit
          </Button>,
        ]}
      >
        <Space direction="vertical">
          <UppyUploader
            onUpload={(values) => {
              onUpload(values[0]?.url?.raw);
              setShow(false);
            }}
            allowedFileTypes={['audio/*']}
          />
        </Space>
      </Modal>
      <Space direction="vertical">
        {url ? (
          <audio controls>
            <source src={url} type="audio/ogg" />
          </audio>
        ) : null}
        <Space direction="horizontal">
          {url ? <Button onClick={() => onUpload('')}>Remove</Button> : null}{' '}
          <Button onClick={() => setShow(true)}>Select</Button>
        </Space>
      </Space>
    </>
  );
};

export default Audio;
