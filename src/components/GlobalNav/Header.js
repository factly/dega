import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Layout, Divider, Row, Col, Select } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import { toggleSider } from '../../actions/settings';
import AccountMenu from './AccountMenu';
import { setSelectedSpace } from '../../actions/spaces';

const { Option, OptGroup } = Select;

function Header() {
  const { Header: HeaderAnt } = Layout;

  const {
    settings: {
      sider: { collapsed },
    },
    spaces: { orgs, details, selected },
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
            {orgs.map((organazation) => (
              <OptGroup key={'org-' + organazation.id} label={organazation.title}>
                {organazation.spaces.map((space) => (
                  <Option key={'space-' + details[space].slug} value={details[space].id}>
                    {details[space].name}
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
