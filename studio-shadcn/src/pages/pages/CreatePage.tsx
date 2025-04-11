import PageForm from '../posts/components/PostForm';
import { addPage } from '../../actions/pages';
import FormatNotFound from '../../components/ErrorsAndImage/RecordNotFound';
import { useAppDispatch } from "@/hooks/reduxHooks";

import { Helmet } from 'react-helmet';
import useNavigation from '../../utils/useNavigation';
import { Page } from './types';

interface Format {
  id: number;
  name: string;
}

interface FormatState {
  loading: boolean;
  article: Format | null;
}

interface Space {
  id: number;
  name: string;
  permissions: string[];
}

interface RootState {
  spaces: Space[];
}

interface CreatePageProps {
  formats: FormatState;
}


function CreatePage({ formats }: CreatePageProps): React.ReactElement {
  const history = useNavigation();
  const dispatch = useAppDispatch();


  const onCreate = (values: Page): void => {
    // @ts-expect-error TODO: Fix this type error
    dispatch(addPage(values)).then((page: { id: number } | undefined) => {
      if (page && page.id) history(`/pages/${page.id}/edit`);
    });
  };

  if (!formats.loading && formats.article) {
    return (
      <>
        <Helmet title={'Create Page'} />
        <PageForm onCreate={onCreate}  page={true} format={formats.article} />
      </>
    );
  }

  return <FormatNotFound status="info" title="Article format not found" link="/formats" />;
}

export default CreatePage;
