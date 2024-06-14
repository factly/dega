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
  ConfigProvider,
  Typography,
  Tooltip,
} from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import MediumList from './components/MediumList';
import { getMedia } from '../../actions/media';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import deepEqual from 'deep-equal';
import getUrlParams from '../../utils/getUrlParams';
import Loader from '../../components/Loader';
import { Helmet } from 'react-helmet';
import Filters from '../../utils/filters';

function Media({ permission }) {
  const { actions } = permission;
  const dispatch = useDispatch();
  const history = useNavigate();
  const query = new URLSearchParams(useLocation().search);
  const params = getUrlParams(query);
  const [filters, setFilters] = React.useState({
    ...params,
  });
  const [searchFieldExpand, setSearchFieldExpand] = React.useState(false);

  const pathName = useLocation().pathname;

  useEffect(() => {
    history({
      pathname: pathName,
      search: new URLSearchParams(filters).toString(),
    });
  }, [history, filters]);

  const [form] = Form.useForm();
  const { Option } = Select;

  const { media, total, loading } = useSelector((state) => {
    const node = state.media.req.find((item) => {
      return deepEqual(item.query, params);
    });

    if (node)
      return {
        media: node.data.map((element) => state.media.details[element]),
        total: node.total,
        loading: state.media.loading,
      };
    return { media: [], total: 0, loading: state.media.loading };
  });
  useEffect(() => {
    if (form) form.setFieldsValue(new Filters(params));
  }, [params]);
  React.useEffect(() => {
    fetchMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchMedia = () => {
    dispatch(getMedia(filters));
  };

  return loading ? (
    <Loader />
  ) : (
    <Space direction="vertical">
      <Helmet title={'Media'} />
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
          style={{ width: '100%', marginBottom: '1rem' }}
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
                    Media
                  </Typography.Title>
                </Col>
                <Col>
                  {searchFieldExpand ? (
                    <Row gutter={8}>
                      <Col>
                        <Form.Item name="q">
                          <Input placeholder="Search media" />
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
            <Col>
              <Row justify="end" gutter={16}>
                <Col>
                  <Row justify="end">
                    <Link to="/media/upload">
                      <Button
                        disabled={!(actions.includes('admin') || actions.includes('create'))}
                        type="primary"
                        style={{ margin: isMobileScreen ? '16px 0' : '0 0 16px 0' }}
                      >
                        Upload
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
      <MediumList
        actions={actions}
        data={{ media: media, total: total, loading: loading }}
        filters={filters}
        setFilters={setFilters}
      />
    </Space>
  );
}

export default Media;
