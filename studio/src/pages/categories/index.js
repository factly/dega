import React, { useEffect } from 'react';
import {
  Space,
  Button,
  Form,
  Input,
  Select,
  Row,
  Col,
  ConfigProvider,
  Typography,
  Tooltip,
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, useLocation, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet';
import deepEqual from 'deep-equal';
import CategoryList from './components/CategoryList';
import Loader from '../../components/Loader';
import { getCategories } from '../../actions/categories';
import getUrlParams from '../../utils/getUrlParams';
import Filters from '../../utils/filters';

function Categories({ permission }) {
  const { actions } = permission;
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchFieldExpand, setSearchFieldExpand] = React.useState(false);
  const history = useHistory();
  const query = new URLSearchParams(location.search);
  const params = getUrlParams(query);
  const [filters, setFilters] = React.useState({
    ...params,
  });
  const pathName = useLocation().pathname;
  useEffect(() => {
    if (form) form.setFieldsValue(new Filters(params));
  }, [params]);
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
      <ConfigProvider
        theme={{
          components: {
            Form: {
              marginLG: 0,
            },
          },
        }}
      >
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
              if (changedValues.q === '') {
                const { q, ...filtersWithoutQuery } = filters;
                setFilters({ ...filtersWithoutQuery });
                return;
              }
              setFilters({ ...filters, ...changedValues });
            }
          }}
        >
          <Row justify="space-between" gutter={16}>
            <Col>
              <Row gutter={16}>
                <Col>
                  <Typography.Title level={3} style={{ margin: 0, display: 'inline' }}>
                    Categories
                  </Typography.Title>
                </Col>
                <Col>
                  {searchFieldExpand ? (
                    <Row>
                      <Form.Item name="q">
                        <Input placeholder="Search categories" />
                      </Form.Item>
                      <Form.Item>
                        <Button htmlType="submit" icon={<SearchOutlined />}>
                          Search
                        </Button>
                      </Form.Item>
                    </Row>
                  ) : (
                    <Tooltip title="search">
                      <Button
                        shape="circle"
                        style={{ border: 'none' }}
                        onFocus={() => {
                          setSearchFieldExpand(true);
                          setTimeout(() => {
                            form.getFieldsValue().q === undefined && setSearchFieldExpand(false);
                          }, 10000);
                        }}
                        icon={<SearchOutlined />}
                      />
                    </Tooltip>
                  )}
                </Col>
              </Row>
            </Col>
            <Col>
              <Row justify="end" gutter={16}>
                <Col>
                  <Row justify="end">
                    <Link to="/categories/create">
                      <Button
                        disabled={!(actions.includes('admin') || actions.includes('create'))}
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{ marginBottom: '1.5rem' }}
                      >
                        Create
                      </Button>
                    </Link>
                  </Row>
                  <Row gutter={16}>
                    <Col>
                      <Form.Item label="Sort By" name="sort">
                        <Select placeholder="Sort By" defaultValue="desc" style={{ width: '100%' }}>
                          <Option value="desc" key={'desc'}>
                            Latest
                          </Option>
                          <Option value="asc" key={'asc'}>
                            Old
                          </Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                </Col>
              </Row>
            </Col>
          </Row>
        </Form>
      </ConfigProvider>
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
