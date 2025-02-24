import { useDispatch } from 'react-redux';
// import UppyUploader from '../Uppy';
import { createMedium } from '../../actions/media';

interface Medium {
  id: string;
  url: {
    proxy?: string;
    raw: string;
  };
  alt_text: string;
}

interface UploadMediumProps {
  onMediaUpload: (values: any[], medium: Medium) => void;
  profile?: boolean;
}

function UploadMedium({ onMediaUpload, profile = false }: UploadMediumProps) {
  const dispatch = useDispatch();

  const onUpload = (values: any[]) => {
    dispatch(createMedium(values, profile) as any).then((medium: Medium) => {
      if (values.length === 1 || profile) {
        onMediaUpload(values, medium);
      }
    });
  };

//   return <UppyUploader onUpload={onUpload} profile={profile} />;
}

export default UploadMedium;