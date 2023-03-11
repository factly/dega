import React, { useEffect, useRef, useState } from 'react';

import { useSelector, useDispatch } from 'react-redux';
import { Select, Avatar, Button, Drawer, Divider, Space, Modal, Layout } from 'antd';
import { Input, List, Typography, Empty } from 'antd';
import { LeftOutlined, PlusOutlined, SearchOutlined, DeleteOutlined } from '@ant-design/icons';
import { setSelectedSpace } from '../../actions/spaces';
import { Link } from 'react-router-dom';
import Search from '.././../components/Search';
const { Option, OptGroup } = Select;
import { getSearchDetails } from '../../actions/search';
import { deleteSpace } from '../../actions/spaces';
import degaImg from '../../assets/dega.png';
import './SpaceSelector.css';

const headerStyle = {
  display: 'flex',
  justifyContent: 'space-around',
  alignItems: 'center',
  backgroundColor: '#F9FAFB',
  fontSize: '1rem',
  fontWeight: 'bold',
  color: '#1E1E1E',
};
const contentStyle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  backgroundColor: '#F9FAFB',
  color: '#1E1E1E',
};

function SpaceSelector({ onClose, open }) {
  const { orgs, details, selected } = useSelector((state) => state.spaces);
  const dispatch = useDispatch();
  const [listitemHover, setListItemHover] = useState(false);
  const { Header, Content } = Layout;


  return (
    <Layout style={{ backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      <Header style={headerStyle}>
        <Link to="/" onClick={onClose} style={{ color: '#1E1E1E', }}>
          <LeftOutlined style={{ fontSize: '12px', paddingRight: '6px' }} /> Home
        </Link>
        <Input placeholder="Search" style={{ width: '40%', padding: '0.5rem' }} suffix={<SearchOutlined />} />
        <Link Link key="1" onClick={onClose} to="/admin/spaces/create" >
          <Button icon={<PlusOutlined />} size="large" style={{
            backgroundColor: '#1890FF', borderRadius: '4px',
          }} type="primary">New Space</Button>
        </Link>
      </Header>
      <Content style={contentStyle}>
        {
          orgs.map((org) => {
            return (
              <div key={org.id + org.title}
                style={{
                  width: '42%',
                  justifyContent: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                }}>
                <List
                  header={
                    <Typography.Text strong style={{ color: "#6B6B6B" }}
                    > {org.title}</Typography.Text>
                  }
                  dataSource={org.spaces}
                  renderItem={(item) => (
                    <List.Item className="list-item" onClick={
                      () => {
                        dispatch(setSelectedSpace(details[item]))
                        onClose();
                      }
                    }>
                      <List.Item.Meta
                        avatar={<Avatar
                          src={
                            details[item].fav_icon
                              ? details[item].fav_icon.url?.[window.REACT_APP_ENABLE_IMGPROXY ? 'proxy' : 'raw']
                              : degaImg
                          }
                        />}
                        title={details[item].name}
                      />
                      <Button className="list-item-action" icon={<DeleteOutlined />} style={{
                        backgroundColor: 'transparent', color: '#858585', opacity: 0,
                        borderRadius: '4px', border: '2px solid #E0E0E0'
                      }} type="primary"
                        onClick={
                          (event) => {
                            event.stopPropagation();
                            dispatch(deleteSpace(details[item].id));
                          }
                        }
                      />
                    </List.Item>
                  )}
                />
                <Divider style={{ margin: 0 }} />
              </div>
            )
          })
        }
      </Content>
    </Layout >
  )
}
export default SpaceSelector;
