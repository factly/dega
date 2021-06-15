import React, { useState } from 'react';
import { Popconfirm, Button, List, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { deletePage } from '../../../actions/pages';
import { Link } from 'react-router-dom';
import ImagePlaceholder from '../../../components/ErrorsAndImage/PlaceholderImage';
import QuickEdit from '../../../components/List/QuickEdit';
import moment from 'moment';

function PageList({ actions, format, status, data, filters, setFilters, fetchPages }) {
  const dispatch = useDispatch();
  const [id, setID] = useState(0);

  const getTagList = (tagids) => {
    return tagids.map((id) => <Tag>{data.tags[id].name}</Tag>);
  };
  const getCategoryList = (catIds) => {
    return catIds.map((id) => <Tag>{data.categories[id].name}</Tag>);
  };

  return (
    <Space direction="vertical">
      <List
        bordered
        className="post-list"
        loading={data.loading}
        itemLayout="vertical"
        dataSource={data.pages}
        pagination={{
          total: data.total,
          current: filters.page,
          pageSize: filters.limit,
          onChange: (pageNumber, pageSize) =>
            setFilters({ ...filters, page: pageNumber, limit: pageSize }),
        }}
        renderItem={(item) => (
          <List.Item
            actions={
              item.id !== id
                ? [
                    <Link
                      style={{
                        marginRight: 8,
                      }}
                      to={`/pages/${item.id}/edit`}
                    >
                      <Button
                        icon={<EditOutlined />}
                        disabled={!(actions.includes('admin') || actions.includes('update'))}
                      >
                        Edit
                      </Button>
                    </Link>,
                    <Popconfirm
                      title="Sure to Delete?"
                      onConfirm={() => dispatch(deletePage(item.id)).then(() => fetchPages())}
                      disabled={!(actions.includes('admin') || actions.includes('delete'))}
                    >
                      <Button
                        icon={<DeleteOutlined />}
                        disabled={!(actions.includes('admin') || actions.includes('delete'))}
                      >
                        Delete
                      </Button>
                    </Popconfirm>,
                    <Button
                      icon={<EditOutlined />}
                      disabled={!(actions.includes('admin') || actions.includes('update'))}
                      onClick={() => setID(item.id)}
                    >
                      Quick Edit
                    </Button>,
                    item.status === 'publish' ? (
                      <Button style={{ border: 'solid 1px', color: 'green', width: '140px' }}>
                        Published
                      </Button>
                    ) : item.status === 'draft' ? (
                      <Button style={{ border: 'solid 1px', color: 'red', width: '140px' }}>
                        Draft
                      </Button>
                    ) : item.status === 'ready' ? (
                      <Button style={{ border: 'solid 1px', color: 'gold', width: '140px' }}>
                        Ready to Publish
                      </Button>
                    ) : null,
                  ]
                : []
            }
            extra={
              item.id !== id ? (
                item.medium ? (
                  <img
                    style={{ width: '150', height: '150' }}
                    alt={item.medium.alt_text}
                    src={
                      item.medium.url?.proxy
                        ? `${item.medium.url.proxy}?resize:fill:150:150/gravity:sm`
                        : ''
                    }
                  />
                ) : (
                  <ImagePlaceholder height={150} width={150} />
                )
              ) : null
            }
          >
            {item.id !== id ? (
              <List.Item.Meta
                title={<Link to={`/pages/${item.id}/edit`}>{item.title}</Link>}
                description={item.excerpt}
              />
            ) : null}
            {item.id === id ? (
              <QuickEdit data={item} setID={setID} slug={format.slug} page={true} />
            ) : null}
            {item.id !== id ? (
              <Space direction="vertical">
                {item.published_date ? (
                  <div>Published Date: {moment(item.published_date).format('MMMM Do YYYY')}</div>
                ) : null}
                {item.tags && item.tags.length > 0 ? (
                  <div>Tags: {getTagList(item.tags)}</div>
                ) : null}

                {item.categories && item.categories.length > 0 ? (
                  <div>Categories: {getCategoryList(item.categories)}</div>
                ) : null}
              </Space>
            ) : null}
          </List.Item>
        )}
      />
    </Space>
  );
}

export default PageList;
