import React from 'react';
import { Popconfirm, Button, Table } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { DeleteOutlined } from '@ant-design/icons';
import { deleteSpaceToken, getSpaceTokens } from '../../../actions/tokens';

export default function TokenList({ role = 'owner' }) {
  const dispatch = useDispatch();
  const fetchTokens = () => {
    dispatch(getSpaceTokens());
  };

  const onDelete = (id) => {
    dispatch(deleteSpaceToken(id)).then(() => dispatch(getSpaceTokens()));
  };

  React.useEffect(() => {
    fetchTokens();
    // eslint-disable-next-line
  }, [dispatch]);

  const { tokens } = useSelector((state) => {
    var tokens = [];
    tokens = state.spaces.details[state.spaces.selected]?.tokens || [];
    return {
      tokens,
    };
  });

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '30',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '40%',
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      width: '30%',
      align: 'center',
      render: (_, record) => {
        return (
          <span>
            <Popconfirm title="Sure to Revoke?" onConfirm={() => onDelete(record?.id)}>
              <Button danger disabled={role !== 'owner'} icon={<DeleteOutlined />}>
                Revoke
              </Button>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  return (
    <Table bordered columns={columns} dataSource={tokens} rowKey={'id'} style={{ width: '78vw' }} />
  );
}
