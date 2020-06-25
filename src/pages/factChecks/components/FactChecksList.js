import React from 'react';
import { Popconfirm, Button, List } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getFactChecks, deleteFactCheck } from '../../../actions/factChecks';
import { Link } from 'react-router-dom';

function FactChecksList() {
  const dispatch = useDispatch();

  const [page, setPage] = React.useState(1);

  const { factChecks, total, loading } = useSelector((state) => {
    const node = state.factChecks.req.find((item) => {
      return item.query.page === page;
    });

    if (node)
      return {
        factChecks: node.data.map((element) => state.factChecks.details[element]),
        total: state.factChecks.total,
        loading: state.factChecks.loading,
      };
    return { factChecks: [], total: 0, loading: state.factChecks.loading };
  });

  React.useEffect(() => {
    fetchFactChecks();
  }, [page]);

  const fetchFactChecks = () => {
    dispatch(getFactChecks({ page: page }));
  };

  return (
    <List
      bordered
      className="fact-check-list"
      loading={loading}
      itemLayout="vertical"
      dataSource={factChecks}
      pagination={{
        total: total,
        current: page,
        pageSize: 5,
        onChange: (page, pageSize) => setPage(page),
      }}
      renderItem={(item) => (
        <List.Item
          actions={[
            <Link
              style={{
                marginRight: 8,
              }}
              to={`/fact-checks/${item.id}/edit`}
            >
              <Button icon={<EditOutlined />}>Edit</Button>
            </Link>,
            <Popconfirm
              title="Sure to cancel?"
              onConfirm={() => dispatch(deleteFactCheck(item.id)).then(() => fetchFactChecks())}
            >
              <Button icon={<DeleteOutlined />}>Delete</Button>
            </Popconfirm>,
          ]}
          extra={item.medium ? <img width={272} alt={item.alt_text} src={item.medium.url} /> : null}
        >
          <List.Item.Meta
            title={<Link to={`/fact-checks/${item.id}/edit`}>{item.title}</Link>}
            description={item.excerpt}
          />
        </List.Item>
      )}
    />
  );
}

export default FactChecksList;
