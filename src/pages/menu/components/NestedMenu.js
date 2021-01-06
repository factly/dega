import React from 'react';
import MenuItem from './MenuItem';
function NestedMenu ({ menu, margin }) {
  const newMargin = parseInt(margin+20);
  const nestedSubMenu = menu['menu'] && menu['menu'].length > 0 ? menu['menu'].map(submenu => {
    return !submenu['menu'] ?
    (
      <div style={{ display:'flex', alignItems:'center'}}>
        <MenuItem name={submenu.name} title={submenu.title} margin={newMargin} />
      </div>
    )
    :
    ( <NestedMenu menu={submenu} margin={newMargin} /> );
  }) : null;
  return (
    <div>
      {/* <div style={{ display:'flex', alignItems:'center'}}> */}
        <MenuItem name={menu['name']} title={menu['title']}  item={menu['menu']} margin={margin} />
      {/* </div> */}
      {nestedSubMenu}
    </div>
  );
}

export default NestedMenu;