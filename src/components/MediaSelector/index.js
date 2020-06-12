import React from 'react';
import { Modal, Button, Tabs, List, Avatar } from 'antd';
import UppyUploader from './uppy';
import { useDispatch, useSelector } from 'react-redux';
import { getMedia } from '../../actions/media';

const { TabPane } = Tabs;

function MediaSelector({ show, handleCancel, handleSelect }) {
  const dispatch = useDispatch();

  const data = useSelector((state) =>
    state.media.req.filter((item) => {
      return item.query.page === 1;
    }),
  );

  React.useEffect(() => {
    dispatch(getMedia({ page: 1 }));
  }, [dispatch]);

  return (
    <Modal
      visible={show}
      onOk={handleSelect}
      onCancel={handleCancel}
      closable={false}
      footer={[
        <Button key="back" onClick={handleCancel}>
          Return
        </Button>,
        <Button key="submit" type="primary" onClick={handleSelect}>
          Select
        </Button>,
      ]}
      width={'800px'}
    >
      <Tabs defaultActiveKey="1">
        <TabPane tab="Select" key="1">
          <List
            grid={{
              gutter: 16,
              md: 4,
            }}
            pagination={{
              onChange: (page) => {
                console.log(page);
              },
              pageSize: 12,
            }}
            dataSource={data.length != 0 ? data[0].data : []}
            renderItem={(item) => (
              <List.Item>
                <Avatar
                  style={{ border: '1px solid black', cursor: 'pointer' }}
                  onClick={() => console.log('OK')}
                  shape="square"
                  size={174}
                  src={item.url}
                />
              </List.Item>
            )}
          />
        </TabPane>
        <TabPane tab="Upload" key="2">
          <UppyUploader />
        </TabPane>
      </Tabs>
    </Modal>
  );
}

export default MediaSelector;
