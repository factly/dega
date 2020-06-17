import { PieChartOutlined, FileImageOutlined } from '@ant-design/icons';

//Pages
import Spaces from '../pages/spaces';
import Dashboard from '../pages/dashboard';
import SpaceCreate from '../pages/spaces/create';
import SpaceEdit from '../pages/spaces/edit';
import Media from '../pages/media';
import MediaEdit from '../pages/media/edit';

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
