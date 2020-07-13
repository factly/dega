import React from 'react';
import { Popconfirm, Button, Table } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getClaims, deleteClaim } from '../../../actions/claims';
import { Link } from 'react-router-dom';
import moment from 'moment';
import deepEqual from 'deep-equal';

function ClaimsList() {
  const dispatch = useDispatch();
  const [page, setPage] = React.useState(1);

  const { claims, total, loading } = useSelector(({ claims, claimants, ratings }) => {
    const node = claims.req.find((item) => {
      return deepEqual(item.query, { page });
    });

    if (node) {
      const list = node.data.map((element) => {
        let claim = claims.details[element];
        claim.claimant = claimants.details[claim.claimant_id].name;
        claim.rating = ratings.details[claim.rating_id].name;
        return claim;
      });
      return {
        claims: list,
        total: node.total,
        loading: claims.loading,
      };
    }
    return { claims: [], total: 0, loading: claims.loading };
  });

  React.useEffect(() => {
    fetchClaims();
  }, [page]);

  const fetchClaims = () => {
    dispatch(getClaims({ page: page }));
  };

  const columns = [
    { title: 'Title', dataIndex: 'title', key: 'title', width: '20%' },
    { title: 'Claimant', dataIndex: 'claimant', key: 'claimant', width: '20%' },
    { title: 'Rating', dataIndex: 'rating', key: 'rating', width: '20%' },
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
