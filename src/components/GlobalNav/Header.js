import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Menu, Dropdown, Divider, Row, Col, PageHeader } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined, DownOutlined } from '@ant-design/icons';
import { toggleSider } from '../../actions/settings';
import SelectOrg from './SelectOrg';
import AccountMenu from './AccountMenu';
import { Link } from 'react-router-dom';
import { setSelectedSpace } from '../../actions/spaces';
const { SubMenu } = Menu;

function Header() {
  const { Header: HeaderAnt } = Layout;
  // const [options, setOptions] = React.useState([]);
  const {
    settings: {
      sider: { collapsed },
    },
    spaces: { spaces, selectedSpace },
  } = useSelector((state) => state);
  console.log('spaces', selectedSpace);
  const dispatch = useDispatch();
  const MenuFoldComponent = collapsed ? MenuUnfoldOutlined : MenuFoldOutlined;
  // const onSearch = (searchText) => {
  //   setOptions(
  //     !searchText ? [] : [mockVal(searchText), mockVal(searchText, 2), mockVal(searchText, 3)],
  //   );
  // };

  // const onSelect = (data) => {
  //   console.log('onSelect', data);
  // };
  const handleSpaceChange = (space) => {
    dispatch(setSelectedSpace(space));
  };

  const menu = (
    <Menu>
      {spaces.map((space) => (
        <Menu.ItemGroup title={space.title}>
          {space.spaces.map((s) => (
            <Menu.Item onClick={(event) => handleSpaceChange(s)}>{s.name}</Menu.Item>
          ))}
        </Menu.ItemGroup>
      ))}
      <Menu.Divider />
      <Menu.Item key="3">
        <Link to="/spaces/create">Create new space</Link>
      </Menu.Item>
    </Menu>
  );
  return (
    <HeaderAnt className="layout-header">
      <Row>
        <Col xs={2} sm={4}>
          {
            <MenuFoldComponent
              style={{ fontSize: '20px' }}
              className="trigger"
              onClick={() => dispatch(toggleSider())}
            />
          }
          <Divider type="vertical" />
        </Col>
        <Col xs={22} sm={20}>
          <PageHeader
            extra={[
              //   <AutoComplete
              //     dropdownClassName="certain-category-search-dropdown"
              //     dropdownMatchSelectWidth={500}
              //     style={{ width: 250 }}
              //     options={options}
              //   >
              //     <Input.Search size="large" placeholder="input here" />
              //   </AutoComplete>,
              <Dropdown overlay={menu}>
                <span className="ant-dropdown-link">
                  {selectedSpace.name}
                  {` `}
                  <DownOutlined />
                </span>
              </Dropdown>,
              <AccountMenu />,
              <SelectOrg />,
            ]}
          />
        </Col>
      </Row>
    </HeaderAnt>
  );
}

export default Header;
