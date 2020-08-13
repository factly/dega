import React from 'react';
import { List, Avatar, Badge, Space, Input } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getMedia } from '../../actions/media';

function MediaList({ onSelect, selected }) {
  const dispatch = useDispatch();

  const [page, setPage] = React.useState(1);

  const { media, total } = useSelector((state) => {
    const node = state.media.req.find((item) => {
      return item.query.page === page;
    });

    if (node)
      return {
        media: node.data.map((element) => state.media.details[element]),
        total: state.media.total,
      };

    return { media: [], total: 0 };
  });

  React.useEffect(() => {
    dispatch(getMedia({ page: page }));
  }, [dispatch, page]);

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
          pageSize: 5,
        }}
        dataSource={media}
        renderItem={(item) => (
          <List.Item>
            {selected && item.id === selected.id ? (
              <Badge dot>
                <Avatar onClick={() => onSelect(null)} shape="square" size={174} src={item.url} />
              </Badge>
            ) : (
              <Avatar onClick={() => onSelect(item)} shape="square" size={174} src={item.url} />
            )}
          </List.Item>
        )}
      />
    </Space>
  );
}

export default MediaList;
