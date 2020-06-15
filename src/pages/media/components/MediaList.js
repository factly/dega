import React from 'react';
import { Popconfirm, Avatar, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getMedia } from '../../../actions/media';
import Table from '../../../components/Table';
import { Link } from 'react-router-dom';

function MediaList() {
  const dispatch = useDispatch();

  const [page, setPage] = React.useState(1);

  const { media, total, loading } = useSelector((state) => {
    if (state.media.total === 0) return { media: [], total: 0, loading: state.media.loading };

    const node = state.media.req.find((item) => {
      return item.query.page === 1;
    });

    if (node)
      return {
        media: node.data.map((element) => state.media.details[element]),
        total: state.media.total,
        loading: state.media.loading,
      };

    return { media: [], total: 0, loading: state.media.loading };
  });

  React.useEffect(() => {
    dispatch(getMedia({ page: 1 }));
  }, [dispatch]);

  const columns = [
    {
      title: 'Display',
      key: 'display',
      render: (_, record) => (
        <Avatar
          style={{ border: '1px solid black', cursor: 'pointer' }}
          shape="square"
          size={174}
          src={record.url}
        />
      ),
      width: '15%',
    },
    {
      title: 'name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'file_size',
      dataIndex: 'file_size',
      key: 'file_size',
      render: (_, record) => record.file_size + ' KB',
    },
    {
      title: 'caption',
      dataIndex: 'caption',
      key: 'caption',
    },
    {
      title: 'description',
      dataIndex: 'description',
      key: 'description',
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
              to={`/media/${record.id}/edit`}
            >
              <Button>Edit</Button>
            </Link>
            <Popconfirm title="Sure to cancel?" onConfirm={() => dispatch(deleteSpace(record.id))}>
              <Button>Delete</Button>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  return <Table data={media} columns={columns} loading={loading} />;
}

export default MediaList;
