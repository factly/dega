import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Menu, Divider, Row, Col, Select } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined, DownOutlined } from '@ant-design/icons';
import { toggleSider } from '../../actions/settings';
import AccountMenu from './AccountMenu';
import { Link } from 'react-router-dom';
import { setSelectedSpace } from '../../actions/spaces';

const { Option, OptGroup } = Select;

function Header() {
  const { Header: HeaderAnt } = Layout;

  const {
    settings: {
      sider: { collapsed },
    },
    spaces: { spaces, selected },
  } = useSelector((state) => state);

  const dispatch = useDispatch();
  const MenuFoldComponent = collapsed ? MenuUnfoldOutlined : MenuFoldOutlined;

  const handleSpaceChange = (space) => {
    dispatch(setSelectedSpace(space));
  };
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
          <Select style={{ width: 200 }} value={selected} onChange={handleSpaceChange}>
            {spaces.map((organazation) => (
              <OptGroup key={'org-' + organazation.id} label={organazation.title}>
                {organazation.spaces.map((space) => (
                  <Option key={'space-' + space.slug} value={space.id}>
                    {space.name}
                  </Option>
                ))}
              </OptGroup>
            ))}
          </Select>
          <AccountMenu />
        </Col>
      </Row>
    </HeaderAnt>
  );
}

export default Header;
