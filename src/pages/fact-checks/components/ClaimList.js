import { CaretRightOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Collapse } from 'antd';
import React from 'react';

function ClaimList({ ids, setClaimID, details, showModal }) {
  const { Panel } = Collapse;
  return (
    <Collapse
      bordered={false}
      defaultActiveKey={['1']}
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
      className="site-collapse-custom-collapse"
    >
      <Panel header="Claims" key="1" className="site-collapse-custom-panel">
        {ids.map((id) => (
          <Card
            title={
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <p>{details[id].claim}</p>
                <Button
                  onClick={() => {
                    setClaimID(id);
                    showModal();
                  }}
                >
                  <EditOutlined />
                </Button>
              </div>
            }
            style={{ margin: 5 }}
          >
            {details[id].fact}
          </Card>
        ))}
      </Panel>
    </Collapse>
  );
}

export default ClaimList;
