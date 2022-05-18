import React from 'react';
import { Space, List, Card } from 'antd';
import { Link } from 'react-router-dom';

function MediumList({ data, filters, setFilters, fetchMedia }) {
  return (
    <Space direction={'vertical'}>
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
          total: data.total,
          current: filters.page,
          pageSize: filters.limit ? filters.limit : 10,
          onChange: (pageNumber, pageSize) => 
            setFilters({ ...filters, page: pageNumber ? pageNumber : 1, limit: pageSize })
        }}
        dataSource={data.media}
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
                      objectFit: 'cover',
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
