import React from 'react';
import { Space, List, Card } from 'antd';
import { Link } from 'react-router-dom';

function MediumList({ data, filters, setFilters }) {
  return (
    <Space direction={'vertical'}>
      <List
        grid={{
          gutter: [32, 22],
          xs: 1,
          sm: 2,
          md: 3,
          lg: 3,
          xl: 4,
          xxl: 5,
        }}
        pagination={data.total > 0 ? {
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`,
          total: data.total,
          current: filters.page,
          pageSize: filters.limit ? filters.limit : 10,
          onChange: (pageNumber, pageSize) => {
            setFilters({ ...filters, page: pageNumber || 1, limit: pageSize });
          },
          pageSizeOptions: ['10', '15', '20'],
        } : false}
        dataSource={data.media}
        renderItem={(item) => (
          <List.Item style={{ borderRadius: '8px', margin: 0 }}>
            <Link to={{ pathname: `/media/${item.id}/edit` }}>
              <Card
                size="default"
                key={item.url}
                hoverable
                bodyStyle={{ padding: 0 }}
                cover={
                  <img
                    alt="ALT"
                    src={
                      `${
                        item.url?.[window.REACT_APP_ENABLE_IMGPROXY ? 'proxy' : 'raw']
                      }?gravity:sm/resize:fill:220:220` || ''
                      // 'https://source.unsplash.com/random/?city,night'

                    }
                    style={{
                      maxWidth: '100%',
                      width: '100%',
                      objectFit: 'cover',
                      height: '250px',
                      objectPosition: 'center center',
                      borderRadius: '8px',
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
