import {
  DashboardOutlined,
  BorderlessTableOutlined,
  UnorderedListOutlined,
  IdcardOutlined,
  FileExclamationOutlined,
  TagsOutlined,
  PictureOutlined,
  FileDoneOutlined,
  CheckCircleOutlined,
  StarOutlined,
  EyeOutlined,
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

const routes = {
  dashboard: {
    path: '/dashboard',
    Component: Dashboard,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: DashboardOutlined,
    title: 'Dashboard',
  },
  home: {
    path: '/',
    Component: Dashboard, // component is empty for now
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: DashboardOutlined,
    title: 'Home',
  },
  analytics: {
    path: '/analytics',
    Component: Dashboard, // component is empty for now
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: DashboardOutlined,
    title: 'Analytics',
  },
  spaces: {
    path: '/spaces',
    Component: Spaces,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: BorderlessTableOutlined,
    title: 'Spaces',
  },
  createSpace: {
    path: '/spaces/create',
    Component: CreateSpace,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: BorderlessTableOutlined,
    title: 'Create Space',
  },
  editSpace: {
    path: '/spaces/:id/edit',
    Component: EditSpace,
    enableNavigation: false,
    enableBreadcrumb: false,
    Icon: BorderlessTableOutlined,
    title: 'Edit Space',
  },
  categories: {
    path: '/categories',
    Component: Categories,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: UnorderedListOutlined,
    title: 'Categories',
  },
  createCategory: {
    path: '/categories/create',
    Component: CreateCategory,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: UnorderedListOutlined,
    title: 'Create Category',
  },
  editCategory: {
    path: '/categories/:id/edit',
    Component: EditCategory,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: UnorderedListOutlined,
    title: 'Edit Category',
  },
  policies: {
    path: '/policies',
    Component: Policies,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: IdcardOutlined,
    title: 'Policies',
  },
  createPolicy: {
    path: '/policies/create',
    Component: CreatePolicy,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: IdcardOutlined,
    title: 'Create Policies',
  },
  editPolicy: {
    path: '/policies/:id/edit',
    Component: EditPolicy,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: IdcardOutlined,
    title: 'Edit Policies',
  },
  formats: {
    path: '/formats',
    Component: Formats,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: FileExclamationOutlined,
    title: 'Formats',
  },
  createFormat: {
    path: '/formats/create',
    Component: CreateFormat,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: FileExclamationOutlined,
    title: 'Create Format',
  },
  editFormat: {
    path: '/formats/:id/edit',
    Component: EditFormat,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: FileExclamationOutlined,
    title: 'Edit Format',
  },
  tags: {
    path: '/tags',
    Component: Tags,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: TagsOutlined,
    title: 'Tags',
  },
  createTag: {
    path: '/tags/create',
    Component: CreateTag,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: TagsOutlined,
    title: 'Create Tag',
  },
  editTag: {
    path: '/tags/:id/edit',
    Component: EditTag,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: TagsOutlined,
    title: 'Edit Tag',
  },
  media: {
    path: '/media',
    Component: Media,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: PictureOutlined,
    title: 'Media',
  },
  createMedia: {
    path: '/media/upload',
    Component: UploadMedium,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: PictureOutlined,
    title: 'Medium Upload',
  },
  editMedium: {
    path: '/media/:id/edit',
    Component: EditMedium,
    enableNavigation: false,
    enableBreadcrumb: false,
    Icon: PictureOutlined,
    title: 'Edit Media',
  },
  posts: {
    path: '/posts',
    Component: Posts,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: FileDoneOutlined,
    title: 'Posts',
  },
  createPost: {
    path: '/posts/create',
    Component: CreatePost,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: FileDoneOutlined,
    title: 'Add Posts',
  },
  editPost: {
    path: '/posts/:id/edit',
    Component: EditPost,
    enableNavigation: false,
    enableBreadcrumb: false,
    Icon: FileDoneOutlined,
    title: 'Edit Post',
  },
  ratings: {
    path: '/ratings',
    Component: Ratings,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: StarOutlined,
    title: 'Ratings',
  },
  createRating: {
    path: '/ratings/create',
    Component: CreateRating,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: StarOutlined,
    title: 'Create Rating',
  },
  editRating: {
    path: '/ratings/:id/edit',
    Component: EditRating,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: StarOutlined,
    title: 'Edit Rating',
  },
  claimants: {
    path: '/claimants',
    Component: Claimants,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: EyeOutlined,
    title: 'Claimants',
  },
  createClaimant: {
    path: '/claimants/create',
    Component: CreateClaimant,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: EyeOutlined,
    title: 'Create Claimant',
  },
  editClaimant: {
    path: '/claimants/:id/edit',
    Component: EditClaimant,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: EyeOutlined,
    title: 'Edit Claimant',
  },
  claims: {
    path: '/claims',
    Component: Claims,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: CheckCircleOutlined,
    title: 'Claims',
  },
  createClaim: {
    path: '/claims/create',
    Component: CreateClaim,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: CheckCircleOutlined,
    title: 'Create Claim',
  },
  editClaim: {
    path: '/claims/:id/edit',
    Component: EditClaim,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: CheckCircleOutlined,
    title: 'Edit Claim',
  },
  googleFactCheck: {
    path: '/fact-check/google',
    Component: GoogleFactCheck,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: CheckCircleOutlined,
    title: 'Google',
  },
  factly: {
    path: '/fact-check/factly',
    Component: Factly,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: CheckCircleOutlined,
    title: 'Factly',
  },
};

export const sidebarMenu = [
  {
    title: 'DASHBOARD',
    children: [routes.home, routes.analytics],
  },
  {
    title: 'CORE',
    children: [routes.posts, routes.categories, routes.tags, routes.media, routes.formats],
  },
  {
    title: 'FACT CHECKING',
    children: [routes.claims, routes.claimants, routes.ratings],
    subChildren: {
      routes: [routes.googleFactCheck, routes.factly],
      title: 'FACT CHECK SEARCH',
    },
  },
  {
    title: 'ADMINSTRATION',
    children: [routes.spaces, routes.policies],
  },
];

export default routes;
