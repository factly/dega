import React, { useState } from 'react';
import { Popconfirm, Button, Space, Tag, Table } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExceptionOutlined,
  CloseOutlined,
  FormOutlined,
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { deletePost } from '../../actions/posts';
import { Link } from 'react-router-dom';
import QuickEdit from './QuickEdit';

function PostList({ actions, format, filters, onPagination, data, fetchPosts }) {
  /**
   * TODO: Add Authors detail on table
   */
  const dispatch = useDispatch();
  const [id, setID] = useState(0);
  const [expandedRowKeys, setExpandedRowKeys] = useState([0]);

  const getTagList = (tagids) => {
    return tagids?.map((id) => (
      <Link
        to={
          format.slug === 'article'
            ? `/posts?tag=${id}&format=${format.id}`
            : `/fact-checks?tag=${id}&format=${format.id}`
        }
      >
        <Tag key={id}>{data.tags[id].name}</Tag>
      </Link>
    ));
  };
  const getCategoryList = (catIds) => {
    return catIds?.map((id) => (
      <Link
        to={
          format.slug === 'article'
            ? `/posts?category=${id}&format=${format.id}`
            : `/fact-checks?category=${id}&format=${format.id}`
        }
      >
        <Tag key={id}>{data.categories[id].name}</Tag>
      </Link>
    ));
  };
  // const getAuthorsList = (ids) => {
  //   return ids?.map((id) => <span>{data.authors[id].display_name}</span>);
  // };
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 400,
      render: (_, item) => (
        <Link
          to={format.slug === 'article' ? `/posts/${item.id}/edit` : `/fact-checks/${item.id}/edit`}
        >
          <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>{item.title}</p>
          {/*
          {item.published_date && (
            <p style={{ color: 'CaptionText' }}>
              Published on {dayjs(item.published_date).format('MMMM Do YYYY')}
            </p>
          )}
          <p style={{ color: 'CaptionText' }}>by {getAuthorsList(item.authors)}</p> 
          */}
        </Link>
      ),
    },
    {
      title: 'Categories',
      dataIndex: 'categories',
      key: 'categories',
      ellipsis: true,
      render: (item) => {
        return item.length > 0 ? getCategoryList(item) : null;
      },
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      ellipsis: true,
      render: (item) => {
        return getTagList(item);
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 200,
      render: (status) => {
        return status === 'publish' ? (
          <Tag icon={<CheckCircleOutlined />} color="green">
            Published
          </Tag>
        ) : status === 'draft' ? (
          <Tag color="red" icon={<ExceptionOutlined />}>
            Draft
          </Tag>
        ) : status === 'ready' ? (
          <Tag color="gold" icon={<ClockCircleOutlined />}>
            Ready to Publish
          </Tag>
        ) : null;
      },
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      fixed: 'right',
      align: 'center',
      width: 240,
      render: (_, item, idx) => {
        const isOpen = item.id === expandedRowKeys[0];
        return (
          <>
            <div style={{ display: 'flex' }}>
              <Link
                style={{ display: 'block' }}
                to={
                  format.slug === 'article'
                    ? `/posts/${item.id}/edit`
                    : `/fact-checks/${item.id}/edit`
                }
              >
                <Button
                  icon={<EditOutlined />}
                  disabled={!(actions.includes('admin') || actions.includes('update'))}
                  style={{
                    margin: '0.5rem',
                    padding: '4px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                />
              </Link>
              <Button
                disabled={!(actions.includes('admin') || actions.includes('update'))}
                onClick={() => {
                  isOpen ? setExpandedRowKeys([]) : setExpandedRowKeys([item.id]);
                  return setID(item.id);
                }}
                style={{ margin: '0.5rem' }}
              >
                {isOpen ? <CloseOutlined /> : <FormOutlined />}
              </Button>
              <Popconfirm
                title="Are you sure you want to delete this?"
                onConfirm={() => dispatch(deletePost(item.id)).then(() => fetchPosts())}
                disabled={!(actions.includes('admin') || actions.includes('delete'))}
              >
                <Button
                  icon={ <DeleteOutlined />}
                  disabled={!(actions.includes('admin') || actions.includes('delete'))}
                  danger
                  style={{ margin: '0.5rem' }}
                >
                </Button>
              </Popconfirm>
            </div>
          </>
        );
      },
    },
  ];

  return (
    <Space direction="vertical">
      <Table
        dataSource={data.posts}
        columns={columns}
        rowKey={(record) => record.id}
        expandable={{
          expandIconColumnIndex: -1,
          expandedRowKeys,
          onExpand: (expanded, record) => {
            let keys = [];
            if (expanded) {
              keys.push(record.id);
            }

            setExpandedRowKeys(keys);
          },
          expandedRowRender: (item) => (
            <QuickEdit
              data={item}
              setID={setID}
              slug={format.slug}
              onQuickEditUpdate={() => setExpandedRowKeys([])}
            />
          ),
          expandIcon: () => {},
        }}
        pagination={{
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`,
          total: data.total,
          current: filters.page,
          pageSize: filters.limit ? filters.limit : 10,
          onChange: (pageNumber, pageSize) => onPagination(pageNumber, pageSize),
          pageSizeOptions: ['10', '15', '20'],
        }}
      />
    </Space>
  );
}

export default PostList;
