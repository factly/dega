import React from 'react';
import { Card, Form, Input, Button, DatePicker, Radio } from 'antd';
import moment from 'moment';
import MediaSelector from '../../components/MediaSelector';
import { maker, checker } from '../../utils/sluger';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile, updateProfile } from '../../actions/profile';

const layout = {
  labelCol: {
    span: 7,
  },
  wrapperCol: {
    span: 16,
  },
};
const tailLayout = {
  wrapperCol: {
    offset: 3,
    span: 17,
  },
};
function Profile() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [valueChange, setValueChange] = React.useState(false);

  const { profile, loading } = useSelector((state) => {
    return {
      profile: state.profile.details ? state.profile.details : null,
      loading: state.profile.loading,
    };
  });

  React.useEffect(() => {
    dispatch(getUserProfile());
  }, [dispatch]);

  const update = (values) => {
    values.birth_date = values.birth_date
      ? moment(values.birth_date).format('YYYY-MM-DDTHH:mm:ssZ')
      : null;
    dispatch(updateProfile(values));
  };

  const onNameChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  return (
    <div className="content">
      <Card title="Update Profile" loading={loading}>
        <Form
          {...layout}
          form={form}
          name="update_profile"
          onFinish={update}
          initialValues={{
            ...profile,
            birth_date: profile && profile.birth_date ? moment(profile.birth_date) : null,
          }}
          onValuesChange={(changedValues, allValues) => {
            setValueChange(true);
          }}
        >
          <div style={{ float: 'right', height: 600, width: 600 }}>
            <Form.Item name="featured_medium_id">
              <MediaSelector profile={true} />
            </Form.Item>
          </div>
          <div style={{ float: 'left', width: 500 }}>
            <Form.Item
              label="First Name"
              name="first_name"
              rules={[{ required: true, message: 'Please input your first name!' }]}
            >
              <Input placeholder="First Name" />
            </Form.Item>
            <Form.Item
              label="Last Name"
              name="last_name"
              rules={[{ required: true, message: 'Please input your last name!' }]}
            >
              <Input placeholder="Last name" />
            </Form.Item>
            <Form.Item name="display_name" label="Display Name">
              <Input placeholder="Display name" onChange={(e) => onNameChange(e.target.value)} />
            </Form.Item>
            <Form.Item
              label="Slug"
              name="slug"
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
              <Input placeholder="slug" />
            </Form.Item>
            <Form.Item
              label="Birthdate"
              name="birth_date"
              rules={[{ type: 'object', required: true, message: 'Please select time!' }]}
            >
              <DatePicker />
            </Form.Item>
            <Form.Item label="Gender" name="gender">
              <Radio.Group>
                <Radio.Button value="male">Male</Radio.Button>
                <Radio.Button value="female">Female</Radio.Button>
                <Radio.Button value="other">Other</Radio.Button>
              </Radio.Group>
            </Form.Item>
            <Form.Item label="Facebook Url" name={['social_media_urls', 'facebook']}>
              <Input placeholder="Facebook url" />
            </Form.Item>
            <Form.Item label="Twitter Url" name={['social_media_urls', 'twitter']}>
              <Input placeholder="Twitter url" />
            </Form.Item>
            <Form.Item label="LinkedIn Url" name={['social_media_urls', 'linkedin']}>
              <Input placeholder="LinkedIn url" />
            </Form.Item>
            <Form.Item label="Instagram Url" name={['social_media_urls', 'instagram']}>
              <Input placeholder="Instagram url" />
            </Form.Item>
            <Form.Item label="Description" name="description">
              <Input.TextArea placeholder="Description" autoSize={{ minRows: 2, maxRows: 6 }} />
            </Form.Item>
            <Form.Item {...tailLayout}>
              <Button
                disabled={!valueChange}
                form="update_profile"
                type="primary"
                htmlType="submit"
                block
              >
                Update
              </Button>
            </Form.Item>
          </div>
        </Form>
      </Card>
    </div>
  );
}

export default Profile;
