import { CaretRightOutlined, EditOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Card, Collapse, Tree } from 'antd';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

function ClaimList({ ids, setClaimID, details, showModal, setClaimOrder, claimOrder }) {
  const [updateData, setUpdateData] = React.useState(true);
  const dispatch = useDispatch();
  const [treeData, setTreeData] = React.useState(claimOrder);

  const moveUp = (id) => {
    const index = claimOrder.indexOf(id);
    let temp = claimOrder[index - 1];
    claimOrder[index - 1] = id;
    claimOrder[index] = temp;
    setClaimOrder(claimOrder);
    setTreeData(dig(claimOrder, ids));
  };
  const moveDown = (id) => {
    const index = claimOrder.indexOf(id);
    let temp = claimOrder[index + 1];
    claimOrder[index + 1] = id;
    claimOrder[index] = temp;
    setClaimOrder(claimOrder);
    setTreeData(dig(claimOrder, ids));
  };

  useEffect(() => {}, [claimOrder, dispatch]);
  const { Panel } = Collapse;
  let key;
  let treeNode;
  const dig = (claimOrder, claims) => {
    setUpdateData(false);
    const list = [];
    if (claims.length > claimOrder.length) {
      let newClaims = claims.filter((x) => !claimOrder.includes(x));
      newClaims.forEach((element) => {
        claimOrder.push(element);
      });
    }
    claimOrder.map(
      (id, index) => (
        (key = id),
        (treeNode = {
          key,
          title: (
            <Card
              key={id}
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3
                    style={{
                      width: '500px',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {details[id].claim}
                  </h3>
                  <div style={{ display: 'flex', justifyContent: 'end' }}>
                    {' '}
                    <Button
                      size="small"
                      onClick={() => {
                        setClaimID(id);
                        showModal();
                      }}
                    >
                      <EditOutlined />
                    </Button>
                    <Button
                      disabled={index === 0}
                      size="small"
                      onClick={() => {
                        moveUp(id);
                      }}
                    >
                      <UpOutlined />
                    </Button>
                    <Button
                      disabled={index === claimOrder.length - 1}
                      size="small"
                      onClick={() => {
                        moveDown(id);
                      }}
                    >
                      <DownOutlined />
                    </Button>
                  </div>
                </div>
              }
              style={{ margin: 5 }}
            >
              {details[id].fact}
            </Card>
          ),
        }),
        list.push(treeNode)
      ),
    );
    return list;
  };

  if (claimOrder && updateData) setTreeData(dig(claimOrder, ids));
  React.useEffect(() => {}, [treeData]);
  React.useEffect(() => {
    setTreeData(dig(claimOrder, ids));
  }, [claimOrder]);

  return (
    <Collapse
      bordered={false}
      className="site-collapse-custom-collapse"
      defaultActiveKey={['1']}
      expandIconPosition="right"
      expandIcon={({ isActive }) => <Button>{isActive ? 'Close' : 'Expand'}</Button>}
    >
      <Panel header={<h2>Claims</h2>} key="1">
        <Tree className="draggable-tree" blockNode treeData={treeData} />
      </Panel>
    </Collapse>
  );
}
export default ClaimList;
