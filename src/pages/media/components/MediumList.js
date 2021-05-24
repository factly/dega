import React from 'react';
import { Button, Space, Form, Input, Select, List, Card } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getMedia } from '../../../actions/media';
import { Link } from 'react-router-dom';
import deepEqual from 'deep-equal';

function MediumList() {
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 20,
  });
  const [form] = Form.useForm();
  const { Option } = Select;

  const { media, total, loading } = useSelector((state) => {
    const node = state.media.req.find((item) => {
      return deepEqual(item.query, filters);
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
    <Space direction={'vertical'}>
      <Form
        initialValues={filters}
        form={form}
        name="filters"
        layout="inline"
        onFinish={(values) =>
          setFilters({
            ...filters,
            ...values,
          })
        }
        style={{ maxWidth: '100%', marginBottom: '1rem' }}
      >
        <Form.Item name="q" label="Search" style={{ width: '25%' }}>
          <Input placeholder="search media" />
        </Form.Item>
        <Form.Item name="sort" label="Sort" style={{ width: '15%' }}>
          <Select>
            <Option value="desc">Latest</Option>
            <Option value="asc">Old</Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form.Item>
      </Form>
      <List
        grid={{
          gutter: 16,
          xs: 1,
          sm: 2,
          md: 3,
          lg: 3,
          xl: 4,
          xxl: 5,
        }}
        pagination={{
          total: total,
          current: filters.page,
          pageSize: filters.limit,
          onChange: (pageNumber, pageSize) =>
            setFilters({ ...filters, page: pageNumber, limit: pageSize }),
        }}
        dataSource={media}
        renderItem={(item) => (
          <List.Item>
            <Link
              style={{
                marginRight: 8,
              }}
              to={{ pathname: `/media/${item.id}/edit` }}
            >
              <Card
                size="default"
                key={item.url}
                // title={item.name}
                hoverable
                bodyStyle={{ padding: 0 }}
                cover={
                  <img
                    alt="ALT"
                    src={item.url?.proxy ? `${item.url.proxy}?gravity:sm/resize:fit:220:220` : ''}
                    style={{
                      maxWidth: '100%',
                      width: '100%',
                      objectFit: 'contain',
                      height: '220px',
                      objectPosition: 'center center',
                    }}
                    title={item.name}
                  />
                }
              />
            </Link>
          </List.Item>
        )}
      />
    </Space>
  );
}

export default MediumList;
