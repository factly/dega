import { useEffect } from "react";
import FormatEditForm from "./components/FormatForm";
import { useSelector } from "react-redux";
import { updateFormat, getFormat } from "../../actions/formats";
import { useParams } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { Format, FormatFormValues, RootState } from "./types";

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

  const onUpdate = (values: FormatFormValues): void => {
    if (id) {
      const updatedFormat: Format = {
        ...format,
        ...values,
        id: format.id,
      };

      dispatch(updateFormat(updatedFormat));
      history(`/settings/advanced/formats/${id}/edit`);
    } else {
      console.error("Format ID is undefined");
      return;
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
