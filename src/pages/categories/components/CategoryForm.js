import React, { useState } from 'react';
import { Button, Form, Input, Space, Switch } from 'antd';
import { maker, checker } from '../../../utils/sluger';
import MediaSelector from '../../../components/MediaSelector';
import Editor from '../../../components/Editor';
import JsonEditor from '../../../components/JsonEditor';
import Selector from '../../../components/Selector';
import MonacoEditor from '../../../components/MonacoEditor';

const layout = {
  labelCol: {
    span: 8,
  },
  wrapperCol: {
    span: 8,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 10,
    span: 14,
  },
};

const CategoryForm = ({ onCreate, data = {} }) => {
  if (data && data.meta_fields) {
    if (typeof data.meta_fields !== 'string') {      
      data.meta_fields = JSON.stringify(data.meta_fields)};
  }
  const [form] = Form.useForm();
  const [valueChange, setValueChange] = React.useState(false);
  const [jsonParseError, setJsonParseError] = React.useState(null);
  // const [jsonMsg, setJsonMsg] = React.useState('');
  const [jsonValidated, setJsonValidated] = React.useState(false);

  const [json, setJson] = useState();
  // const [json, setJson] = useState(
  //   data.meta_fields && Object.keys(data.meta_fields).length > 0
  //     ? data.meta_fields
  //     : {
  //         sample: 'testing',
  //       },
  // );

  const onReset = () => {
    form.resetFields();
  };

  const onTitleChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  const getJsonVal = (val) => {
    console.log('val',val)
    var jsonObj;
    try {
      console.log('enter')
      jsonObj = JSON.parse(val);
      setJsonParseError(null);
      setJsonValidated(true);    }
    catch (e) {
      console.log('error')
      setJsonParseError('error');
      return;
    }
    
    return jsonObj;
  };
  return (
    <Form
      {...layout}
      form={form}
      initialValues={{ ...data }}
      name="create-category"
      onFinish={(values) => {
        // if (values.meta_fields) {
        //   values.meta_fields = getJsonVal(values.meta_fields);
        // }

        console.log('jsonerr',jsonParseError,'validate',jsonValidated)
        if(jsonParseError === null && jsonValidated){
          console.log('no error')
          onCreate(values);
          onReset();
        } 
      }}
      onValuesChange={(changedValues) => {
        if(changedValues.meta_fields) {
          setJson(getJsonVal(changedValues.meta_fields))
        }
        setValueChange(true);
      }}
    >
      <Form.Item name="parent_id" label="Parent Category">
        <Selector action="Categories" />
      </Form.Item>
      <Form.Item
        name="name"
        label="Category"
        rules={[
          {
            required: true,
            message: 'Please enter the name!',
          },
          { min: 3, message: 'Name must be minimum 3 characters.' },
          { max: 50, message: 'Name must be maximum 50 characters.' },
        ]}
      >
        <Input onChange={(e) => onTitleChange(e.target.value)} />
      </Form.Item>
      <Form.Item
        name="slug"
        label="Slug"
        rules={[
          {
            required: true,
            message: 'Please input the slug!',
          },
          {
            pattern: checker,
            message: 'Please enter valid slug!',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="Featured Image" name="medium_id">
        <MediaSelector />
      </Form.Item>
      <Form.Item label="Featured" name="is_featured" valuePropName="checked">
        <Switch />
      </Form.Item>
      <Form.Item name="description" label="Description">
        <Editor style={{ width: '600px' }} placeholder="Enter Description..." basic={true} />
      </Form.Item>
      {/* <Form.Item name="meta_fields" label="Metafields">
        <JsonEditor json={json} onChangeJSON={(data) => setJson(data)} />
      </Form.Item> */}
      <Form.Item
        name="meta_fields"
        label="Metafields"
        hasFeedback
        validateStatus={!jsonParseError ? "" : jsonParseError}
        help={jsonParseError ? `Unnecessary  token ' , ' at end ` : ''}
        // rules={[
        //   ({ getFieldValue }) => ({
        //     validator(rule, value) {
        //       if (jsonParseError === 'error') {
        //         return Promise.reject(jsonMsg);
        //       }
        //       return Promise.resolve();
        //     },
        //   }),
        // ]}
      >
        <MonacoEditor />
      </Form.Item>
      <Form.Item {...tailLayout}>
        <Space>
          <Button disabled={!valueChange} type="primary" htmlType="submit">
            {data && data.id ? 'Update' : 'Submit'}
          </Button>
          <Button htmlType="button" onClick={onReset}>
            Reset
          </Button>
        </Space>
      </Form.Item>
    </Form>
  );
};

export default CategoryForm;
