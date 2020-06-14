import React from 'react';
import { Modal, Button, Tabs, List, Avatar, Badge, Typography, Row, Col, Space, Input } from 'antd';
import UppyUploader from './uppy';
import MediaList from './list';

const { TabPane } = Tabs;

function MediaSelector({ show, handleCancel, handleSelect }) {
  const [selected, setSelected] = React.useState(null);

  return (
    <Modal
      visible={show}
      onOk={handleSelect}
      onCancel={handleCancel}
      closable={false}
      width={'800px'}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Return
        </Button>,
        <Button key="submit" type="primary" disabled={!selected} onClick={handleSelect}>
          {selected ? selected.name : null} Select
        </Button>,
      ]}
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="Select" key="1">
          <MediaList onSelect={setSelected} selected={selected} />
        </TabPane>
        <TabPane tab="Upload" key="2">
          <UppyUploader onUpload={setSelected} />
        </TabPane>
      </Tabs>
    </Modal>
  );
}

export default MediaSelector;
