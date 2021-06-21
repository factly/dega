import React from 'react';
import ClaimantList from './components/ClaimantList';
import { Space, Button, Form, Row, Col, Select, Input } from 'antd';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getClaimants } from '../../actions/claimants';
import deepEqual from 'deep-equal';

function Claimants({ permission }) {
  const { actions } = permission;
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });
  const [form] = Form.useForm();
  const { Option } = Select;

  const { claimants, total, loading } = useSelector((state) => {
    const node = state.claimants.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        claimants: node.data.map((element) => state.claimants.details[element]),
        total: node.total,
        loading: state.claimants.loading,
      };
    return { claimants: [], total: 0, loading: state.claimants.loading };
  });

  React.useEffect(() => {
    fetchClaimants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchClaimants = () => {
    dispatch(getClaimants(filters));
  };
  return (
    <Space direction="vertical">
      <Row>
        <Col span={8}>
          <Link to="/claimants/create">
            <Button disabled={!(actions.includes('admin') || actions.includes('create'))}>
              Create New
            </Button>
          </Link>
        </Col>
        <Col span={8} offset={8}>
          <Form
            initialValues={filters}
            form={form}
            name="filters"
            layout="inline"
            onFinish={(values) =>
              setFilters({
                ...filters,
                sort_by: values.sort,
                q: values.q,
              })
            }
            style={{ maxWidth: '100%' }}
            onValuesChange={(changedValues, allValues) => {
              if (!changedValues.q) {
                setFilters({ ...filters, ...changedValues });
              }
            }}
          >
            <Form.Item name="q">
              <Input placeholder="Search claimant" />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit">Search</Button>
            </Form.Item>
            <Form.Item name="sort" label="Sort" style={{ width: '30%' }}>
              <Select>
                <Option value="desc">Latest</Option>
                <Option value="asc">Old</Option>
              </Select>
            </Form.Item>
          </Form>
        </Col>
      </Row>
      <ClaimantList
        actions={actions}
        data={{ claimants: claimants, total: total, loading: loading }}
        filters={filters}
        setFilters={setFilters}
        fetchClaimants={fetchClaimants}
      />
    </Space>
  );
}

export default Claimants;
