import React from 'react';
import { Modal, Button, Tabs } from 'antd';
import MediaUploader from './uploader';
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
          <MediaUploader onUpload={setSelected} />
        </TabPane>
      </Tabs>
    </Modal>
  );
}

export default MediaSelector;
