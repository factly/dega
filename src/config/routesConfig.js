import { PieChartOutlined } from '@ant-design/icons';

//Pages
import Spaces from '../pages/spaces';
import Dashboard from '../pages/dashboard';
import CreateSpace from '../pages/spaces/create';

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
    Component: CreateSpace,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Create Space',
  },
];
