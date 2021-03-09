import React from 'react';
import Uppy from '@uppy/core';
import AwsS3 from '@uppy/aws-s3';
import GoogleDrive from '@uppy/google-drive';
import ImageEditor from '@uppy/image-editor';
import Url from '@uppy/url';
import { Dashboard } from '@uppy/react';
import { useSelector } from 'react-redux';
import '@uppy/core/dist/style.css';
import '@uppy/dashboard/dist/style.css';
import '@uppy/url/dist/style.css';
import '@uppy/image-editor/dist/style.css';
import { checker, maker } from '../../utils/sluger';

function UppyUploader({ onUpload, allowedFileTypes = ['image/*'] }) {
  const space_slug = useSelector((state) => state.spaces.details[state.spaces.selected].slug);
  const uppy = Uppy({
    id: 'uppy-media',
    meta: { type: 'avatar' },
    restrictions: {
      allowedFileTypes: allowedFileTypes,
    },
    autoProceed: false,
    onBeforeUpload: (files) => {
      const updatedFiles = {};

      Object.keys(files).forEach((fileID) => {
        const fileName = files[fileID].meta.name.replace(/\.[^/.]+$/, '');
        const name = checker.test(fileName) ? files[fileID].meta.name : maker(fileName);
        updatedFiles[fileID] = {
          ...files[fileID],
          file_name: name,
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
              name,
          },
        };
      });
      return updatedFiles;
    },
  })
    .use(AwsS3, { companionUrl: window.REACT_APP_COMPANION_URL })
    .use(Url, { companionUrl: window.REACT_APP_COMPANION_URL })
    .use(GoogleDrive, { companionUrl: window.REACT_APP_COMPANION_URL })
    .use(ImageEditor, {
      id: 'ImageEditor',

      cropperOptions: {
        viewMode: 1,
        background: true,
        autoCropArea: 1,
        responsive: true,
      },
      companionUrl: window.REACT_APP_COMPANION_URL,
    });
  uppy.on('file-added', (file) => {
    const data = file.data;
    const url = data.thumbnail ? data.thumbnail : URL.createObjectURL(data);
    const image = new Image();
    image.src = url;
    image.onload = () => {
      uppy.setFileMeta(file.id, { width: image.width, height: image.height });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
    };
  });
  uppy.on('complete', (result) => {
    const uploadList = result.successful.map((successful) => {
      const upload = {};
      const { meta } = successful;
      upload['alt_text'] = meta.alt_text ? meta.alt_text : successful.file_name;
      upload['caption'] = meta.caption;
      upload['description'] = meta.caption;
      upload['dimensions'] = `${meta.width}x${meta.height}`;
      upload['file_size'] = successful.size;
      upload['name'] = successful.file_name;
      upload['slug'] = successful.file_name;
      upload['title'] = meta.caption ? meta.caption : '';
      upload['type'] = meta.type;
      upload['url'] = {};
      upload['url']['raw'] = successful.uploadURL;
      return upload;
    });
    onUpload(uploadList);
  });
  return (
    <Dashboard
      uppy={uppy}
      plugins={['GoogleDrive', 'Url', 'ImageEditor']}
      metaFields={[
        { id: 'name', name: 'Name', placeholder: 'file name' },
        { id: 'caption', name: 'Caption', placeholder: 'describe what the image is about' },
        { id: 'alt_text', name: 'Alt Text', placeholder: 'describe what the image is content' },
      ]}
    />
  );
}

export default UppyUploader;
