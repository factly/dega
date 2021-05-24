import React from 'react';
import { Space, Button } from 'antd';
import { Link } from 'react-router-dom';
import getUserPermission from '../../utils/getUserPermission';
import { useSelector } from 'react-redux';
import FactCheckList from '../../components/List';
import FormatNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { useLocation } from 'react-router-dom';

function FactCheck({ formats }) {
  const spaces = useSelector(({ spaces }) => spaces);
  const actions = getUserPermission({ resource: 'fact-checks', action: 'get', spaces });
  let query = new URLSearchParams(useLocation().search);
  const status = query.get('status');

  if (!formats.loading && formats.factcheck)
    return (
      <Space direction="vertical">
        <Link to="/fact-checks/create">
          <Button disabled={!(actions.includes('admin') || actions.includes('create'))}>
            Create New
          </Button>
        </Link>
        <FactCheckList actions={actions} format={formats.factcheck} status={status} />
      </Space>
    );

  return (
    <FormatNotFound status="info" title="Fact-Check format not found" link="/formats/create" />
  );
}

export default FactCheck;
