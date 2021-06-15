import React from 'react';
import MenuForm from './components/MenuForm';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { addMenu } from '../../actions/menu';

function CreateMenu() {
  const history = useHistory();
  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(addMenu(values)).then(() => history.push('/menus'));
  };
  return (
    <div>
      <MenuForm onCreate={onCreate} />
    </div>
  );
}

export default CreateMenu;
