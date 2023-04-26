import React from 'react';
import { ConfigProvider, Modal, Button, Table, Typography } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useHistory } from 'react-router-dom';
import { deleteSpace, getSpaces } from './../../../actions/spaces';
import { spaceSelector } from '../../../selectors/spaces';
import { DeleteOutlined } from '@ant-design/icons';

function SpaceList() {
  const dispatch = useDispatch();
  const { spaces, loading } = useSelector(spaceSelector);

  const [modalOpen, setModalOpen] = React.useState(false);

  const history = useHistory();

  const fetchSpaces = () => {
    dispatch(getSpaces());
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      onCell: () => {
        return {
          style: {
            minWidth: '200px',
          },
        };
      },
      render: (_, record) => {
        return (
          <Link
            style={{
              marginRight: 8,
            }}
            to={`/admin/spaces/${record.id}/edit`}
          >
            <Typography.Text style={{ fontSize: '1rem', color: '#101828' }} strong>
              {record.name}
            </Typography.Text>
          </Link>
        );
      },
    },
    {
      title: 'Site Address',
      dataIndex: 'site_address',
      key: 'site_address',
      width: 200,
      onCell: () => {
        return {
          style: {
            minWidth: '200px',
          },
        };
      },
      render: (_, record) => {
        return (

          <Typography.Text style={{ fontSize: '1rem', color: '#101828' }} strong>
            {record.site_address}
          </Typography.Text>
        );
      },
    },
    {
      title: 'Site Title',
      dataIndex: 'site_title',
      key: 'site_title',
      width: 200,
      onCell: () => {
        return {
          style: {
            minWidth: '200px',
          },
        };
      },
      render: (_, record) => {
        return (

          <Typography.Text style={{ fontSize: '1rem', color: '#101828' }} strong>
            {record.site_title}
          </Typography.Text>
        );
      },
    },
    {
      title: 'Tag line',
      dataIndex: 'tag_line',
      key: 'tag_line',
      width: 200,
      onCell: () => {
        return {
          style: {
            minWidth: '200px',
          },
        };
      },
      render: (_, record) => {
        return (

          <Typography.Text style={{ fontSize: '1rem', color: '#101828' }} strong>
            {record.tag_line}
          </Typography.Text>
        );
      },
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      align: 'center',
      width: 150,
      onCell: () => {
        return {
          style: {
            minWidth: '150px',
          },
        };
      },
      render: (_, record) => {
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
                onClick={(e) => {
                  e.stopPropagation();
                  setModalOpen(true);
                }}
                icon={<DeleteOutlined style={{ color: '#858585' }} />}
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
                  dispatch(deleteSpace(record.id)).then(() => fetchSpaces())
                  setModalOpen(false);
                }}
                cancelButtonProps={{ type: 'text', style: { color: '#000' } }}
                onCancel={(e) => {
                  e.stopPropagation();
                  setModalOpen(false);
                }}
              >
                <Typography.Text style={{ fontSize: '1rem', color: '#101828' }} strong>
                  Are you sure you want to delete this space?
                </Typography.Text>
              </Modal>
            </div>
          </ConfigProvider>
        );
      },
    },
  ];

  return <ConfigProvider
    theme={{
      components: {
        Typography: {
          colorText: '#101828',
        },
      },
    }}
  ><Table
      onRow={(record, rowIndex) => {
        return {
          onClick: (event) => {
            history.push(`/admin/spaces/${record.id}/edit`);
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
      rowKey={'id'} dataSource={spaces} columns={columns} loading={loading} />
  </ConfigProvider>;
}

export default SpaceList;
