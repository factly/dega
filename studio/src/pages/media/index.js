/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react';
import { Space, Button, Row, Col, Form, Input, Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import MediumList from './components/MediumList';
import { getMedia } from '../../actions/media';
import { Link, useLocation, useHistory } from 'react-router-dom';
import deepEqual from 'deep-equal';
import getUrlParams from '../../utils/getUrlParams';

function Media({ permission }) {
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

  React.useEffect(() => {
    fetchMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchMedia = () => {
    dispatch(getMedia(filters));
  };

  return (
    <Space direction="vertical">
      <Row>
        <Col span={8}>
          <Link to="/media/upload">
            <Button disabled={!(actions.includes('admin') || actions.includes('create'))}>
              Upload
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
            style={{ width: '100%', marginBottom: '1rem' }}
            onValuesChange={(changedValues, allValues) => {
              if (!changedValues.q) {
                setFilters({ ...filters, ...changedValues });
              }
            }}
          >
            <Form.Item name="q">
              <Input placeholder="Search media" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit">
                Search
              </Button>
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
      <MediumList
        actions={actions}
        data={{ media: media, total: total, loading: loading }}
        filters={filters}
        setFilters={setFilters}
        fetchMedia={fetchMedia}
      />
    </Space>
  );
}

export default Media;
