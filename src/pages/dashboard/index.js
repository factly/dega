import React from 'react';
import { Typography } from 'antd';
import ProLayout from '@ant-design/pro-layout';
import logo from '../../assets/logo.png';
import { shallowEqual, useSelector } from 'react-redux';

function Dashboard() {
  const { Title } = Typography;
  const settings = useSelector((state) => state.settings.settings);
  console.log(settings);
  return <ProLayout logo={logo} {...settings} />;
}

export default Dashboard;
