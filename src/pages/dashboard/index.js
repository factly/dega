import React, { useEffect } from 'react';
import { Col, Row, Space, Statistic, Typography } from 'antd';
import Features from './components/Features';
import getUserPermission from '../../utils/getUserPermission';
import { useDispatch, useSelector } from 'react-redux';
import { getInfo } from '../../actions/info';
import { Link } from 'react-router-dom';

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
        <Col span={6}>
          <Link to="/posts">
            <Statistic
              title="Total Posts"
              value={article.publish + article.draft + article.ready}
            />
          </Link>
        </Col>
        <Col span={6}>
          <Link to="/posts?status=publish">
            <Statistic title="Published Posts" value={info.article.publish} />
          </Link>
        </Col>
        <Col span={6}>
          <Link to="/posts?status=draft">
            <Statistic title="Draft Posts" value={info.article.draft} />
          </Link>
        </Col>
        <Col span={6}>
          <Link to="/posts?status=ready">
            <Statistic title="Ready to publish Posts" value={info.article.ready} />
          </Link>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={6}>
          <Link to="/fact-checks">
            <Statistic
              title="Total Fact Checks"
              value={factCheck.publish + factCheck.draft + factCheck.ready}
            />
          </Link>
        </Col>
        <Col span={6}>
          <Link to="/fact-checks?status=publish">
            <Statistic title="Published Fact Checks" value={info.factCheck.publish} />
          </Link>
        </Col>
        <Col span={6}>
          <Link to="/fact-checks?status=draft">
            <Statistic title="Draft Fact Checks" value={info.factCheck.draft} />
          </Link>
        </Col>
        <Col span={6}>
          <Link to="/fact-checks?status=ready">
            <Statistic title="Ready to publish Fact Checks" value={info.factCheck.ready} />
          </Link>
        </Col>
      </Row>
      {actions.includes('admin') ? <Features /> : null}
    </Space>
  );
}

export default Dashboard;
