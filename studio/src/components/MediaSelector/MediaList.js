import React from 'react';
import { List, Avatar, Space, Input ,Pagination} from 'antd';
import { CheckCircleTwoTone } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { getMedia } from '../../actions/media';
import deepEqual from 'deep-equal';

function MediaList({ onSelect, selected, onUnselect, profile = false }) {
  const dispatch = useDispatch();

  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 10, // Set default page size
  });

  const { media, total } = useSelector((state) => {
    const node = state.media.req.find((item) => {
      return deepEqual(item.query, filters);
    });

    if (node)
      return {
        media: node.data.map((element) => state.media.details[element]),
        total: node.total,
      };

    return { media: [], total: 0 };
  });

  React.useEffect(() => {
    fetchMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters]);

  const fetchMedia = () => {
    dispatch(getMedia(filters, profile));
  };
  const lastPage = Math.ceil(total / filters.limit);

  return (
    <Space direction={'vertical'}>
      <Input
        placeholder="Search Media"
        onChange={(e) => setFilters({ ...filters, q: e.target.value })}
      />
      <List
        grid={{
          gutter: 16,
          md: 4,
        }}
        dataSource={media}
        renderItem={(item) => (
          <List.Item>
            {selected && item.id === selected.id ? (
              <div style={{ position: 'relative' }}>
                <Avatar
                  onClick={() => {
                    onSelect(null);
                    onUnselect();
                  }}
                  shape="square"
                  size={174}
                  src={item.url?.[window.REACT_APP_ENABLE_IMGPROXY ? 'proxy' : 'raw']}
                  style={{ opacity: '0.7', padding: '0.5rem', border: '2px solid #1890ff' }}
                />
                <CheckCircleTwoTone
                  twoToneColor="#52c41a"
                  style={{ fontSize: '2.5rem', position: 'absolute', top: 8, right: 8 }}
                />
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <Avatar
                  onClick={() => onSelect(item)}
                  shape="square"
                  size={174}
                  src={item.url?.[window.REACT_APP_ENABLE_IMGPROXY ? 'proxy' : 'raw']}
                  style={{ padding: '0.5rem', border: '2px solid transparent' }}
                />
              </div>
            )}
          </List.Item>
        )}
      />
      <Space style={{ display: 'flex', justifyContent: 'left', alignItems: 'center', width: '100%' }}>
        <Pagination
          current={filters.page}
          total={total}
          pageSize={filters.limit}
          showSizeChanger
          pageSizeOptions={['2', '5', '10', '20', '50', '100']}
          onShowSizeChange={(current, size) => {
            setFilters((prevFilters) => ({ ...prevFilters, limit: size, page: 1 })); // Reset to first page when page size changes
          }}
          onChange={(pageNumber) => {
            setFilters((prevFilters) => ({ ...prevFilters, page: pageNumber }));
          }}
          itemRender={(page, type, originalElement) => {
            if (type === 'page') {
              if (page === filters.page) {
                return <span style={{ margin: '0 8px' }}>{page}</span>;
              }
              if (page === 1 || page === lastPage) {
                return <a style={{ margin: '0 8px' }}>{page}</a>;
              }
              if (page === filters.page + 1) {
                return <span style={{ margin: '0 8px' }}>...</span>;
              }
              return null;
            }
            if (type === 'prev') {
              return <a style={{ margin: '0 8px' }}> &lt;</a>;
            }
            if (type === 'next') {
              return <a style={{ margin: '0 8px' }}>&gt;</a>;
            }
            return null;
          }}
        />
      </Space>
    </Space>
  );
}

export default MediaList;
