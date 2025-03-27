import React from 'react';
import PageEditForm from '../posts/components/PostForm';
import { useDispatch, useSelector } from 'react-redux';
import { Skeleton } from '@/components/ui/skeleton';
import { updatePage, getPage } from '../../actions/pages';
import { useParams } from 'react-router-dom';
import RecordNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import getUserPermission from '../../utils/getUserPermission';
import { Helmet } from 'react-helmet';
import useNavigation from '../../utils/useNavigation';
import { RootState } from '../../store/index';

interface Format {
  article: any; // Update with proper type when available
}

interface EditPageProps {
  formats: {
    article: Format;
  };
}

interface Page {
  id: number | string;
  title: string;
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
  const actions = getUserPermission({ resource: 'pages', action: 'get', spaces });

  const dispatch = useDispatch();

  const { page, loading } = useSelector((state: RootState) => {
    return {
      page: state.pages.details[id as string] ? state.pages.details[id as string] : null,
      loading: state.pages.loading,
    };
  });

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
        format={formats.article}
        page={true}
      />
    </>
  );
}

export default EditPage;