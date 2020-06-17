import { PieChartOutlined, FileImageOutlined } from '@ant-design/icons';

//Pages
import Dashboard from '../pages/dashboard';

//Spaces
import Spaces from '../pages/spaces';
import SpaceCreate from '../pages/spaces/create';
import SpaceEdit from '../pages/spaces/edit';
import Media from '../pages/media';
import MediaEdit from '../pages/media/edit';

//Categories
import Categories from '../pages/categories';
import CreateCategory from '../pages/categories/create';
import EditCategory from '../pages/categories/edit';

//Tags
import Tags from '../pages/tags';
import CreateTag from '../pages/tags/create';
import EditTags from '../pages/tags/edit';

export default [
  {
    path: '/dashboard',
    Component: Dashboard,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Dashboard',
  },
  {
    path: '/spaces',
    Component: Spaces,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Spaces',
  },
  {
    path: '/spaces/create',
    Component: SpaceCreate,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Create Space',
  },
  {
    path: '/spaces/:id/edit',
    Component: SpaceEdit,
    enableNavigation: false,
    enableBreadcrumb: false,
    Icon: PieChartOutlined,
    title: 'Edit Space',
  },
  {
    path: '/categories',
    Component: Categories,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Categories',
  },
  {
    path: '/categories/create',
    Component: CreateCategory,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Create Category',
  },
  {
    path: '/categories/:id/edit',
    Component: EditCategory,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Edit Category',
  },
  {
    path: '/tags',
    Component: Tags,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Tags',
  },
  {
    path: '/tags/create',
    Component: CreateTag,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Create Tag',
  },
  {
    path: '/tags/:id/edit',
    Component: EditTags,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Edit Tag',
  },
  {
    path: '/media',
    Component: Media,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: FileImageOutlined,
    title: 'Media',
  },
  {
    path: '/media/:id/edit',
    Component: MediaEdit,
    enableNavigation: false,
    enableBreadcrumb: false,
    Icon: FileImageOutlined,
    title: 'Edit Media',
  },
];
