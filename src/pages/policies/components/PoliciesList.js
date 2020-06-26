import React from 'react';
import { Typography, Table } from 'antd';

import { useDispatch, useSelector } from 'react-redux';
import { getPolicies } from '../../../actions/policies';

function PoliciesList() {
  const dispatch = useDispatch();
  const [page, setPage] = React.useState(1);

  const { policies, total, loading } = useSelector((state) => {
    const node = state.policies.req.find((item) => {
      return item.query.page === page;
    });

    if (node)
      return {
        policies: node.data.map((element) => state.policies.details[element]),
        total: state.policies.total,
        loading: state.policies.loading,
      };
    return { policies: [], total: 0, loading: state.policies.loading };
  });

  React.useEffect(() => {
    fetchPolicies();
  }, [page]);

  const fetchPolicies = () => {
    dispatch(getPolicies({ page: page }));
  };

  const columns = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: '50%',
      render: (_, record) => {
        return (
          <Typography.Paragraph ellipsis={{ rows: 2 }}>{record.description}</Typography.Paragraph>
        );
      },
    },
  ];

  return (
    <Table
      bordered
      columns={columns}
      dataSource={policies}
      loading={loading}
      rowKey={'name'}
      pagination={{
        total: total,
        current: page,
        pageSize: 5,
        onChange: (page, pageSize) => setPage(page),
      }}
    />
  );
}

export default PoliciesList;
