import React, { useEffect } from 'react';
import CategoryList from './components/CategoryList';
import { Space, Button, Form, Input, Select, Row, Col } from 'antd';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCategories } from '../../actions/categories';
import deepEqual from 'deep-equal';
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
  return (
    <Space direction="vertical">
      <Row>
        <Col span={8}>
          <Link key="1" to="/categories/create">
            <Button
              disabled={!(actions.includes('admin') || actions.includes('create'))}
              type="primary"
            >
              New Category
            </Button>
          </Link>
        </Col>
        <Col span={8} offset={8}>
          <Form
            initialValues={filters}
            form={form}
            name="filters"
            layout="inline"
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
            <Form.Item name="q">
              <Input placeholder="Search categories" />
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
