import React, { useEffect, useState } from 'react';
import { Card, Form, Input, Button, DatePicker, Radio, Row, Col, message } from 'antd';
import dayjs from 'dayjs';
import MediaSelector from '../../components/MediaSelector';
import { maker } from '../../utils/sluger';
import { useDispatch, useSelector } from 'react-redux';
import { getUserProfile } from '../../actions/profile';
import { SlugInput } from '../../components/FormItems';
import { Helmet } from 'react-helmet';

function Profile() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [valueChange, setValueChange] = useState(false);

  const { profile, loading } = useSelector((state) => ({
    profile: state.profile.details || null,
    loading: state.profile.loading,
  }));


  const updateZitadelProfile = async (values) => {
    try {
      const userId = localStorage.getItem('userId');
      const apiUrl = `${window.REACT_APP_ZITADEL_AUTHORITY}/v2/users/human/${userId}`;

      const zitadelData = {
        profile: {
          givenName: values.first_name,
          familyName: values.last_name,
          displayName: values.display_name,
          gender: values.gender.toUpperCase(),
        },
        metadata: {
          birth_date: values.birth_date ? dayjs(values.birth_date).format('YYYY-MM-DD') : null,
          social_media_urls: values.social_media_urls,
          description: values.description,
          featured_medium_id: values.featured_medium_id,
          slug: values.slug,
        },
      };

      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${window.REACT_APP_ZITADEL_PAT}`,
        },
        body: JSON.stringify(zitadelData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.message ? errorData.message.split('(')[0].trim() : 'Failed to update profile';
        throw new Error(errorMessage);
      }

      message.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error(error.message || 'Failed to update profile. Please try again.');
    }
  };

  const onFinish = (values) => {
    updateZitadelProfile(values);
  };

  const onNameChange = (string) => {
    form.setFieldsValue({
      slug: maker(string),
    });
  };

  return (
    <div className="content">
      <Helmet title={'Profile'} />
      <Card title="Update Profile" loading={loading}>
        <Form
          form={form}
          name="update_profile"
          style={{ padding: '34px 25px', background: '#F9FAFB' }}
          onFinish={onFinish}
          initialValues={{
            ...profile,
            birth_date: profile && profile.birth_date ? dayjs(profile.birth_date) : null,
          }}
          onValuesChange={() => setValueChange(true)}
        >
          <Row justify={'end'}>
            <Button disabled={!valueChange} form="update_profile" type="primary" htmlType="submit">
              Update
            </Button>
          </Row>
          <Row gutter={56}>
            <Col md={6} xs={24}>
              <Form.Item name="featured_medium_id">
                <MediaSelector profile={true} />
              </Form.Item>
            </Col>
            <Col md={10} xs={24}>
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
              <SlugInput inputProps={{ placeholder: 'slug' }} />
              <Form.Item
                label="Birthdate"
                name="birth_date"
                rules={[{ type: 'object', required: true, message: 'Please select time!' }]}
              >
                <DatePicker />
              </Form.Item>
              <Form.Item label="Gender" name="gender">
                <Radio.Group>
                  <Radio.Button value="GENDER_MALE">Male</Radio.Button>
                  <Radio.Button value="GENDER_FEMALE">Female</Radio.Button>
                  <Radio.Button value="GENDER_DIVERSE">Other</Radio.Button>
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
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
}

export default Profile;