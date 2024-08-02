import React, {useState ,useEffect } from 'react';
import dayjs from 'dayjs';  
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
  DatePicker,
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


  const monthFormat = 'YYYY-MM';
  const [date, setDate] = useState(new Date());


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
    if (form) {
      const initialFilters = new Filters(params);
      form.setFieldsValue(initialFilters);
    }
  }, [params, form]);

  React.useEffect(() => {
    fetchMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchMedia = () => {
    dispatch(getMedia(filters));
  };

  const onDateChange = (date, dateString) => {
    const updatedFilters = {
      ...filters,
      date: dateString,
    };
    setFilters(updatedFilters);
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
          initialValues={{ ...filters, date }}
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

            console.log(allValues);
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
                    <Row>
                      <Form.Item name="q">
                        <Input placeholder="Search media" />
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
                        type="text"
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
                    <Link to="/media/upload">
                      <Button
                        disabled={!(actions.includes('admin') || actions.includes('create'))}
                        type="primary"
                        style={{ marginBottom: '1rem' }}
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
                    <Col>
                      <Row>
                        <Form.Item name="date" label="Filter by Date">
                          <DatePicker
                            onChange={onDateChange}
                            defaultValue={dayjs('2015/01', monthFormat)} format={monthFormat} picker="month"
                          />
                        </Form.Item>
                      </Row>
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
