import React, { useState, useEffect, useRef } from "react";
import PageEditForm from "../posts/components/PostForm";
import { useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
import { updatePage, getPage } from "../../actions/pages";
import { useParams } from "react-router-dom";
import RecordNotFound from "../../components/ErrorsAndImage/RecordNotFound";
import getUserPermission from "../../utils/getUserPermission";
import { Helmet } from "react-helmet";
import useNavigation from "../../utils/useNavigation";
import { useAppDispatch } from "@/hooks/reduxHooks";
import { RootState } from "../../store/index";

interface Format {
  id: string;
  slug: string;
  [key: string]: any;
}

interface EditPageProps {
  formats: {
    article: Format | null;
    loading: boolean;
  };
}

interface Page {
  id: number | string;
  title: string;
  format: string;
  [key: string]: any; // For other page properties
}

interface Space {
  // Define your space interface structure
  [key: string]: any;
}

function EditPage({ formats }: EditPageProps): JSX.Element {
  const history = useNavigation();
  const { id } = useParams<{ id: string }>();
  const spaces = useSelector((state: RootState) => state.spaces) as Space[];
  const actions = getUserPermission({
    resource: "pages",
    action: "get",
    spaces,
  });
  const [cachedFormat, setCachedFormat] = useState<Format | null>(null);

  const dispatch = useAppDispatch();

  const { page, loading } = useSelector((state: RootState) => {
    return {
      page: state.pages.details[id as string]
        ? state.pages.details[id as string]
        : null,
      loading: state.pages.loading,
    };
  });

  // Check for cached formats on component mount
  useEffect(() => {
    try {
      const savedFormats = localStorage.getItem("cachedFormats");
      if (savedFormats) {
        const parsedFormats = JSON.parse(savedFormats);
        if (parsedFormats.article) {
          setCachedFormat(parsedFormats.article);
        }
      }
    } catch (error) {
      console.error("Error checking cached formats:", error);
    }
  }, []);

  React.useEffect(() => {
    if (id) {
      dispatch(getPage(id));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-12 w-3/4" />
      </div>
    );
  }

  if (!page) {
    return <RecordNotFound />;
  }

  // Use either the format from props or cached format
  const formatToUse = formats.article || cachedFormat;

  // Check if format is available
  if (!formatToUse) {
    return (
      <RecordNotFound
        status="info"
        title="Article format not found"
        link="/formats"
      />
    );
  }

  const onUpdate = (values: Partial<Page>) => {
    dispatch(updatePage({ ...page, ...values })).then(() => {
      history(`/pages/${id}/edit`);
    });
  };

  return (
    <>
      <Helmet title={`${page?.title} - Edit Page`} />
      <PageEditForm
        data={page}
        onCreate={onUpdate}
        actions={actions}
        format={formatToUse}
        page={true}
      />
    </>
  );
}

export default EditPage;
