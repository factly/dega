import { useAppDispatch } from "../../hooks/reduxHooks";
import { createMedium } from "../../actions/media";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import UppyUploader from "../../components/Uppy";

// Types
interface UploadItem {
  alt_text: string;
  caption?: string;
  description?: string;
  dimensions: string;
  file_size: number;
  name: string;
  slug: string;
  title: string;
  type: string;
  url: {
    raw: string;
  };
}

function UploadMedium(): JSX.Element {
  const history = useNavigation();
  const dispatch = useAppDispatch();

  /**
   * Handles the upload completion and redirects to media page
   *
   * @param values - The values from the UppyUploader component
   */
  const onUpload = (values: UploadItem[]): void => {
    // Make sure we're passing an array of upload items
    dispatch(createMedium(values)).then(() => history("/media"));
  };

  return (
    <>
      <Helmet title={"Upload Medium"} />
      <UppyUploader onUpload={onUpload} />
    </>
  );
}

export default UploadMedium;
