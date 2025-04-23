import { useAppDispatch } from "../../hooks/reduxHooks";
import { createMedium } from "../../actions/media";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import UppyUploader from "../Uppy";

// Define proper types for the component
interface Medium {
  id: string;
  url: {
    proxy?: string;
    raw: string;
  };
  alt_text: string;
  [key: string]: any;
}

interface UploadMediumProps {
  onMediaUpload?: (values: any[], medium: Medium) => void;
  profile?: boolean;
}

function UploadMedium({ onMediaUpload, profile = false }: UploadMediumProps) {
  const history = useNavigation();
  const dispatch = useAppDispatch();

  const onUpload = (values: any[]) => {
    // When part of the MediaSelector, we need to handle the callback
    if (onMediaUpload) {
      dispatch(createMedium(values, profile)).then((medium: Medium) => {
        if (values.length === 1 || profile) {
          onMediaUpload(values, medium);
        }
      });
    } else {
      // When used as standalone upload page, redirect back to media list
      dispatch(createMedium(values)).then(() => history("/media"));
    }
  };

  // If being used as a standalone component (with Helmet), render the full page
  if (!onMediaUpload) {
    return (
      <>
        <Helmet title={"Upload Medium"} />
        <UppyUploader onUpload={onUpload} />
      </>
    );
  }

  // Otherwise, render just the uploader for use in MediaSelector
  return <UppyUploader onUpload={onUpload} profile={profile} />;
}

export default UploadMedium;
