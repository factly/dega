import React from 'react';
import MenuEditForm from './components/MenuForm';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { updateMenu, getMenu } from '../../actions/menu';

import { useParams } from 'react-router-dom';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { Helmet } from 'react-helmet';
import useNavigation from '../../utils/useNavigation';

function EditMenu() {
  const history = useNavigation();
  const { id } = useParams();
  const dispatch = useDispatch();

  const { menu, loading } = useSelector((state) => {
    return {
      menu: state.menus.details[id] ? state.menus.details[id] : null,
      loading: state.menus.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getMenu(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <Skeleton />;
  if (!menu) {
    return <RecordNotFound />;
  }
  const onUpdate = (values) => {
    dispatch(updateMenu({ ...menu, ...values })).then(() =>
      history(`/settings/website/menus/${id}/edit`),
    );
  };
  return (
    <>
      <Helmet title={`${menu?.name} - Edit Menu`} />
      <MenuEditForm data={menu} onCreate={onUpdate} />
    </>
  );
}

export default EditMenu;
