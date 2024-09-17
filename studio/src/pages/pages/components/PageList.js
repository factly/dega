import React, { useState } from 'react';
import { ConfigProvider, Button, Space, Tag, Table, Typography, Modal } from 'antd';
import {
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
import QuickEditIcon from '../../../assets/QuickEditIcon';
import useNavigation from '../../../utils/useNavigation';

function PageList({ actions, format, data, filters, setFilters, fetchPages }) {
  const dispatch = useDispatch();
  const [id, setID] = useState(0);
  const [expandedRowKeys, setExpandedRowKeys] = useState([0]);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteItemID, setDeleteItemID] = useState(null);

  const history = useNavigation();

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: '400',
      onCell: () => {
        return {
          style: {
            minWidth: '200px',
          },
        };
      },
      render: (_, item) => (
        <Link to={`/pages/${item.id}/edit`}>
          <Typography.Text style={{ fontSize: '1rem', color: '#101828' }} strong>
            {item.title}
          </Typography.Text>
        </Link>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
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
      width: 240,
      render: (_, item) => {
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
                onClick={(e) => {
                  e.stopPropagation();
                  setModalOpen(true);
                  setDeleteItemID(item.id);
                }}
                icon={<DeleteOutlined style={{ color: '#fff' }} />}
                disabled={!(actions.includes('admin') || actions.includes('delete'))}
                style={{
                  backgroundColor: 'red',
                  borderColor: 'red',
                  color: '#fff',
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
          dataSource={data.pages.length !== 0 ? data.pages : []}
          loading={data.loading}
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                history(`/pages/${record.id}/edit`);
              },
              onMouseEnter: (event) => {
                document.body.style.cursor = 'pointer';
              },
              onMouseLeave: (event) => {
                document.body.style.cursor = 'default';
              },
            };
          }}
          scroll={{
            x: '1000',
          }}
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
                page={true}
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
        <Modal
          open={modalOpen}
          closable={false}
          centered
          width={311}
          className="delete-modal-container"
          style={{
            borderRadius: '18px',
          }}
          onOk={(e) => {
            e.stopPropagation();
            dispatch(deletePage(deleteItemID)).then(() => fetchPages());
            setModalOpen(false);
            setDeleteItemID(null);
          }}
          cancelButtonProps={{ type: 'text', style: { color: '#000' } }}
          onCancel={(e) => {
            e.stopPropagation();
            setModalOpen(false);
            setDeleteItemID(null);
          }}
        >
          <Typography.Text style={{ fontSize: '1rem', color: '#101828' }} strong>
            Are you sure you want to delete this page?
          </Typography.Text>
        </Modal>
      </Space>
    </ConfigProvider>
  );
}

export default PageList;
