import React from 'react';
import MenuForm from './components/MenuForm';
import { useDispatch } from 'react-redux';
 
import { createMenu } from '../../actions/menu';
import { Helmet } from 'react-helmet';
import useNavigation from '../../utils/useNavigation';

function CreateMenu() {
  const history = useNavigation();
  const dispatch = useDispatch();
  const onCreate = (values) => {
    dispatch(createMenu(values)).then(() => history('/settings/website/menus'));
  };
  return (
    <div>
      <>
        <Helmet title={'Create Menu'} />
        <MenuForm onCreate={onCreate} />
      </>
    </div>
  );
}

export default CreateMenu;
