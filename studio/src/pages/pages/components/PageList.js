import React, { useState } from 'react';
import { Popconfirm, Button, Space, Tag, Table } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExceptionOutlined,
  ClockCircleOutlined,
  CloseOutlined,
  FormOutlined,
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { deletePage } from '../../../actions/pages';
import { Link } from 'react-router-dom';
import QuickEdit from '../../../components/List/QuickEdit';

function PageList({ actions, format, status, data, filters, setFilters, fetchPages }) {
  const dispatch = useDispatch();
  const [id, setID] = useState(0);
  const [expandedRowKeys, setExpandedRowKeys] = useState([0]);

  const getTagList = (tagids) => {
    return tagids.map((id) => (
      <Link to={`/pages?tag=${id}`}>
        <Tag>{data.tags[id].name}</Tag>
      </Link>
    ));
  };
  const getCategoryList = (catIds) => {
    return catIds.map((id) => (
      <Link to={`/pages?category=${id}`}>
        <Tag>{data.categories[id].name}</Tag>
      </Link>
    ));
  };
  // const getAuthorsList = (ids) => {
  //   return ids?.map((id) => (
  //     <Link>
  //       <Tag>{data.authors[id].display_name}</Tag>
  //     </Link>
  //   ));
  // };
  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 400,
      render: (_, item) => (
        <Link to={`/pages/${item.id}/edit`}>
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
            <div style={{ display: 'flex', padding: '0 1rem' }}>
              <Link style={{ display: 'block' }} to={`/pages/${item.id}/edit`}>
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
                onConfirm={() => dispatch(deletePage(item.id)).then(() => fetchPages())}
                disabled={!(actions.includes('admin') || actions.includes('delete'))}
              >
                <Button
                  icon={ <DeleteOutlined />}
                  disabled={!(actions.includes('admin') || actions.includes('delete'))}
                  danger
                  style={{
                    margin: '0.5rem',
                    padding: '4px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                </Button>
               {/* <Button
                  icon={<EditOutlined />}
                  disabled={!(actions.includes('admin') || actions.includes('update'))}
                  style={{
                    margin: '0.5rem',
                    padding: '4px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                /> */}
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
        dataSource={data.pages}
        columns={columns}
        rowKey={(record) => record.id}
        locale={{
          emptyText: '-',
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
          expandIcon: () => {},
        }}
        pagination={{
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`,
          total: data.total,
          current: filters.page,
          pageSize: filters.limit ? filters.limit : 10,
          onChange: (pageNumber, pageSize) =>
            setFilters({ ...filters, page: pageNumber, limit: pageSize }),
          pageSizeOptions: ['10', '15', '20'],
        }}
      />
    </Space>
  );
}

export default PageList;
