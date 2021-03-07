import React from 'react';
import MenuEditForm from './components/MenuForm';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from 'antd';
import { updateMenu, getMenu } from '../../actions/menu';
import { useHistory } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';

function EditMenu() {
  const history = useHistory();
  const { id } = useParams();
  const dispatch = useDispatch();

  const { menu, loading } = useSelector((state) => {
    return {
      menu: state.menu.details[id] ? state.menu.details[id] : null,
      loading: state.menu.loading,
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
    dispatch(updateMenu({ ...menu, ...values })).then(() => history.push('/menu'));
  };
  return <MenuEditForm data={menu} onCreate={onUpdate} />;
}

export default EditMenu;
