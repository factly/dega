import React, { useState } from "react";
import { useAppDispatch } from "../../hooks/reduxHooks";
import { createMedium } from "../../actions/media";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import UppyUploader from "../../components/Uppy";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import Loader from "@/components/Loader";

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

function UploadMedium(): React.ReactElement {
  const navigate = useNavigation();
  const dispatch = useAppDispatch();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onUpload = (values: UploadItem[]): void => {
    if (!values || values.length === 0) {
      setError("No files were uploaded. Please try again.");
      return;
    }

    setIsUploading(true);
    setError(null);

    // Make sure we're passing an array of upload items
    dispatch(createMedium(values))
      .then(() => {
        // Force a small delay to ensure backend processes the upload
        setTimeout(() => {
          // Reset the Redux media state completely
          navigate("/media");
        }, 500);
      })
      .catch((err) => {
        setError(err?.message || "Upload failed. Please try again.");
      })
      .finally(() => {
        setIsUploading(false);
      });
  };

  return (
    <>
      <Helmet title={"Upload Medium"} />

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Upload Media</h2>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isUploading ? <Loader /> : <UppyUploader onUpload={onUpload} />}
      </div>
    </>
  );
}

export default UploadMedium;
