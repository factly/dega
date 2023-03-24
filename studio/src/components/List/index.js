import React, { useState } from 'react';
import { Modal, Button, Space, Tag, Table, Typography, ConfigProvider } from 'antd';
import { EditOutlined, DeleteOutlined, CloseOutlined, FormOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { deletePost } from '../../actions/posts';
import {
  getDateAndTimeFromString,
  formatDate,
  getDifferenceInModifiedTime,
} from '../../utils/date';
import { Link } from 'react-router-dom';
import QuickEdit from './QuickEdit';

function PostList({ actions, format, filters, onPagination, data, fetchPosts }) {
  /**
   * TODO: Add Authors detail on table
   */
  const dispatch = useDispatch();
  const [id, setID] = useState(0);
  const [expandedRowKeys, setExpandedRowKeys] = useState([0]);
  const [modalOpen, setModalOpen] = useState(false);

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
  const authors = useSelector((state) => state.authors.details);
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
          {/* <p style={{ fontSize: '1rem', fontWeight: 500 }}></p> */}
          <Typography.Text style={{ fontSize: '1rem' }} strong>
            {item.title}
          </Typography.Text>
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
      title: 'Published Date',
      dataIndex: ['published_date', 'updated_at'],
      key: 'categories',
      ellipsis: true,
      width: 200,
      render: (_, item) => {
        return (
          item && (
            <>
              <Typography.Text strong>
                {item.published_date
                  ? formatDate(getDateAndTimeFromString(item.published_date))
                  : '---'}
                <br />
              </Typography.Text>
              <Typography.Text type="secondary">
                {getDifferenceInModifiedTime(item.updated_at)}
              </Typography.Text>
            </>
          )
        );
      },
    },
    {
      title: 'Authors',
      dataIndex: 'authors',
      key: 'status',
      width: 200,
      render: (items) => {
        return items?.map((author) => (
          <>
            <Typography.Text strong>
              {authors[author]?.display_name
                ? authors[author]?.display_name
                : authors[author]?.['email']
                ? authors[author]?.['email']
                : null}
            </Typography.Text>{' '}
            <br />
          </>
        ));
      },
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      fixed: 'right',
      width: 200,
      render: (_, item, idx) => {
        const isOpen = item.id === expandedRowKeys[0];
        return (
          <ConfigProvider
            theme={{
              components: {
                Button: {
                  controlHeight: 35,
                  colorBorder: '#F2F2F2',
                  colorPrimaryHover: '#F2F2F2',
                },
              },
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Link
                style={{ display: 'block' }}
                to={
                  format.slug === 'article'
                    ? `/posts/${item.id}/edit`
                    : `/fact-checks/${item.id}/edit`
                }
              >
                <Button
                  size="large"
                  icon={<EditOutlined style={{ color: '#858585' }} />}
                  disabled={!(actions.includes('admin') || actions.includes('update'))}
                />
              </Link>
              <Button
                size="large"
                disabled={!(actions.includes('admin') || actions.includes('update'))}
                onClick={() => {
                  isOpen ? setExpandedRowKeys([]) : setExpandedRowKeys([item.id]);
                  return setID(item.id);
                }}
                icon={
                  isOpen ? (
                    <CloseOutlined style={{ color: '#858585' }} />
                  ) : (
                    <FormOutlined style={{ color: '#858585' }} />
                  )
                }
              />
              <Button
                size="large"
                icon={<DeleteOutlined style={{ color: '#858585' }} />}
                onClick={() => {
                  setModalOpen(true);
                }}
                disabled={!(actions.includes('admin') || actions.includes('delete'))}
              />
              <Modal
                open={modalOpen}
                closable={false}
                centered
                width={400}
                className="delete-modal-container"
                style={{
                  borderRadius: '18px',
                }}
                onOk={() => {
                  () => dispatch(deletePost(item.id)).then(() => fetchPosts());
                }}
                onCancel={() => {
                  setModalOpen(false);
                }}
              >
                <p>Are you sure you want to delete this post?</p>
              </Modal>
            </div>
          </ConfigProvider>
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
        loading={data.loading}
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
