import { CaretRightOutlined, EditOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import { Button, Card, Collapse, Tree } from 'antd';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';

function DraggableClaimList({ ids, setClaimID, details, showModal, setClaimOrder, claimOrder }) {
  const [updateData, setUpdateData] = React.useState(true);
  const dispatch = useDispatch();
  const [treeData, setTreeData] = React.useState(claimOrder);

  const moveUp = (id) => {
    const index = claimOrder.indexOf(id);
    if (index > 0) {
      let temp = claimOrder[index - 1];
      claimOrder[index - 1] = id;
      claimOrder[index] = temp;
    }
    setTreeData(dig(claimOrder, ids));
  };
  const moveDown = (id) => {
    const index = claimOrder.indexOf(id);
    if (index < claimOrder.length - 1) {
      let temp = claimOrder[index + 1];
      claimOrder[index + 1] = id;
      claimOrder[index] = temp;
    }
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
                  <p
                    style={{
                      width: '90%',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}
                  >
                    {details[id].claim}
                  </p>
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

  return (
    <Collapse
      bordered={false}
      className="site-collapse-custom-collapse"
      defaultActiveKey={['1']}
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
    >
      <Panel header="Claims" key="1">
        <Tree className="draggable-tree" blockNode treeData={treeData} />
      </Panel>
    </Collapse>
  );
}
export default DraggableClaimList;
