import React, { useEffect } from 'react';
import { Col, Row, Space, Statistic, Typography } from 'antd';
import Features from './components/Features';
import getUserPermission from '../../utils/getUserPermission';
import { useDispatch, useSelector } from 'react-redux';
import { getInfo } from '../../actions/info';

function Dashboard() {
  const { spaces, info } = useSelector(({ spaces, info }) => ({
    spaces,
    info,
  }));
  const actions = getUserPermission({ resource: 'dashboard', action: 'get', spaces });
  const dispatch = useDispatch();

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = () => {
    dispatch(getInfo());
  };

  const { article, factCheck } = info;

  return (
    <Space direction="vertical">
      <Typography.Title>Dashboard</Typography.Title>
      <Row gutter={16}>
        <Col span={12}>
          <Statistic title="Categories" value={info.categories} />
        </Col>
        <Col span={12}>
          <Statistic title="Tags" value={info.tags} />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={6}>
          <Statistic
            title="Total Posts"
            value={article.publish + article.draft + article.template}
          />
        </Col>
        <Col span={6}>
          <Statistic title="Published Posts" value={info.article.publish} />
        </Col>
        <Col span={6}>
          <Statistic title="Draft Posts" value={info.article.draft} />
        </Col>
        <Col span={6}>
          <Statistic title="Template Posts" value={info.article.template} />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={6}>
          <Statistic
            title="Total Fact Checks"
            value={factCheck.publish + factCheck.draft + factCheck.template}
          />
        </Col>
        <Col span={6}>
          <Statistic title="Published Fact Checks" value={info.factCheck.publish} />
        </Col>
        <Col span={6}>
          <Statistic title="Draft Fact Checks" value={info.factCheck.draft} />
        </Col>
        <Col span={6}>
          <Statistic title="Template Fact Checks" value={info.factCheck.template} />
        </Col>
      </Row>
      {actions.includes('admin') ? <Features /> : null}
    </Space>
  );
}

export default Dashboard;
