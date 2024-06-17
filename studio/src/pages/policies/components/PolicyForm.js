import React from 'react';
import { Row, Col, Form, Input, Button, Checkbox, Divider, Typography, ConfigProvider } from 'antd';
import Selector from '../../../components/Selector';
import { TitleInput } from '../../../components/FormItems';

const options = [
  { label: 'Read', value: 'get' },
  { label: 'Create', value: 'create' },
  { label: 'Update', value: 'update' },
  { label: 'Delete', value: 'delete' },
];

const entities = [
  {
    name: 'posts',
    label: 'Posts',
    options: [...options, { label: 'Publish', value: 'publish' }],
  },
  {
    name: 'categories',
    label: 'Categories',
    options: options,
  },
  {
    name: 'tags',
    label: 'Tags',
    options: options,
  },
  {
    name: 'formats',
    label: 'Formats',
    options: options,
  },
  {
    name: 'media',
    label: 'Media',
    options: options,
  },
  {
    name: 'fact-checks',
    label: 'Fact Check',
    options: options,
  },
  {
    name: 'claims',
    label: 'Claims',
    options: options,
  },
  {
    name: 'claimants',
    label: 'Claimants',
    options: options,
  },
  {
    name: 'ratings',
    label: 'Ratings',
    options: options,
  },
  {
    name: 'policies',
    label: 'Policies',
    options: options,
  },
  {
    name: 'podcasts',
    label: 'Podcasts',
    options: options,
  },
  {
    name: 'episodes',
    label: 'Episodes',
    options: options,
  },
  {
    name: 'menus',
    label: 'Menus',
    options: options,
  },
  {
    name: 'pages',
    label: 'Pages',
    options: options,
  },
  {
    name: 'webhooks',
    label: 'Webhooks',
    options: options,
  },
];
const dependencies = {
  posts: ['categories', 'tags', 'media'],
  categories: ['media'],
  tags: ['media'],
  formats: ['media'],
  factchecks: ['categories', 'tags', 'media', 'claims'],
  claims: ['claimants', 'ratings'],
  claimants: ['media'],
  ratings: ['media'],
  policies: [],
  podcasts: ['categories', 'media'],
  episodes: ['podcasts', 'media'],
  menus: [],
  pages: ['categories', 'tags', 'media'],
  webhooks: ['podcasts'],
};

function PolicyForm({ data = {}, onCreate }) {
  const [form] = Form.useForm();
  const [valueChange, setValueChange] = React.useState(false);
  const [isMobileScreen, setIsMobileScreen] = React.useState(false);
  const [checkedValues, setCheckedValues] = React.useState({});

  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobileScreen(true);
      } else {
        setIsMobileScreen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const updateDependencies = (newState, entityName) => {
    if (dependencies[entityName]) {
      dependencies[entityName].forEach((dependency) => {
        newState[dependency] = Array.from(new Set([...(newState[dependency] || []), 'get']));
        updateDependencies(newState, dependency);
      });
    }
  };

  const handleCheckboxChange = (newCheckedValues, entityName) => {
    let updatedCheckedValues = [...newCheckedValues];

    if (
      newCheckedValues.includes('create') ||
      newCheckedValues.includes('update') ||
      newCheckedValues.includes('delete') ||
      newCheckedValues.includes('publish')
    ) {
      updatedCheckedValues = Array.from(new Set([...newCheckedValues, 'get']));
    }

    setCheckedValues((prevState) => {
      const newState = {
        ...prevState,
        [entityName]: updatedCheckedValues,
      };

      updateDependencies(newState, entityName);

      return newState;
    });

    setValueChange(true);
  };
  return (
    <ConfigProvider
      theme={{
        components: {
          Form: {
            marginLG: 12,
          },
          Checkbox: {
            marginXS: 0,
          },
        },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={data}
        name="create-policy"
        style={{ maxWidth: '100%', width: '100%' }}
        onFinish={(values) =>
          onCreate({
            ...values,
            permissions: Object.keys(values.permissions)
              .filter((key) => values.permissions[key] && values.permissions[key].length > 0)
              .map((key) => ({ resource: key, actions: values.permissions[key] })),
          })
        }
        onValuesChange={() => {
          setValueChange(true);
        }}
      >
        <Row justify={'end'}>
          <Col>
            <Button disabled={!valueChange} type="primary" htmlType="submit">
              {data && data.id ? 'Update' : 'Submit'}
            </Button>
          </Col>
        </Row>
        <Row justify={'space-between'}>
          <Col md={10} xs={24}>
            <TitleInput label="Name" name="name" />
            <Form.Item name="roles" label="Roles" required={true}>
              <Selector mode="multiple" display={'name'} action="Roles" />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={4} />
            </Form.Item>
          </Col>
          <Col
            md={12}
            xs={24}
            style={{
              background: isMobileScreen || '#F9FAFB',
              padding: isMobileScreen || '20px 35px',
              borderRadius: isMobileScreen || '6px',
            }}
          >
            <Typography.Title level={5} strong>
              Authorization
            </Typography.Title>
            <Divider style={{ margin: '14 0' }} />
            {entities.map((entity, index) => (
              <Form.Item key={'permissions-' + index} name={['permissions', entity.name]}>
                <Row gutter={[16, 8]}>
                  <Col md={6} xs={24}>
                    <Typography.Text>{entity.label}</Typography.Text>
                  </Col>
                  <Col md={18} xs={24}>
                    <Checkbox.Group
                      style={{ flexWrap: 'wrap', justifyContent: 'space-between' }}
                      value={checkedValues[entity.name] || []}
                      options={entity.options}
                      onChange={(checkedValues) => handleCheckboxChange(checkedValues, entity.name)}
                    />
                  </Col>
                </Row>
              </Form.Item>
            ))}
          </Col>
        </Row>
      </Form>
    </ConfigProvider>
  );
}

export default PolicyForm;
