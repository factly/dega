import React from 'react';
import { Form, Input } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import MenuForm from './components/MenuForm';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { addMenu } from '../../actions/menu';

function CreateMenu () {
  const history = useHistory();
  const dispatch = useDispatch();
  const onCreate = (values) => {
    console.log('values in create page', values);
    dispatch(addMenu(values)).then(() => history.push('/menu'));
  };
  return (
    <div>
    <MenuForm onCreate={onCreate} />
    </div>
  )
}

export default CreateMenu;