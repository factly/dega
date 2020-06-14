import React from 'react';
import { List, Avatar, Badge, Space, Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getMedia } from '../../actions/media';

function MediaList({ onSelect, selected }) {
  const dispatch = useDispatch();

  const [page, setPage] = React.useState(1);

  const { media, total } = useSelector((state) => {
    if (state.media.total === 0) return { media: [], total: 0 };

    const node = state.media.req.find((item) => {
      return item.query.page === 1;
    });

    if (node)
      return {
        media: node.data.map((element) => state.media.details[element]),
        total: state.media.total,
      };

    return { media: [], total: 0 };
  });

  React.useEffect(() => {
    dispatch(getMedia({ page: 1 }));
  }, [dispatch]);

  return (
    <Space direction={'vertical'}>
      <Input placeholder="Basic usage" />
      <List
        grid={{
          gutter: 16,
          md: 4,
        }}
        pagination={{
          current: page,
          onChange: (page) => {
            setPage(page);
          },
          total: total,
          pageSize: 12,
        }}
        dataSource={media}
        renderItem={(item) => (
          <List.Item>
            {selected && item.id === selected.id ? (
              <Badge dot>
                <Avatar
                  style={{ border: '1px solid black', cursor: 'pointer' }}
                  onClick={() => onSelect(null)}
                  shape="square"
                  size={174}
                  src={item.url}
                />
              </Badge>
            ) : (
              <Avatar
                style={{ border: '1px solid black', cursor: 'pointer' }}
                onClick={() => onSelect(item)}
                shape="square"
                size={174}
                src={item.url}
              />
            )}
          </List.Item>
        )}
      />
    </Space>
  );
}

export default MediaList;
