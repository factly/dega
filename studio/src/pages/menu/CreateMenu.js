import React from 'react';
import MenuForm from './components/MenuForm';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { createMenu } from '../../actions/menu';

function CreateMenu() {
  const history = useHistory();
  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(createMenu(values)).then(() => history.push('/website/menus'));
  };
  return (
    <div>
      <MenuForm onCreate={onCreate} />
    </div>
  );
}

export default CreateMenu;
