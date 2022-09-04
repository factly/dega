import React from 'react';
import { Form } from 'antd';
import axios from 'axios';
// import Editor from '../Editor';
import { Editor } from '@factly/scooter';
import { MEDIA_API } from '../../constants/media';

const DescriptionInput = ({
  name = 'description',
  label = 'Description',
  noLabel = false,
  onChange = (data) => console.log({ data }),
  inputProps,
  formItemProps,
  initialValue,
}) => {
  inputProps = { ...inputProps, onChange };
  formItemProps = noLabel ? formItemProps : { ...formItemProps, label };

  return (
    <Form.Item name={name} {...formItemProps}>
      {/* <Editor {...inputProps} /> */}
      <Editor
        menuType="bubble"
        heightStrategy="flexible"
        rows={20}
        onChange={({ json, html }) => console.log({ json, html })}
        {...inputProps}
        initialValue={initialValue}
        uploadEndpoint={window.REACT_APP_COMPANION_URL}
        iframelyEndpoint={window.REACT_APP_IFRAMELY_URL}
        imagesFetcher={(currentPage) =>
          axios
            .get(MEDIA_API, {
              params: { page: currentPage, limit: 12 },
            })
            .then((res) => res.data)
        }
      />
    </Form.Item>
  );
};

export default DescriptionInput;
