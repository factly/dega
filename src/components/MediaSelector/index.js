import React from 'react';
import { Modal, Button, Radio, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import MediaUploader from './UploadMedium';
import MediaList from './MediaList';
import { getMedium, getMedia } from '../../actions/media';
import ImagePlaceholder from '../ErrorsAndImage/PlaceholderImage';

function MediaSelector({ value = null, onChange }) {
  const [show, setShow] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const [tab, setTab] = React.useState('list');
  const dispatch = useDispatch();

  const [mediumFetch, setMediumFetch] = React.useState(false);
  const [uploadedMedium, setUploadedMedium] = React.useState(null);

  const medium = useSelector((state) => {
    return state.media.details[value] || null;
  });
  const {media, loading} = useSelector((state) => {
    return {media : state.media, loading: state.media.loading };
  });
  const setValue = () => {
    value = null;
  };

  React.useEffect(() => {
    if (value) {
      dispatch(getMedium(value));
      setSelected(medium);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!loading && mediumFetch && uploadedMedium) {
    const fetchedId = media.req[0].data[0];
    const fetchedMedium = media.details[fetchedId];
    if (fetchedMedium.name === uploadedMedium.name) {
      value = fetchedId;
      setSelected(fetchedMedium);
      setMediumFetch(false);
      setUploadedMedium(null);
    }
  }

  React.useEffect(() => {
    if (mediumFetch && uploadedMedium) {
      dispatch(getMedia());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, mediumFetch, uploadedMedium]);

  const onUpload = (values) => {
    setMediumFetch(true);
    setUploadedMedium(values[0]);
  };

  return (
    <>
      <Modal
        visible={show}
        onCancel={() => setShow(false)}
        closable={false}
        width={'800px'}
        footer={[
          <Button key="back" onClick={() => setShow(false)}>
            Return
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={() => {
              setShow(false);
              selected ? onChange(selected.id) : onChange(null);
            }}
          >
            Ok
          </Button>,
        ]}
      >
        <Space direction="vertical">
          <Radio.Group buttonStyle="solid" value={tab} onChange={(e) => setTab(e.target.value)}>
            <Radio.Button value="list">List</Radio.Button>
            <Radio.Button value="upload">Upload</Radio.Button>
          </Radio.Group>
          {tab === 'list' ? (
            <MediaList onSelect={setSelected} selected={selected} onUnselect={setValue} />
          ) : tab === 'upload' ? (
            <MediaUploader onMediaUpload={onUpload} />
          ) : null}
        </Space>
      </Modal>
      <Space direction="vertical">
        {medium ? (
          <img src={medium.url?.proxy} alt={medium.alt_text} width="100%" />
        ) : (
          <ImagePlaceholder />
        )}
        <Button onClick={() => setShow(true)}>Select</Button>
      </Space>
    </>
  );
}

export default MediaSelector;
