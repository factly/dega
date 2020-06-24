import { PieChartOutlined, FileImageOutlined } from '@ant-design/icons';

//Pages
import Dashboard from '../pages/dashboard';

//Spaces
import Spaces from '../pages/spaces';
import SpaceCreate from '../pages/spaces/create';
import SpaceEdit from '../pages/spaces/edit';

//Media
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

//Formats
import Formats from '../pages/formats';
import CreateFormat from '../pages/formats/create';
import EditFormats from '../pages/formats/edit';

//Post
import Posts from '../pages/posts';
import CreatePost from '../pages/posts/create';
import EditPost from '../pages/posts/edit';

//Ratings
import Ratings from '../pages/ratings';
import CreateRating from '../pages/ratings/create';
import EditRating from '../pages/ratings/edit';

//Claimants
import Claimants from '../pages/claimants';
import CreateClaimant from '../pages/claimants/create';
import EditClaimant from '../pages/claimants/edit';

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
    path: '/formats',
    Component: Formats,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Formats',
  },
  {
    path: '/formats/create',
    Component: CreateFormat,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Create Format',
  },
  {
    path: '/formats/:id/edit',
    Component: EditFormats,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Edit Format',
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
  {
    path: '/posts',
    Component: Posts,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: FileImageOutlined,
    title: 'Posts',
  },
  {
    path: '/posts/create',
    Component: CreatePost,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: FileImageOutlined,
    title: 'Add Posts',
  },
  {
    path: '/posts/:id/edit',
    Component: EditPost,
    enableNavigation: false,
    enableBreadcrumb: false,
    Icon: FileImageOutlined,
    title: 'Edit Post',
  },
  {
    path: '/ratings',
    Component: Ratings,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Ratings',
  },
  {
    path: '/ratings/create',
    Component: CreateRating,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Create Rating',
  },
  {
    path: '/ratings/:id/edit',
    Component: EditRating,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Edit Rating',
  },
  {
    path: '/claimants',
    Component: Claimants,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Claimants',
  },
  {
    path: '/claimants/create',
    Component: CreateClaimant,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Create Claimant',
  },
  {
    path: '/claimants/:id/edit',
    Component: EditClaimant,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: PieChartOutlined,
    title: 'Edit Claimant',
  },
];
