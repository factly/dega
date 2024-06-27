/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import ClaimantList from './components/ClaimantList';
import {
  Space,
  Button,
  Form,
  Row,
  Col,
  Select,
  Input,
  Typography,
  Tooltip,
  ConfigProvider,
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const history = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const [searchFieldExpand, setSearchFieldExpand] = React.useState(false);
  const [isMobileScreen, setIsMobileScreen] = React.useState(false);

  const params = getUrlParams(query);
  const [filters, setFilters] = React.useState({
    ...params,
  });

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobileScreen(true);
      } else {
        setIsMobileScreen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pathName = useLocation().pathname;
  useEffect(() => {
    history({
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
          style={{ maxWidth: '100%' }}
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
                  <Typography.Title
                    level={3}
                    style={{ margin: 0, display: 'inline', color: '#1E1E1E' }}
                  >
                    Claimants
                  </Typography.Title>
                </Col>
                <Col>
                  {searchFieldExpand ? (
                    <Row>
                      <Form.Item name="q">
                        <Input placeholder="Search pages" />
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
            <Col span={isMobileScreen ? 24 : 16}>
              <Row justify="end" gutter={16}>
                <Col span={24}>
                  <Row justify="end">
                    <Link to="/claimants/create">
                      <Button
                        disabled={!(actions.includes('admin') || actions.includes('create'))}
                        type="primary"
                        icon={<PlusOutlined />}
                        style={{ marginBottom: 16 }}
                      >
                        Create
                      </Button>
                    </Link>
                  </Row>
                  <Row gutter={16} justify={'end'}>
                    <Col
                      span={isMobileScreen ? 12 : 6}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'end',
                        width: '100%',
                      }}
                    >
                      <label style={{ display: 'inline', marginRight: 8, color: '#00000080' }}>
                        Sort By
                      </label>
                      <Form.Item name="sort">
                        <Select
                          placeholder="Sort By"
                          defaultValue="desc"
                          style={{ width: 'fit-content' }}
                        >
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
