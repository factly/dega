import React from 'react';
import { Form } from 'antd';
import axios from 'axios';
import { RATINGS_API } from '../../constants/ratings';
import { CLAIMANTS_API } from '../../constants/claimants';
import { CLAIMS_API } from '../../constants/claims';
import { ScooterCore as Editor } from "@factly/scooter-core";
import { MEDIA_API } from '../../constants/media';
import { useSelector } from 'react-redux';

const DescriptionInput = ({
  name = 'description',
  label = 'Description',
  noLabel = false,
  onChange = () => {},
  inputProps,
  formItemProps,
  initialValue,
  rows,
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
        rows={rows ? rows : 10}
        {...inputProps}
        initialValue={initialValue}
        uploadEndpoint={window.REACT_APP_COMPANION_URL}
        iframelyEndpoint={window.REACT_APP_IFRAMELY_URL}
        meta = {{
          claims: {
            1: { id: 1, claim: "Claim 1", fact: "Fact 1" },
            2: { id: 2, claim: "Claim 2", fact: "Fact 2" },
            3: { id: 3, claim: "Claim 3", fact: "Fact 3" },
            4: { id: 4, claim: "Claim 4", fact: "Fact 4" }
          }
        }}
        claimConfig={{
          ratingsFetcher : (page=1) => {
            return axios
            .get(RATINGS_API, {
              params: { page: page, limit: 10 },
            }).then((res) => {console.log(res.data); return res.data})
          },
          claimantsFetcher : (page=1) => {
            return axios
            .get(CLAIMANTS_API, {
              params: { page: page, limit: 10 },
            }).then((res) => {console.log(res.data); return res.data})
          },
          claimsFetcher : (searchTerm, page=1 , limit=10 , sort = 'desc' ) => {
            const params = new URLSearchParams();
            params.append('q', searchTerm);
            params.append('page', page);
            params.append('limit', limit);
            params.append('sort', sort);
            return axios
                   .get( CLAIMS_API , { params: params})
                   .then((res) => {console.log(res.data); return res.data})
          },
          addClaim : (values) => {
            function convertIdsToNumbers(obj) {
              for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                  if (!isNaN(obj[key])) {
                    obj[key] = Number(obj[key]);
                  }
                }
              }
              return obj;
            }
            return axios
            .post(CLAIMS_API, convertIdsToNumbers(values))
            .then((res) => {console.log(res.data); return res.data})
         },
       }}
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
