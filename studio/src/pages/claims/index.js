/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import {
  Space,
  Button,
  Row,
  Col,
  Form,
  Input,
  Select,
  Typography,
  Tooltip,
  ConfigProvider,
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { Link, useLocation, useHistory } from 'react-router-dom';
import ClaimList from './components/ClaimList';
import { useDispatch, useSelector } from 'react-redux';
import deepEqual from 'deep-equal';
import Selector from '../../components/Selector';
import { getClaims } from '../../actions/claims';
import getUrlParams from '../../utils/getUrlParams';
import Loader from '../../components/Loader';
import { Helmet } from 'react-helmet';
import Filters from '../../utils/filters';

const { Option } = Select;

function Claims({ permission }) {
  const { actions } = permission;
  const dispatch = useDispatch();
  const { search } = useLocation();
  const history = useHistory();
  const query = new URLSearchParams(search);
  const [searchFieldExpand, setSearchFieldExpand] = React.useState(false);
  const [isMobileScreen, setIsMobileScreen] = React.useState(false);

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

  const keys = ['page', 'limit', 'q', 'sort', 'rating', 'claimant'];
  const params = getUrlParams(query, keys);

  const [form] = Form.useForm();

  useEffect(() => {
    if (form) form.setFieldsValue(new Filters(params));
  }, [search]);

  useEffect(() => {
    fetchClaims();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);
  const fetchClaims = () => {
    dispatch(getClaims(params));
  };

  const { claims, total, loading } = useSelector((state) => {
    const node = state.claims.req.find((item) => {
      return deepEqual(item.query, params);
    });

    if (node) {
      const list = node.data.map((element) => {
        let claim = state.claims.details[element];
        claim.claimant = state.claimants.details[claim.claimant_id].name;
        claim.rating = state.ratings.details[claim.rating_id].name;
        return claim;
      });
      return {
        claims: list,
        total: node.total,
        loading: state.claims.loading,
      };
    }
    return { claims: [], total: 0, loading: state.claims.loading };
  });

  const onSave = (values) => {
    let searchFilter = new URLSearchParams();
    Object.keys(values).forEach(function (key) {
      if (values[key]) {
        if (key === 'rating' || key === 'claimant') {
          values[key].map((each) => {
            return searchFilter.append(key, each);
          });
        } else {
          searchFilter.set(key, values[key]);
        }
      }
    });

    history.push({
      pathName: '/claims',
      search: '?' + searchFilter.toString(),
    });
  };

  const onPagination = (page, limit) => {
    query.set('limit', limit);
    query.set('page', page);
    history.push({
      pathName: '/claims',
      search: '?' + query.toString(),
    });
  };

  return loading ? (
    <Loader />
  ) : (
    <Space direction="vertical">
      <Helmet title={'Claims'} />
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
          initialValues={params}
          form={form}
          name="filters"
          onFinish={(values) => onSave(values)}
          style={{ maxWidth: '100%' }}
          onValuesChange={(changedValues, allValues) => {
            if (!changedValues.q) {
              onSave(allValues);
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
                    Claims
                  </Typography.Title>
                </Col>
                <Col>
                  {searchFieldExpand ? (
                    <Row gutter={[8,16]}>
                      <Col>
                        <Form.Item name="q">
                          <Input placeholder="Search claims" />
                          {/**/}
                        </Form.Item>
                      </Col>
                      <Col>
                        <Form.Item>
                          <Button htmlType="submit" icon={<SearchOutlined />}>
                            Search
                          </Button>
                        </Form.Item>
                      </Col>
                    </Row>
                  ) : (
                    <Tooltip title="search">
                      <Button
                        shape="circle"
                        type="text"
                        onClick={() => {
                          setSearchFieldExpand(true);
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
                    <Link to="/claims/create">
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
                  <Row gutter={[16, 12]} justify={isMobileScreen ? 'space-between' : 'end'}>
                    <Col span={isMobileScreen ? 24 : 8}>
                      <Form.Item name="claimant" label="Claimants">
                        <Selector mode="multiple" action="Claimants" />
                      </Form.Item>
                    </Col>
                    <Col span={isMobileScreen ? 24 : 8}>
                      <Form.Item name="rating" label="Ratings">
                        <Selector mode="multiple" action="Ratings" />
                      </Form.Item>
                    </Col>

                    <Col span={isMobileScreen ? 12 : 6}>
                      <Form.Item label="Sort By" name="sort">
                        <Select placeholder="Sort By" defaultValue="desc" style={{ width: '90%' }}>
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
      <ClaimList
        actions={actions}
        data={{ claims: claims, total: total, loading: loading }}
        filters={params}
        fetchClaims={fetchClaims}
        onPagination={onPagination}
      />
    </Space>
  );
}

export default Claims;
