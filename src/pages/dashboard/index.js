import React, { useEffect } from 'react';
import { Col, Row, Space, Statistic, Typography } from 'antd';
import Features from './components/Features';
import getUserPermission from '../../utils/getUserPermission';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import { getInfo } from '../../actions/info';

function Dashboard() {
  const { spaces, info } = useSelector(({ spaces, info }) => ({
    spaces,
    info,
  }));
  const actions = getUserPermission({ resource: 'dashboard', action: 'get', spaces });
  const dispatch = useDispatch();
  const history = useHistory();

  useEffect(() => {
    fetchInfo();
  }, []);

  const fetchInfo = () => {
    dispatch(getInfo());
  };

  const { article, factCheck } = info;

  const handlePostClick = (status) => {
    history.push({
      pathname: '/posts',
      state: {
        status: status,
      },
    });
  };
  const handleFactcheckClick = (status) => {
    history.push({
      pathname: '/fact-checks',
      state: {
        status: status,
      },
    });
  };

  return (
    <Space direction="vertical">
      <Typography.Title>Dashboard</Typography.Title>
      <Row gutter={16}>
        <Col span={6} onClick={() => handlePostClick()}>
          <Statistic title="Total Posts" value={article.publish + article.draft + article.ready} />
        </Col>
        <Col span={6} onClick={() => handlePostClick('publish')}>
          <Statistic title="Published Posts" value={info.article.publish} />
        </Col>
        <Col span={6} onClick={() => handlePostClick('draft')}>
          <Statistic title="Draft Posts" value={info.article.draft} />
        </Col>
        <Col span={6} onClick={() => handlePostClick('ready')}>
          <Statistic title="Ready to publish Posts" value={info.article.ready} />
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={6}>
          <Statistic
            onClick={() => handleFactcheckClick()}
            title="Total Fact Checks"
            value={factCheck.publish + factCheck.draft + factCheck.ready}
          />
        </Col>
        <Col span={6} onClick={() => handleFactcheckClick('publish')}>
          <Statistic title="Published Fact Checks" value={info.factCheck.publish} />
        </Col>
        <Col span={6} onClick={() => handleFactcheckClick('draft')}>
          <Statistic title="Draft Fact Checks" value={info.factCheck.draft} />
        </Col>
        <Col span={6} onClick={() => handleFactcheckClick('ready')}>
          <Statistic title="Ready to publish Fact Checks" value={info.factCheck.ready} />
        </Col>
      </Row>
      {actions.includes('admin') ? <Features /> : null}
    </Space>
  );
}

export default Dashboard;
