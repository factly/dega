import React from 'react';
import { Popconfirm, Button, Table } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { deleteSpace, getSpaces } from './../../../actions/spaces';

function SpaceList() {
  const dispatch = useDispatch();
  const { spaces, loading } = useSelector((state) => {
    const selectedOrg = state.spaces.orgs.find((item) =>
      item.spaces.includes(state.spaces.selected),
    );
    let spaces = [];
    if (selectedOrg) {
      spaces = selectedOrg.spaces.map((s) => state.spaces.details[s]);
    }
    return {
      loading: state.spaces.loading,
      spaces: spaces,
    };
  });

  const fetchSpaces = () => {
    dispatch(getSpaces());
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '20%',
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
      render: (_, record) => {
        return (
          <span>
            <Link
              style={{
                marginRight: 8,
              }}
              to={`/spaces/${record.id}/edit`}
            >
              <Button>Edit</Button>
            </Link>
            <Popconfirm
              title="Sure to cancel?"
              onConfirm={() => dispatch(deleteSpace(record.id)).then(() => fetchSpaces())}
            >
              <Button>Delete</Button>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  return <Table rowKey={'id'} bordered dataSource={spaces} columns={columns} loading={loading} />;
}

export default SpaceList;
