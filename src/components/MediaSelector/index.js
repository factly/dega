import React from 'react';
import { Modal, Button, Tabs, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import MediaUploader from './uploader';
import MediaList from './list';
import { getMedium } from '../../actions/media';

const { TabPane } = Tabs;

function MediaSelector({ value = null, onChange }) {
  const [show, setShow] = React.useState(false);
  const [selected, setSelected] = React.useState(null);

  const dispatch = useDispatch();

  const medium = useSelector((state) => {
    return state.media.details[value] || null;
  });

  React.useEffect(() => {
    if (value) dispatch(getMedium(value));
  }, []);

  return (
    <>
      <Modal
        visible={show}
        onCancel={() => setShow(false)}
        closable={false}
        width={'800px'}
        footer={[
          <Button key="back" onClick={() => setShow(false)}>
            Return
          </Button>,
          <Button
            key="submit"
            type="primary"
            disabled={!selected}
            onClick={() => {
              setShow(false);
              onChange(selected.id);
            }}
          >
            {selected ? selected.name : null} Select
          </Button>,
        ]}
      >
        <Tabs defaultActiveKey="1">
          <TabPane tab="Select" key="1">
            <MediaList onSelect={setSelected} selected={selected} />
          </TabPane>
          <TabPane tab="Upload" key="2">
            <MediaUploader />
          </TabPane>
        </Tabs>
      </Modal>
      <Space direction="vertical">
        {medium ? <img src={medium.url} alt={medium.alt_text} width="100%" /> : null}
        <Button onClick={() => setShow(true)}>Select</Button>
      </Space>
    </>
  );
}

export default MediaSelector;
