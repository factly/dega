import React from 'react';
import { Popconfirm, Button, Table } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getClaims, deleteClaim } from '../../../actions/claims';
import { Link } from 'react-router-dom';
import moment from 'moment';

function ClaimsList() {
  const dispatch = useDispatch();
  const [page, setPage] = React.useState(1);

  const { claims, total, loading } = useSelector((state) => {
    const node = state.claims.req.find((item) => {
      return item.query.page === page;
    });

    if (node)
      return {
        claims: node.data.map((element) => state.claims.details[element]),
        total: state.claims.total,
        loading: state.claims.loading,
      };
    return { claims: [], total: 0, loading: state.claims.loading };
  });

  React.useEffect(() => {
    fetchClaims();
  }, [page]);

  const fetchClaims = () => {
    dispatch(getClaims({ page: page }));
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title', width: '15%' },
    { title: 'Slug', dataIndex: 'slug', key: 'slug', width: '15%' },
    {
      title: 'Claim Date',
      dataIndex: 'claim_date',
      width: '20%',
      render: (_, record) => {
        return (
          <span title={record.claim_date}>{moment(record.claim_date).format('MMMM Do YYYY')}</span>
        );
      },
    },
    {
      title: 'Checked Date',
      dataIndex: 'checked_date',
      width: '20%',
      render: (_, record) => {
        return (
          <span title={record.checked_date}>
            {moment(record.checked_date).format('MMMM Do YYYY')}
          </span>
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      render: (_, record) => {
        return (
          <span>
            <Link
              className="ant-dropdown-link"
              style={{
                marginRight: 8,
              }}
              to={`/claims/${record.id}/edit`}
            >
              <Button>Edit</Button>
            </Link>
            <Popconfirm
              title="Sure to cancel?"
              onConfirm={() => dispatch(deleteClaim(record.id)).then(() => fetchClaims())}
            >
              <Link to="" className="ant-dropdown-link">
                <Button>Delete</Button>
              </Link>
            </Popconfirm>
          </span>
        );
      },
      width: '20%',
    },
  ];

  return (
    <Table
      bordered
      columns={columns}
      dataSource={claims}
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

export default ClaimsList;
