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
  spaceCreate: {
    path: '/spaces/create',
    Component: CreateSpace,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: BorderlessTableOutlined,
    title: 'Create Space',
  },
  spaceEdit: {
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
  categoryCreate: {
    path: '/categories/create',
    Component: CreateCategory,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: UnorderedListOutlined,
    title: 'Create Category',
  },
  categoryEdit: {
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
  policyCreate: {
    path: '/policies/create',
    Component: CreatePolicy,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: IdcardOutlined,
    title: 'Create Policies',
  },
  policyEdit: {
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
  formatCreate: {
    path: '/formats/create',
    Component: CreateFormat,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: FileExclamationOutlined,
    title: 'Create Format',
  },
  formatEdit: {
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
  tagCreate: {
    path: '/tags/create',
    Component: CreateTag,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: TagsOutlined,
    title: 'Create Tag',
  },
  tagEdit: {
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
  mediaCreate: {
    path: '/media/upload',
    Component: UploadMedium,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: PictureOutlined,
    title: 'Medium Upload',
  },
  mediaEdit: {
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
  postCreate: {
    path: '/posts/create',
    Component: CreatePost,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: FileDoneOutlined,
    title: 'Add Posts',
  },
  postEdit: {
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
  ratingCreate: {
    path: '/ratings/create',
    Component: CreateRating,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: StarOutlined,
    title: 'Create Rating',
  },
  reatingEdit: {
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
  claimantCreate: {
    path: '/claimants/create',
    Component: CreateClaimant,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: EyeOutlined,
    title: 'Create Claimant',
  },
  claimantEdit: {
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
  claimCreate: {
    path: '/claims/create',
    Component: CreateClaim,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: CheckCircleOutlined,
    title: 'Create Claim',
  },
  claimEdit: {
    path: '/claims/:id/edit',
    Component: EditClaim,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: CheckCircleOutlined,
    title: 'Edit Claim',
  },
};

export const sidebarMenu = [
  {
    title: 'Dashboard',
    children: [routes.home, routes.analytics],
  },
  {
    title: 'Core',
    children: [routes.posts, routes.categories, routes.tags, routes.media, routes.formats],
  },
  {
    title: 'Fact Checking',
    children: [routes.claims, routes.claimants, routes.ratings],
  },
  {
    title: 'Administration',
    children: [routes.spaces, routes.policies],
  },
];

export default routes;
