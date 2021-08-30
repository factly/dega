import React from 'react';
import { Row, Col, Button, Form, Select, Typography, Space } from 'antd';
import { useSelector, useDispatch } from 'react-redux';
import { reindex, reindexSpace } from '../../actions/meiliReindex';

const Reindex = () => {
  const { Title } = Typography;

  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [spaceOption, setSpaceOption] = React.useState();
  const [status, setStatus] = React.useState();

  const superOrg = useSelector(({ admin }) => {
    return admin.organisation;
  });

  const { orgId, orgs, spaces } = useSelector((state) => {
    const { selected, orgs, loading } = state.spaces;
    if (selected > 0) {
      const space = state.spaces.details[selected];
      const orgId = space.organisation_id;
      const org = orgs.find((org) => org.id === orgId);
      const role = org.permission.role;

      return {
        loading: loading,
        role: role,
        orgId: orgId,
        spaces: state.spaces.details,
        orgs: superOrg.is_admin ? state.spaces.orgs : [org],
      };
    }
    return { orgId: 0, orgs: [], spaces: [] };
  });
  const [organisationId, setOrganisationId] = React.useState(orgId);

  React.useEffect(() => {
    if (orgs.length > 0) {
      const org = orgs.find((org) => org.id === organisationId);
      const newSpaces = org.spaces.map((space) => spaces[space]);
      setSpaceOption(newSpaces);
    }
  }, [organisationId]);

  const handleorgChange = (orgId) => {
    form.setFieldsValue({
      space_id: null,
    });
    setOrganisationId(orgId);
  };
  const handleReindex = () => {
    dispatch(reindex());
  };
  const handleSpaceReindex = (id) => {
    if (id) {
      dispatch(reindexSpace(id));
    } else {
      setStatus('error');
    }
  };
  return (
    <Space direction="vertical">
      <Title level={3}>Reindex</Title>
      <Form form={form} name="reindex" layout="vertical">
        <Row justify="center" style={{ maxWidth: '1200px', width: '100%', margin: '0 auto' }}>
          <Col span={24}>
            <Row
              gutter={40}
              justify="space-around"
              style={{ background: '#f0f2f5', padding: '1.25rem', marginBottom: '1rem' }}
            >
              <Col span={12}>
                {orgs && orgs.length > 0 ? (
                  <Row gutter={40}>
                    <Col md={{ span: 16 }}>
                      <Form.Item name="organisation_id" label="Organisation">
                        <Select
                          allowClear
                          bordered
                          listHeight={128}
                          defaultValue={[orgId]}
                          onChange={(value) => handleorgChange(value)}
                        >
                          {orgs.map((item) => (
                            <Select.Option value={item.id} key={item.id}>
                              {item.title}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>
                ) : null}

                {spaceOption && spaceOption.length > 0 ? (
                  <Row gutter={40}>
                    <Col md={{ span: 16 }}>
                      <Form.Item name="space_id" label="Space" validateStatus={status}>
                        <Select
                          allowClear
                          bordered
                          listHeight={128}
                          defaultValue={[]}
                          placeholder="Select Space"
                          onChange={() => setStatus()}
                        >
                          {spaceOption.map((item) => (
                            <Select.Option value={item.id} key={item.id}>
                              {item.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col
                      md={{ span: 5 }}
                      style={{ alignItems: 'center', justifyContent: 'center', display: 'flex' }}
                    >
                      <Button
                        type="primary"
                        onClick={() => handleSpaceReindex(form.getFieldValue('space_id'))}
                      >
                        Reindex
                      </Button>
                    </Col>
                  </Row>
                ) : null}
                {superOrg.is_admin ? (
                  <Button type="primary" onClick={() => handleReindex()}>
                    Reindex Instance
                  </Button>
                ) : null}
              </Col>
            </Row>
          </Col>
        </Row>
      </Form>
    </Space>
  );
};

export default Reindex;
