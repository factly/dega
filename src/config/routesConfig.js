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
import SpaceCreate from '../pages/spaces/CreateSpace';
import SpaceEdit from '../pages/spaces/SpaceEdit';

//Media
import Media from '../pages/media';
import MediaUploader from '../pages/media/UploadMedium';
import MediaEdit from '../pages/media/MediaEdit';

//Categories
import Categories from '../pages/categories';
import CreateCategory from '../pages/categories/CreateCategory';
import EditCategory from '../pages/categories/EditCategory';

//Tags
import Tags from '../pages/tags';
import CreateTag from '../pages/tags/CreateTag';
import EditTags from '../pages/tags/EditTag';

//Formats
import Formats from '../pages/formats';
import CreateFormat from '../pages/formats/CreateFormat';
import EditFormats from '../pages/formats/EditFormat';

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

export default [
  {
    path: '/dashboard',
    Component: Dashboard,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: DashboardOutlined,
    title: 'Dashboard',
  },
  {
    path: '/spaces',
    Component: Spaces,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: BorderlessTableOutlined,
    title: 'Spaces',
  },
  {
    path: '/spaces/create',
    Component: SpaceCreate,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: BorderlessTableOutlined,
    title: 'Create Space',
  },
  {
    path: '/spaces/:id/edit',
    Component: SpaceEdit,
    enableNavigation: false,
    enableBreadcrumb: false,
    Icon: BorderlessTableOutlined,
    title: 'Edit Space',
  },
  {
    path: '/categories',
    Component: Categories,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: UnorderedListOutlined,
    title: 'Categories',
  },
  {
    path: '/categories/create',
    Component: CreateCategory,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: UnorderedListOutlined,
    title: 'Create Category',
  },
  {
    path: '/categories/:id/edit',
    Component: EditCategory,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: UnorderedListOutlined,
    title: 'Edit Category',
  },
  {
    path: '/policies',
    Component: Policies,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: IdcardOutlined,
    title: 'Policies',
  },
  {
    path: '/policies/create',
    Component: CreatePolicy,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: IdcardOutlined,
    title: 'Create Policies',
  },
  {
    path: '/policies/:id/edit',
    Component: EditPolicy,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: IdcardOutlined,
    title: 'Edit Policies',
  },
  {
    path: '/formats',
    Component: Formats,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: FileExclamationOutlined,
    title: 'Formats',
  },
  {
    path: '/formats/create',
    Component: CreateFormat,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: FileExclamationOutlined,
    title: 'Create Format',
  },
  {
    path: '/formats/:id/edit',
    Component: EditFormats,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: FileExclamationOutlined,
    title: 'Edit Format',
  },
  {
    path: '/tags',
    Component: Tags,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: TagsOutlined,
    title: 'Tags',
  },
  {
    path: '/tags/create',
    Component: CreateTag,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: TagsOutlined,
    title: 'Create Tag',
  },
  {
    path: '/tags/:id/edit',
    Component: EditTags,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: TagsOutlined,
    title: 'Edit Tag',
  },
  {
    path: '/media',
    Component: Media,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: PictureOutlined,
    title: 'Media',
  },
  {
    path: '/media/upload',
    Component: MediaUploader,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: PictureOutlined,
    title: 'Medium Upload',
  },
  {
    path: '/media/:id/edit',
    Component: MediaEdit,
    enableNavigation: false,
    enableBreadcrumb: false,
    Icon: PictureOutlined,
    title: 'Edit Media',
  },
  {
    path: '/posts',
    Component: Posts,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: FileDoneOutlined,
    title: 'Posts',
  },
  {
    path: '/posts/create',
    Component: CreatePost,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: FileDoneOutlined,
    title: 'Add Posts',
  },
  {
    path: '/posts/:id/edit',
    Component: EditPost,
    enableNavigation: false,
    enableBreadcrumb: false,
    Icon: FileDoneOutlined,
    title: 'Edit Post',
  },
  {
    path: '/ratings',
    Component: Ratings,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: StarOutlined,
    title: 'Ratings',
  },
  {
    path: '/ratings/create',
    Component: CreateRating,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: StarOutlined,
    title: 'Create Rating',
  },
  {
    path: '/ratings/:id/edit',
    Component: EditRating,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: StarOutlined,
    title: 'Edit Rating',
  },
  {
    path: '/claimants',
    Component: Claimants,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: EyeOutlined,
    title: 'Claimants',
  },
  {
    path: '/claimants/create',
    Component: CreateClaimant,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: EyeOutlined,
    title: 'Create Claimant',
  },
  {
    path: '/claimants/:id/edit',
    Component: EditClaimant,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: EyeOutlined,
    title: 'Edit Claimant',
  },
  {
    path: '/claims',
    Component: Claims,
    enableNavigation: true,
    enableBreadcrumb: true,
    Icon: CheckCircleOutlined,
    title: 'Claims',
  },
  {
    path: '/claims/create',
    Component: CreateClaim,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: CheckCircleOutlined,
    title: 'Create Claim',
  },
  {
    path: '/claims/:id/edit',
    Component: EditClaim,
    enableNavigation: false,
    enableBreadcrumb: true,
    Icon: CheckCircleOutlined,
    title: 'Edit Claim',
  },
];
