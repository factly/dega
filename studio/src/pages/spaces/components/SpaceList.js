import React from 'react';
import { Popconfirm, Button, Table } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { deleteSpace, getSpaces } from './../../../actions/spaces';
import { spaceSelector } from '../../../selectors/spaces';
import { DeleteOutlined } from '@ant-design/icons';
import { reindex } from '../../../actions/meiliReindex';

function SpaceList() {
  const dispatch = useDispatch();
  const { spaces, loading } = useSelector(spaceSelector);

  const fetchSpaces = () => {
    dispatch(getSpaces());
  };
  const handleSpaceReindex = (id) => {
    dispatch(reindex(id));
  };

  const columns = [
    {
      title: 'Id',
      dataIndex: 'id',
      key: 'spaceId',
      width: '8%',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '12%',
      render: (_, record) => {
        return (
          <Link
            style={{
              marginRight: 8,
            }}
            to={`/spaces/${record.id}/edit`}
          >
            {record.name}
          </Link>
        );
      },
    },
    {
      title: 'Site Address',
      dataIndex: 'site_address',
      key: 'site_address',
      width: '20%',
    },
    {
      title: 'Site Title',
      dataIndex: 'site_title',
      key: 'site_title',
      width: '20%',
    },
    {
      title: 'Tag line',
      dataIndex: 'tag_line',
      key: 'tag_line',
      width: '20%',
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      fixed: 'right',
      align: 'center',
      width: 150,
      render: (_, record) => {
        return (
          <span>
            <Popconfirm
              title="Are you sure you want to delete this?"
              onConfirm={() => dispatch(deleteSpace(record.id)).then(() => fetchSpaces())}
            >
              <Button type="danger" icon={<DeleteOutlined />} />
            </Popconfirm>{' '}
            <Button type="primary" onClick={() => handleSpaceReindex(record.id)}>
              Reindex
            </Button>
          </span>
        );
      },
    },
  ];

  return <Table rowKey={'id'} bordered dataSource={spaces} columns={columns} loading={loading} />;
}

export default SpaceList;
