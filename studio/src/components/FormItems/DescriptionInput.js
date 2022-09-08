import React from 'react';
import { Form } from 'antd';
import axios from 'axios';
// import Editor from '../Editor';
import { Editor } from '@factly/scooter';
import { MEDIA_API } from '../../constants/media';
import { useSelector } from 'react-redux';

const DescriptionInput = ({
  name = 'description',
  label = 'Description',
  noLabel = false,
  onChange = (data) => console.log({ data }),
  inputProps,
  formItemProps,
  initialValue,
}) => {
  const space_slug = useSelector((state) => {
    return state.spaces.details[state.spaces.selected]?.slug;
  });

  inputProps = { ...inputProps, onChange };
  formItemProps = noLabel ? formItemProps : { ...formItemProps, label };

  return (
    <Form.Item name={name} {...formItemProps}>
      {/* <Editor {...inputProps} /> */}
      <Editor
        menuType="bubble"
        heightStrategy="flexible"
        rows={20}
        onChange={({ json, html }) => console.log()}
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
        onFileAdded={(file) => {
          const data = file.data;
          const url = data.thumbnail ? data.thumbnail : URL.createObjectURL(data);
          const image = new Image();
          image.src = url;
          image.onload = () => {
            // uppy.setFileMeta(file.id, { width: image.width, height: image.height });
            URL.revokeObjectURL(url);
          };
          image.onerror = () => {
            URL.revokeObjectURL(url);
          };
        }}
        onUploadComplete={(result) => {
          const successful = result.successful[0];
          const { meta } = successful;
          const upload = {};
          upload['alt_text'] = meta.caption;
          upload['caption'] = meta.caption;
          upload['description'] = meta.caption;
          upload['dimensions'] = `${meta.width}x${meta.height}`;
          upload['file_size'] = successful.size;
          upload['name'] = successful.fileName;
          upload['slug'] = successful.response.body.key;
          upload['title'] = meta.caption ? meta.caption : ' ';
          upload['type'] = successful.meta.type;
          upload['url'] = {};
          upload['url']['raw'] = successful.uploadURL;

          axios.post(MEDIA_API, [upload]).catch((error) => {
            console.error(error);
          });
        }}
        uploadConfig={{
          restrictions: {
            maxFileSize: 5242880,
            allowedFileTypes: ['.jpg', '.jpeg', '.png', '.gif'],
          },
          onBeforeUpload: (files) => {
            const updatedFiles = {};

            Object.keys(files).forEach((fileID) => {
              updatedFiles[fileID] = {
                ...files[fileID],
                fileName: files[fileID].meta.name,
                meta: {
                  ...files[fileID].meta,
                  name:
                    space_slug +
                    '/' +
                    new Date().getFullYear() +
                    '/' +
                    new Date().getMonth() +
                    '/' +
                    Date.now().toString() +
                    '_' +
                    files[fileID].meta.name,
                },
              };
            });
            return updatedFiles;
          },
        }}
      />
    </Form.Item>
  );
};

export default DescriptionInput;
