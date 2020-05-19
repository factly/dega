import React from 'react';
import { Popconfirm, Form } from 'antd';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSpaces, addSpaces } from '../../../actions/spaces';
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
            <a
              href="javascript:void()"
              onClick={() => save(record.key)}
              style={{
                marginRight: 8,
              }}
            >
              Save
            </a>
            <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
              <a>Cancel</a>
            </Popconfirm>
          </span>
        ) : (
          <span>
            <a
              className="ant-dropdown-link"
              disabled={editingKey !== ''}
              style={{
                marginRight: 8,
              }}
              onClick={() => edit(record)}
            >
              Edit
            </a>
            <a disabled={editingKey !== ''} className="ant-dropdown-link">
              Delete
            </a>
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
      <Table columns={mergedColumns} data={data} loading={loading} />
    </Form>
  );
}

export default SpaceList;
