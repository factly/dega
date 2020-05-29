import { PieChartOutlined } from '@ant-design/icons';

//Pages
import Dashboard from '../pages/dashboard';

//Spaces
import Spaces from '../pages/spaces';
import CreateSpace from '../pages/spaces/create';
import EditSpace from '../pages/spaces/edit';

//Categories
import Categories from '../pages/categories';
import CreateCategory from '../pages/categories/create';
import EditCategory from '../pages/categories/edit';

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
  {
    path: '/spaces/edit',
    Component: EditSpace,
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
    path: '/categories/edit',
    Component: EditCategory,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Edit Category',
  },
];
