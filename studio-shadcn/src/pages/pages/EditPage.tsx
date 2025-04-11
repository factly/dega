import React from 'react';
import PageEditForm from '../posts/components/PostForm';
import { useSelector } from 'react-redux';
import { useAppDispatch } from "@/hooks/reduxHooks";
import { Skeleton } from '@/components/ui/skeleton';
import { updatePage, getPage } from '../../actions/pages';
import { useParams } from 'react-router-dom';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import getUserPermission from '../../utils/getUserPermission';
import { Helmet } from 'react-helmet';
import useNavigation from '../../utils/useNavigation';
import { RootState } from '../../store/index';
import { Page, Format } from "./types";

interface EditPageProps {
  formats: {
    article: Format;
  };
}

interface Space {
  // Define your space interface structure
  [key: string]: any;
}

function EditPage({ formats }: EditPageProps): React.ReactElement {
  const dispatch = useAppDispatch();
  const history = useNavigation();
  const { id } = useParams<{ id: string }>();
  const spaces = useSelector((state: RootState) => state.spaces);
  const actions = getUserPermission({ resource: 'pages', action: 'get', spaces });


  const { page, loading } = useSelector((state: RootState) => {
    return {
      page: state.pages.details[id as string] ? state.pages.details[id as string] : null,
      loading: state.pages.loading,
    };
  });

  React.useEffect(() => {
    if (id && !Number.isNaN(Number(id))) {
      dispatch(getPage((Number(id))));
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

  const onUpdate = (values: Partial<Page>) => {
    // Specify Promise<void> explicitly
    const promisifiedDispatch = () => {
      return new Promise<void>((resolve) => {
        dispatch(updatePage({ ...page, ...values }));
        // Now TypeScript knows this is a Promise that resolves with no value
        resolve();
      });
    };

    promisifiedDispatch().then(() => {
      history(`/pages/${id}/edit`);
    });
  };

  return (
    <>
      <Helmet title={`${page?.title} - Edit Page`} />
      <PageEditForm
        data={page}
        onCreate={onUpdate}
        // actions={actions}
        format={formats.article}
        page={true}
      />
    </>
  );
}

export default EditPage;
