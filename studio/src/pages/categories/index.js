import React, { useEffect } from 'react';
import { Space, Button, Form, Input, Select, Row, Col } from 'antd';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import deepEqual from 'deep-equal';
import CategoryList from './components/CategoryList';
import Loader from '../../components/Loader';
import { getCategories } from '../../actions/categories';
import getUrlParams from '../../utils/getUrlParams';

function Categories({ permission }) {
  const { actions } = permission;
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const query = new URLSearchParams(location.search);

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
  }, [pathName, history, filters]);

  const { Option } = Select;
  const [form] = Form.useForm();
  const { categories, total, loading } = useSelector((state) => {
    const node = state.categories.req.find((item) => {
      return deepEqual(item.query, params);
    });

    if (node)
      return {
        categories: node.data.map((element) => state.categories.details[element]),
        total: node.total,
        loading: state.categories.loading,
      };
    return { categories: [], total: 0, loading: state.categories.loading };
  });

  React.useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchCategories = () => {
    dispatch(getCategories(filters));
  };
  return loading ? (
    <Loader />
  ) : (
    <Space direction="vertical">
      <Helmet title={'Categories'} />
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
        style={{ width: '100%' }}
        onValuesChange={(changedValues, allValues) => {
          if (!changedValues.q) {
            setFilters({ ...filters, ...changedValues });
          }
        }}
      >
        <Row justify="end" gutter={16} style={{ marginBottom: '1rem' }}>
          <Col key={2} style={{ display: 'flex', justifyContent: 'end' }}>
            <Form.Item name="q">
              <Input placeholder="Search categories" />
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
            <Link key="1" to="/categories/create">
              <Button
                disabled={!(actions.includes('admin') || actions.includes('create'))}
                type="primary"
              >
                New Category
              </Button>
            </Link>
          </Col>
        </Row>
      </Form>
      <CategoryList
        actions={actions}
        data={{ categories: categories, total: total, loading: loading }}
        filters={filters}
        setFilters={setFilters}
        fetchCategories={fetchCategories}
      />
    </Space>
  );
}

export default Categories;
