import React from 'react';
import { Modal, Button, Radio, Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import MediaUploader from './UploadMedium';
import MediaList from './MediaList';
import { getMedium } from '../../actions/media';
import ImagePlaceholder from '../ErrorsAndImage/PlaceholderImage';
import { DeleteOutlined } from '@ant-design/icons';
import getMediumURLType from '../../utils/getMediumURLType';

function MediaSelector({
  value = null,
  onChange,
  maxWidth,
  containerStyles = {},
  profile = false,
}) {
  const [show, setShow] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const [tab, setTab] = React.useState('upload');
  const dispatch = useDispatch();

  const medium = useSelector((state) => {
    return state.media.details[value] || null;
  });
  const { media, loading } = useSelector((state) => {
    return { media: state.media, loading: state.media.loading };
  });
  const setValue = () => {
    value = null;
  };
  if (!selected && value && medium) {
    setSelected(medium);
  }
  React.useEffect(() => {
    if (value) {
      dispatch(getMedium(value, profile));
      setSelected(medium);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const onUpload = (values, medium) => {
    value = medium.id;
    setSelected(medium);
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
            Cancel
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
            <Radio.Button value="upload">Upload</Radio.Button>
            <Radio.Button value="library">Library</Radio.Button>
          </Radio.Group>
          {tab === 'library' ? (
            <MediaList
              onSelect={setSelected}
              selected={selected}
              onUnselect={setValue}
              profile={profile}
            />
          ) : tab === 'upload' ? (
            <MediaUploader onMediaUpload={onUpload} profile={profile} />
          ) : null}
        </Space>
      </Modal>
      <Space direction="vertical">
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            ...containerStyles,
          }}
        >
          <div style={{ position: 'relative' }}>
            <Button
              style={{
                background: 'transparent',
                borderStyle: 'dashed',
                height: 'auto',
                display: 'block',
              }}
              onClick={() => setShow(true)}
            >
              {medium ? (
                <img
                  src={medium.url?.[getMediumURLType()]}
                  alt={medium.alt_text}
                  width="100%"
                />
              ) : (
                <ImagePlaceholder maxWidth={maxWidth} />
              )}
            </Button>
            {medium && (
              <Button
                style={{ position: 'absolute', bottom: 0, left: 0, maxWidth: '52px' }}
                onClick={() => {
                  onChange(null);
                  setSelected(null);
                }}
              >
                <DeleteOutlined />
              </Button>
            )}
          </div>
        </div>
      </Space>
    </>
  );
}

export default MediaSelector;
