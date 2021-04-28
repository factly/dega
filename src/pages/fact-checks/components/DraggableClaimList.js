import { CaretRightOutlined, EditOutlined } from '@ant-design/icons';
import { Button, Card, Collapse, Tree } from 'antd';
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setClaimOrder, resetClaimOrder } from '../../../actions/claimOrder';

function DraggableClaimList({ ids, setClaimID, details, showModal }) {
  const dispatch = useDispatch();
  const { claimOrder } = useSelector((state) => {
    const order = state.claimOrder.order;
    return { claimOrder: order };
  });
  const setClaimListOrder = (order) => {
    dispatch(setClaimOrder(order));
  };

  useEffect(() => {}, [claimOrder, dispatch]);
  const { Panel } = Collapse;
  let key;
  let treeNode;
  const dig = (claimOrder, claims) => {
    const list = [];
    if (claims.length > claimOrder.length) {
      let newClaims = claims.filter((x) => !claimOrder.includes(x));
      newClaims.forEach((element) => {
        claimOrder.push(element);
      });
    }
    claimOrder.map(
      (id) => (
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
          ),
        }),
        list.push(treeNode)
      ),
    );
    return list;
  };

  const [treeData, setTreeData] = React.useState(dig(claimOrder, ids));
  React.useEffect(() => {}, [treeData]);

  const onDrop = (info) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    const loop = (data, key, callback) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].key === key) {
          return callback(data[i], i, data, claimListOrder);
        }
        if (data[i].children) {
          loop(data[i].children, key, callback);
        }
      }
    };
    const data = treeData;
    const claimListOrder = claimOrder;

    let dragObj;
    let drapObjKey;

    loop(data, dragKey, (item, index, arr, orderArr) => {
      arr.splice(index, 1);
      orderArr.splice(index, 1);
      dragObj = item;
      drapObjKey = item.key;
    });
    if (info.dropToGap || dropPosition !== 1) {
      let ar;
      let i;
      let orderAr;
      loop(data, dropKey, (item, index, arr, orderArr) => {
        ar = arr;
        i = index;
        orderAr = orderArr;
      });
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
        orderAr.splice(i, 0, drapObjKey);
      } else {
        ar.splice(i + 1, 0, dragObj);
        orderAr.splice(i + 1, 0, drapObjKey);
      }
    }
    setTreeData(data);
    setClaimListOrder(claimListOrder);
  };

  return (
    <Collapse
      bordered={false}
      className="site-collapse-custom-collapse"
      defaultActiveKey={['1']}
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
    >
      <Panel header="Claims" key="1">
        <Tree className="draggable-tree" draggable blockNode onDrop={onDrop} treeData={treeData} />
      </Panel>
    </Collapse>
  );
}
export default DraggableClaimList;
