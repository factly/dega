import {
  DashboardOutlined,
  IdcardOutlined,
  FileDoneOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

//Pages
import Dashboard from '../pages/dashboard';

//Spaces
import Spaces from '../pages/spaces';
import CreateSpace from '../pages/spaces/CreateSpace';
import EditSpace from '../pages/spaces/EditSpace';

//Media
import Media from '../pages/media';
import UploadMedium from '../pages/media/UploadMedium';
import EditMedium from '../pages/media/EditMedium';

//Categories
import Categories from '../pages/categories';
import CreateCategory from '../pages/categories/CreateCategory';
import EditCategory from '../pages/categories/EditCategory';

//Tags
import Tags from '../pages/tags';
import CreateTag from '../pages/tags/CreateTag';
import EditTag from '../pages/tags/EditTag';

//Formats
import Formats from '../pages/formats';
import CreateFormat from '../pages/formats/CreateFormat';
import EditFormat from '../pages/formats/EditFormat';

//Post
import Posts from '../pages/posts';
import CreatePost from '../pages/posts/CreatePost';
import EditPost from '../pages/posts/EditPost';

//Ratings
import Ratings from '../pages/ratings';
import CreateRating from '../pages/ratings/CreateRating';
import EditRating from '../pages/ratings/EditRating';

//Claimants
import Claimants from '../pages/claimants';
import CreateClaimant from '../pages/claimants/CreateClaimant';
import EditClaimant from '../pages/claimants/EditClaimant';

//Claims
import Claims from '../pages/claims';
import CreateClaim from '../pages/claims/CreateClaim';
import EditClaim from '../pages/claims/EditClaim';

//Policies
import Policies from '../pages/policies';
import CreatePolicy from '../pages/policies/CreatePolicy';
import EditPolicy from '../pages/policies/EditPolicy';
import GoogleFactCheck from '../pages/fact-checks/GoogleFactCheck';
import Factly from '../pages/fact-checks/Factly';
import Users from '../pages/users';
import PermissionList from '../pages/users/PermissionList';

const routes = {
  dashboard: {
    path: '/dashboard',
    Component: Dashboard,
    title: 'Dashboard',
  },
  home: {
    path: '/',
    Component: Dashboard, // component is empty for now
    title: 'Home',
    resource: 'dashboard',
  },
  analytics: {
    path: '/analytics',
    Component: Dashboard, // component is empty for now
    title: 'Analytics',
    resource: 'analytics',
  },
  spaces: {
    path: '/spaces',
    Component: Spaces,
    title: 'Spaces',
    resource: 'spaces',
  },
  createSpace: {
    path: '/spaces/create',
    Component: CreateSpace,
    title: 'Create Space',
  },
  editSpace: {
    path: '/spaces/:id/edit',
    Component: EditSpace,
    title: 'Edit Space',
  },
  categories: {
    path: '/categories',
    Component: Categories,
    title: 'Categories',
    resource: 'categories',
  },
  createCategory: {
    path: '/categories/create',
    Component: CreateCategory,
    title: 'Create Category',
  },
  editCategory: {
    path: '/categories/:id/edit',
    Component: EditCategory,
    title: 'Edit Category',
  },
  policies: {
    path: '/policies',
    Component: Policies,
    title: 'Policies',
    resource: 'policies',
  },
  createPolicy: {
    path: '/policies/create',
    Component: CreatePolicy,
    title: 'Create Policies',
  },
  editPolicy: {
    path: '/policies/:id/edit',
    Component: EditPolicy,
    title: 'Edit Policies',
  },
  formats: {
    path: '/formats',
    Component: Formats,
    title: 'Formats',
    resource: 'formats',
  },
  createFormat: {
    path: '/formats/create',
    Component: CreateFormat,
    title: 'Create Format',
  },
  editFormat: {
    path: '/formats/:id/edit',
    Component: EditFormat,
    title: 'Edit Format',
  },
  tags: {
    path: '/tags',
    Component: Tags,
    title: 'Tags',
    resource: 'tags',
  },
  createTag: {
    path: '/tags/create',
    Component: CreateTag,
    title: 'Create Tag',
  },
  editTag: {
    path: '/tags/:id/edit',
    Component: EditTag,
    title: 'Edit Tag',
  },
  media: {
    path: '/media',
    Component: Media,
    title: 'Media',
    resource: 'media',
  },
  createMedia: {
    path: '/media/upload',
    Component: UploadMedium,
    title: 'Medium Upload',
  },
  editMedium: {
    path: '/media/:id/edit',
    Component: EditMedium,
    title: 'Edit Media',
  },
  posts: {
    path: '/posts',
    Component: Posts,
    title: 'Posts',
    resource: 'posts',
  },
  createPost: {
    path: '/posts/create',
    Component: CreatePost,
    title: 'Add Posts',
  },
  editPost: {
    path: '/posts/:id/edit',
    Component: EditPost,
    title: 'Edit Post',
  },
  ratings: {
    path: '/ratings',
    Component: Ratings,
    title: 'Ratings',
    resource: 'ratings',
  },
  createRating: {
    path: '/ratings/create',
    Component: CreateRating,
    title: 'Create Rating',
  },
  editRating: {
    path: '/ratings/:id/edit',
    Component: EditRating,
    title: 'Edit Rating',
  },
  claimants: {
    path: '/claimants',
    Component: Claimants,
    title: 'Claimants',
    resource: 'claimants',
  },
  createClaimant: {
    path: '/claimants/create',
    Component: CreateClaimant,
    title: 'Create Claimant',
  },
  editClaimant: {
    path: '/claimants/:id/edit',
    Component: EditClaimant,
    title: 'Edit Claimant',
  },
  claims: {
    path: '/claims',
    Component: Claims,
    title: 'Claims',
    resource: 'claims',
  },
  createClaim: {
    path: '/claims/create',
    Component: CreateClaim,
    title: 'Create Claim',
  },
  editClaim: {
    path: '/claims/:id/edit',
    Component: EditClaim,
    title: 'Edit Claim',
  },
  googleFactCheck: {
    path: '/fact-check/google',
    Component: GoogleFactCheck,
    title: 'Google',
    resource: 'googleFactCheck',
  },
  factly: {
    path: '/fact-check/factly',
    Component: Factly,
    title: 'Factly',
    resource: 'factly',
  },
  users: {
    path: '/users',
    Component: Users,
    title: 'Users',
    resource: 'users',
  },
  usersPermission: {
    path: '/users/:id/permissions',
    Component: PermissionList,
    title: 'Users Permission ',
  },
};

export const sidebarMenu = [
  {
    title: 'DASHBOARD',
    Icon: DashboardOutlined,
    children: [routes.home, routes.analytics],
  },
  {
    title: 'CORE',
    Icon: FileDoneOutlined,
    children: [routes.posts, routes.categories, routes.tags, routes.media, routes.formats],
  },
  {
    title: 'FACT CHECKING',
    Icon: CheckCircleOutlined,
    children: [
      routes.claims,
      routes.claimants,
      routes.ratings,
      routes.googleFactCheck,
      routes.factly,
    ],
  },
  {
    title: 'ADMINSTRATION',
    Icon: IdcardOutlined,
    children: [routes.spaces, routes.policies, routes.users],
  },
];

export default routes;
