import React from 'react';
import { Popconfirm, Form, Space, Button } from 'antd';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSpaces, addSpaces } from '../../../actions/spaces';
import { Link } from 'react-router-dom';
import Table from '../../../components/Table';

function SpaceList() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const { spaces: data, loading } = useSelector((state) => state.spaces);
  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record) => record.cell === editingKey;

  const edit = (record) => {
    form.setFieldsValue({
      phone: '',
      gender: '',
      email: '',
      ...record,
    });
    setEditingKey(record.cell);
  };

  const cancel = () => {
    setEditingKey('');
  };

  const save = async (key) => {
    try {
      const row = await form.validateFields();
      const newData = [...data];
      const index = newData.findIndex((item) => key === item.key);

      if (index > -1) {
        dispatch(addSpaces(row));
        setEditingKey('');
      } else {
        dispatch(addSpaces(row));
        setEditingKey('');
      }
    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const columns = [
    {
      title: 'Phone',
      dataIndex: 'phone',
      width: '25%',
      sorter: true,
      editable: true,
    },
    {
      title: 'Gender',
      dataIndex: 'gender',
      filters: [
        { text: 'Male', value: 'male' },
        { text: 'Female', value: 'female' },
      ],
      width: '15%',
      editable: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      width: '40%',
      editable: true,
    },
    {
      title: 'Action',
      dataIndex: 'operation',
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Button
              onClick={() => save(record.key)}
              style={{
                marginRight: 8,
              }}
            >
              Save
            </Button>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <Button>Cancel</Button>
            </Popconfirm>
          </span>
        ) : (
          <span>
            <Link
              className="ant-dropdown-link"
              style={{
                marginRight: 8,
              }}
              to={`/spaces/edit/${record.id}`}
            >
              Edit
            </Link>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <Button className="ant-dropdown-link">Delete</Button>
            </Popconfirm>
          </span>
        );
      },
    },
  ];
  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'age' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetch = (params = {}) => {
    dispatch(getSpaces());
  };

  return (
    <Form form={form} component={false}>
      <Space direction="vertical">
        <Link className="ant-btn ant-btn-primary" key="1" to="/spaces/create">
          Create New
        </Link>
        <Table columns={mergedColumns} data={data} loading={loading} />
      </Space>
    </Form>
  );
}

export default SpaceList;
