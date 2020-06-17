import React from 'react';
import { Popconfirm, Avatar, Button, Table } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getMedia, deleteMedium } from '../../../actions/media';
import { Link } from 'react-router-dom';

function MediaList() {
  const dispatch = useDispatch();

  const [page, setPage] = React.useState(1);

  const { media, total, loading } = useSelector((state) => {
    const node = state.media.req.find((item) => {
      return item.query.page === page;
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
    fetchMedia();
  }, [page]);

  const fetchMedia = () => {
    dispatch(getMedia({ page: page }));
  };

  const columns = [
    {
      title: 'Display',
      key: 'display',
      render: (_, record) => <Avatar shape="square" size={174} src={record.url} />,
      width: '15%',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'File size',
      dataIndex: 'file_size',
      key: 'file_size',
      render: (_, record) => record.file_size + ' KB',
    },
    {
      title: 'Caption',
      dataIndex: 'caption',
      key: 'caption',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Action',
      key: 'operation',
      width: '15%',
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
            <Popconfirm
              title="Sure to cancel?"
              onConfirm={() => dispatch(deleteMedium(record.id)).then(() => fetchMedia())}
            >
              <Button>Delete</Button>
            </Popconfirm>
          </span>
        );
      },
    },
  ];

  return (
    <Table
      bordered
      dataSource={media}
      columns={columns}
      loading={loading}
      rowKey={'id'}
      pagination={{
        total: total,
        current: page,
        pageSize: 5,
        onChange: (page, pageSize) => setPage(page),
      }}
    />
  );
}

export default MediaList;
