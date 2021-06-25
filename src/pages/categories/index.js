import React from 'react';
import CategoryList from './components/CategoryList';
import { Space, Button, Form, Input, Select, Row, Col } from 'antd';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCategories } from '../../actions/categories';
import deepEqual from 'deep-equal';

function Categories({ permission }) {
  const { actions } = permission;
  const dispatch = useDispatch();
  const location = useLocation();
  const history = useHistory();
  const query = new URLSearchParams(location.search);
  const [filters, setFilters] = React.useState({
    page: query.get('page') ? query.get('page') : 1,
    limit: 20,
    sort: query.get('sort'),
    q: query.get('q'),
  });
  React.useEffect(() => {
    if (history.action === 'POP') {
      //window.location.reload(false);
      //  setFilters({
      //         page: query.get('page'),
      //         limit: 10,
      //         sort: query.get('sort'),
      //         q: query.get('q'),
      //       });
      console.log('------pop------');
    }
  }, [location.search]);

  console.log('location', location, 'pageNo', query.get('page'), 'filter page', filters);
  Object.keys(filters).forEach(function (key) {
    if (filters[key] && key !== 'limit') query.set(key, filters[key]);
  });
  React.useEffect(() => {
    history.push({
      pathname: location.pathname,
      search: '?' + query.toString(),
    });
  }, [filters]);

  //window.history.pushState({}, '', `${window.PUBLIC_URL}${useLocation().pathname}?${query}`);
  //window.history.replaceState({}, '', `${window.PUBLIC_URL}${useLocation().pathname}?${query}`);
  const { Option } = Select;
  const [form] = Form.useForm();
  const { categories, total, loading } = useSelector((state) => {
    const node = state.categories.req.find((item) => {
      return deepEqual(item.query, filters);
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
            onFinish={(values) => setFilters({ ...filters, ...values })}
            style={{ width: '100%' }}
            onValuesChange={(changedValues, allValues) => {
              let changedKey = Object.keys(changedValues)[0];
              query.set(changedKey, changedValues[changedKey]);
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
