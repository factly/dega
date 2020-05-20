import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Menu, Dropdown, AutoComplete, Divider, Row, Col, PageHeader } from 'antd';
import {
  MenuUnfoldOutlined,
  UserOutlined,
  MenuFoldOutlined,
  DownOutlined,
} from '@ant-design/icons';
import { toggleSider } from '../../actions/settings';
import SelectOrg from './SelectOrg';
import AccountMenu from './AccountMenu';
import { Link } from 'react-router-dom';

const mockVal = (str, repeat = 1) => ({
  value: str.repeat(repeat),
});

function Header() {
  const { Header } = Layout;
  const [options, setOptions] = React.useState([]);
  const {
    sider: { collapsed },
  } = useSelector((state) => state.settings);
  const dispatch = useDispatch();
  const MenuFoldComponent = collapsed ? MenuUnfoldOutlined : MenuFoldOutlined;
  const onSearch = (searchText) => {
    setOptions(
      !searchText ? [] : [mockVal(searchText), mockVal(searchText, 2), mockVal(searchText, 3)],
    );
  };

  const onSelect = (data) => {
    console.log('onSelect', data);
  };
  const menu = (
    <Menu>
      <Menu.Item key="0" icon={<DownOutlined />}>
        Space 1
      </Menu.Item>
      <Menu.Item key="1" icon={<DownOutlined />}>
        Space 2
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="3">
        <Link to="/spaces/create">Create new space</Link>
      </Menu.Item>
    </Menu>
  );
  return (
    <Header className="layout-header">
      <Row>
        <Col flex="100px">
          {<MenuFoldComponent className="trigger" onClick={() => dispatch(toggleSider())} />}
          <Divider type="vertical" />
        </Col>
        <Col flex="auto">
          <PageHeader
            extra={[
              <AutoComplete
                options={options}
                onSelect={onSelect}
                onSearch={onSearch}
                placeholder="Search....."
              />,
              <Dropdown.Button overlay={menu} icon={<DownOutlined />}>
                Selected Space
              </Dropdown.Button>,
              <AccountMenu />,
              <SelectOrg />,
            ]}
          />
        </Col>
      </Row>
    </Header>
  );
}

export default Header;
