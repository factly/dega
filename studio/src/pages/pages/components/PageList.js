import React, { useState } from 'react';
import { Popconfirm, Button, Space, Tag, Table } from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  ExceptionOutlined,
  ClockCircleOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { deletePage } from '../../../actions/pages';
import { Link } from 'react-router-dom';
import QuickEdit from '../../../components/List/QuickEdit';
import moment from 'moment';

function PageList({ actions, format, status, data, filters, setFilters, fetchPages }) {
  const dispatch = useDispatch();
  const [id, setID] = useState(0);
  const [expandedRowKeys, setExpandedRowKeys] = useState([0]);

  const getTagList = (tagids) => {
    return tagids.map((id) => <Tag>{data.tags[id].name}</Tag>);
  };
  const getCategoryList = (catIds) => {
    return catIds.map((id) => <Tag>{data.categories[id].name}</Tag>);
  };
  const getAuthorsList = (ids) => {
    return ids?.map((id) => <span>{data.authors[id].display_name}</span>);
  };
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
              Published on {moment(item.published_date).format('MMMM Do YYYY')}
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
      title: 'Quick Actions',
      dataIndex: 'quick-actions',
      fixed: 'right',
      align: 'center',
      width: 150,
      render: (_, item, idx) => {
        const isOpen = item.id === expandedRowKeys[0];
        return (
          <>
            <div style={{ display: 'flex' }}>
              <Button
                disabled={!(actions.includes('admin') || actions.includes('update'))}
                onClick={() => {
                  isOpen ? setExpandedRowKeys([]) : setExpandedRowKeys([item.id]);
                  return setID(item.id);
                }}
                style={{ margin: '0.5rem' }}
              >
                {isOpen ? <CloseOutlined /> : <EditOutlined />}
              </Button>
              <Popconfirm
                title="Are you sure you want to delete this?"
                onConfirm={() => dispatch(deletePage(item.id)).then(() => fetchPages())}
                disabled={!(actions.includes('admin') || actions.includes('delete'))}
              >
                <Button
                  disabled={!(actions.includes('admin') || actions.includes('delete'))}
                  type="danger"
                  style={{ margin: '0.5rem' }}
                >
                  <DeleteOutlined />
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
        dataSource={data.pages}
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
          total: data.total,
          current: filters.page,
          pageSize: filters.limit ? filters.limit : 10,
          onChange: (pageNumber, pageSize) =>
            setFilters({ ...filters, page: pageNumber, limit: pageSize }),
        }}
      />
    </Space>
  );
}

export default PageList;
