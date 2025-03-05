import { useEffect } from "react";
import FormatEditForm from "./components/FormatForm";
import { useSelector } from "react-redux";
import { updateFormat, getFormat } from "../../actions/formats";
import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAppDispatch } from "@/hooks/reduxHooks";

// Define types for the format and state
interface Format {
  id: string;
  name: string;
  [key: string]: any; // For other properties in format
}

interface RootState {
  formats: {
    details: {
      [key: string]: Format;
    };
    loading: boolean;
  };
}

function EditFormat(): React.ReactElement {
  const history = useNavigation();
  const { id } = useParams<{ id: string }>();

  const dispatch = useAppDispatch();
  const { format, loading } = useSelector((state: RootState) => {
    return {
      format:
        id && state.formats.details[id] ? state.formats.details[id] : null,
      loading: state.formats.loading,
    };
  });

  useEffect(() => {
    if (id) {
      dispatch(getFormat(id));
    }
  }, [dispatch, id]);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!format) {
    return <RecordNotFound />;
  }

  const onUpdate = (values: Partial<Format>): void => {
    if (id) {
      dispatch(updateFormat({ ...format, ...values }));
      history(`/settings/advanced/formats/${id}/edit`);
    } else {
      // Handle the case where id is undefined (shouldn't happen with proper routing)
      console.error("Format ID is undefined");

      // Show an error alert instead of silently failing
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Unable to update format. Format ID is missing.
          </AlertDescription>
        </Alert>
      );
    }
  };

  return (
    <>
      <Helmet title={`${format?.name} - Edit Format`} />
      <FormatEditForm data={format} onCreate={onUpdate} />
    </>
  );
}

export default EditFormat;
