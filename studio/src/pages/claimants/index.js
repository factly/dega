/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import ClaimantList from './components/ClaimantList';
import { Space, Button, Form, Row, Col, Select, Input } from 'antd';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getClaimants } from '../../actions/claimants';
import deepEqual from 'deep-equal';
import getUrlParams from '../../utils/getUrlParams';
import Loader from '../../components/Loader';
import { Helmet } from 'react-helmet';
import Filters from '../../utils/filters';

function Claimants({ permission }) {
  const { actions } = permission;
  const dispatch = useDispatch();
  const history = useHistory();
  const query = new URLSearchParams(useLocation().search);

  const params = getUrlParams(query);
  const [filters, setFilters] = React.useState({
    ...params,
  });

  const pathName = useLocation().pathname;

  useEffect(() => {
    history.push({
      pathname: pathName,
      search: new URLSearchParams(filters).toString(),
    });
  }, [history, filters]);
  const [form] = Form.useForm();
  const { Option } = Select;

  const { claimants, total, loading } = useSelector((state) => {
    const node = state.claimants.req.find((item) => {
      return deepEqual(item.query, params);
    });

    if (node)
      return {
        claimants: node.data.map((element) => state.claimants.details[element]),
        total: node.total,
        loading: state.claimants.loading,
      };
    return { claimants: [], total: 0, loading: state.claimants.loading };
  });
  useEffect(() => {
    if (form) form.setFieldsValue(new Filters(params));
  }, [params]);
  React.useEffect(() => {
    fetchClaimants();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchClaimants = () => {
    dispatch(getClaimants(filters));
  };
  return loading ? (
    <Loader />
  ) : (
    <Space direction="vertical">
      <Helmet title={'Claimants'} />
      <Form
        initialValues={filters}
        form={form}
        name="filters"
        onFinish={(values) => {
          let filterValue = {};
          Object.keys(values).forEach(function (key) {
            if (values[key]) {
              filterValue[key] = values[key];
            }
          });
          setFilters({
            ...filters,
            ...filterValue,
          });
        }}
        style={{ maxWidth: '100%' }}
        onValuesChange={(changedValues, allValues) => {
          if (!changedValues.q) {
            setFilters({ ...filters, ...changedValues });
          }
        }}
      >
        <Row justify="end" gutter={16}>
          <Col style={{ display: 'flex', justifyContent: 'end' }}>
            <Form.Item name="q">
              <Input placeholder="Search claimant" />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit">Search</Button>
            </Form.Item>
          </Col>
          <Col>
            <Form.Item name="sort">
              <Select defaultValue="desc">
                <Option value="desc">Sort By: Latest</Option>
                <Option value="asc">Sort By: Old</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col>
            <Link to="/claimants/create">
              <Button
                disabled={!(actions.includes('admin') || actions.includes('create'))}
                type="primary"
              >
                New Claimant
              </Button>
            </Link>
          </Col>
        </Row>
      </Form>

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
