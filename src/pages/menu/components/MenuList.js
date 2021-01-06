import React from 'react';
import NestedMenu from './NestedMenu';
import { useDispatch, useSelector } from 'react-redux';
import { getMenus, deleteMenu } from '../../../actions/menu';
import deepEqual from 'deep-equal';
import { Pagination, Space, Button, Popconfirm } from 'antd';
import { Link } from 'react-router-dom';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

function MenuList () {
  const dispatch = useDispatch();
  const [filters, setFilters] = React.useState({
    page: 1,
    limit: 1,
  });
  const { menus, total, loading } = useSelector((state) => {
    const node = state.menu.req.find((item) => {
      return deepEqual(item.query, filters);
    });
    if (node) 
      return {
        menus: node.data.map((element) => state.menu.details[element]),
        total: node.total,
        loading: state.menu.loading,
      };
    return { menus: [], total: 0, loading: state.menu.loading };
  });
  React.useEffect(() => {
    
    fetchMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchMenus = () => {
    dispatch(getMenus(filters));
  };

  return(
    <div>
      { menus.length > 0 ?
        <Space direction="vertical">
        <h3>Name : { menus[0].name}</h3>
        <div>
          <Link to={`/menu/${menus[0].id}/edit`}>
            <Button icon={<EditOutlined />}>
              Edit
            </Button>
          </Link>
          <Popconfirm title="Sure to delete?"
            onConfirm={() => dispatch(deleteMenu(menus[0].id)).then(() => {
              fetchMenus();
              window.location.reload();
              })}>
            <Button icon={<DeleteOutlined />} >
              Delete
            </Button>
          </Popconfirm>  
        </div> 
      </Space> : null
      }
      
      {
        <div >
          { menus.length > 0 ? menus[0]['menu'].map((menuElement, index) => {
            return (
              <div key={index} style={{ marginTop:"10px"}}>
                <NestedMenu menu={menuElement} margin='0' />
              </div>
            )
          }) : null }
        </div>
      }
      <div style={{float:'right'}}>
        <Pagination 
          current={filters.page} pageSize={filters.limit} total={total} 
          onChange={(pageNumber,pageSize)=> setFilters({ ...filters, page: pageNumber, limit: pageSize }) }>
        </Pagination>
      </div>
    </div>
  );
}

export default MenuList;