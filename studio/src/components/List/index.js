import React, { useState } from 'react';
import { Modal, Button, Space, Tag, Table, Typography, ConfigProvider } from 'antd';
import QuickEditIcon from '../../assets/QuickEditIcon';
import ThreeDotIcon from '../../assets/ThreeDotIcon';
import { EditOutlined, DeleteOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { deletePost } from '../../actions/posts';
import { formatDate, getDifferenceInModifiedTime } from '../../utils/date';
import { Link, useHistory } from 'react-router-dom';
import QuickEdit from './QuickEdit';

function PostList({ actions, format, filters, onPagination, data, fetchPosts, query }) {
  const dispatch = useDispatch();
  const [id, setID] = useState(0);
  const [expandedRowKeys, setExpandedRowKeys] = useState([0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteItemID, setDeleteItemID] = useState(null);
  const history = useHistory();

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
          <Typography.Text
            style={{
              fontSize: '1rem',
              color: ['draft', 'ready', 'publish'].includes(query)
                ? '#101828'
                : item.status === 'draft'
                ? '#454545'
                : '#101828',
            }}
            strong
          >
            {item.title}
          </Typography.Text>
          {['draft', 'ready', 'publish'].includes(query) ? null : item.status === 'draft' ? (
            <EditOutlined style={{ color: '#454545', marginLeft: '10px', fontSize: '14px' }} />
          ) : item.status === 'ready' ? (
            <CheckOutlined style={{ color: '#101828', marginLeft: '10px', fontSize: '14px' }} />
          ) : null}
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
              <Typography.Text style={{ color: '#101828' }} strong>
                {item.published_date ? formatDate(item.published_date) : '---'}
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
            <Typography.Text style={{ color: '#101828' }} strong>
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
      // fixed: 'right',
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
                  colorPrimaryHover: '#00000026',
                },
              },
            }}
          >
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                size="large"
                disabled={!(actions.includes('admin') || actions.includes('update'))}
                onClick={(e) => {
                  e.stopPropagation();
                  isOpen ? setExpandedRowKeys([]) : setExpandedRowKeys([item.id]);
                  return setID(item.id);
                }}
                icon={
                  isOpen ? (
                    <CloseOutlined style={{ color: '#858585' }} />
                  ) : (
                    <QuickEditIcon style={{ color: '#858585' }} />
                  )
                }
              />
              <Button
                size="large"
                icon={<DeleteOutlined style={{ color: '#858585' }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  setModalOpen(true);
                  setDeleteItemID(item.id);
                }}
                disabled={!(actions.includes('admin') || actions.includes('delete'))}
              />
              <Button
                size="large"
                icon={<ThreeDotIcon style={{ color: '#858585' }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  // alert('this do nothing');
                }}
              />
            </div>
          </ConfigProvider>
        );
      },
    },
  ];

  return (
    <ConfigProvider
      theme={{
        components: {
          Typography: {
            colorText: '#101828',
          },
        },
      }}
    >
      <Space direction="vertical">
        <Table
          dataSource={data.posts}
          columns={columns}
          rowKey={(record) => record.id}
          loading={data.loading}
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                history.push(
                  format.slug === 'article'
                    ? `/posts/${record.id}/edit`
                    : `/fact-checks/${record.id}/edit`,
                );
              },
              onMouseEnter: (event) => {
                document.body.style.cursor = 'pointer';
              },
              onMouseLeave: (event) => {
                document.body.style.cursor = 'default';
              },
            };
          }}
          // style={{ maxWidth: '100vw', overflowX: 'auto' }}
          scroll={{
            x: '1000',
          }}
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
            expandIcon: () => { },
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
        <Modal
          open={modalOpen}
          closable={false}
          centered
          width={311}
          className="delete-modal-container"
          cancelButtonProps={{ type: 'text', style: { color: '#000' } }}
          style={{
            borderRadius: '18px',
          }}
          onOk={(e) => {
            e.stopPropagation();
            dispatch(deletePost(deleteItemID)).then(() => fetchPosts());
            setModalOpen(false);
            setDeleteItemID(null);
          }}
          onCancel={(e) => {
            e.stopPropagation();
            setModalOpen(false);
            setDeleteItemID(null);
          }}
        >
          <Typography.Text strong>Are you sure you want to delete this post?</Typography.Text>
        </Modal>
      </Space>
    </ConfigProvider>
  );
}

export default PostList;

