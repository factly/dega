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
  },
  analytics: {
    path: '/analytics',
    Component: Dashboard, // component is empty for now
    title: 'Analytics',
  },
  spaces: {
    path: '/spaces',
    Component: Spaces,
    title: 'Spaces',
  },
  createSpace: {
    path: '/spaces/create',
    Component: CreateSpace,
    title: 'Create Space',
    permission: {
      resource: 'spaces',
      action: 'create',
    },
  },
  editSpace: {
    path: '/spaces/:id/edit',
    Component: EditSpace,
    title: 'Edit Space',
    permission: {
      resource: 'spaces',
      action: 'edit',
    },
  },
  categories: {
    path: '/categories',
    Component: Categories,
    title: 'Categories',
    permission: {
      resource: 'categories',
      action: 'get',
    },
  },
  createCategory: {
    path: '/categories/create',
    Component: CreateCategory,
    title: 'Create Category',
    permission: {
      resource: 'categories',
      action: 'create',
    },
  },
  editCategory: {
    path: '/categories/:id/edit',
    Component: EditCategory,
    title: 'Edit Category',
    permission: {
      resource: 'categories',
      action: 'edit',
    },
  },
  policies: {
    path: '/policies',
    Component: Policies,
    title: 'Policies',
  },
  createPolicy: {
    path: '/policies/create',
    Component: CreatePolicy,
    title: 'Create Policies',
    permission: {
      resource: 'policies',
      action: 'create',
    },
  },
  editPolicy: {
    path: '/policies/:id/edit',
    Component: EditPolicy,
    title: 'Edit Policies',
    permission: {
      resource: 'policies',
      action: 'edit',
    },
  },
  formats: {
    path: '/formats',
    Component: Formats,
    title: 'Formats',
    permission: {
      resource: 'formats',
      action: 'get',
    },
  },
  createFormat: {
    path: '/formats/create',
    Component: CreateFormat,
    title: 'Create Format',
    permission: {
      resource: 'formats',
      action: 'create',
    },
  },
  editFormat: {
    path: '/formats/:id/edit',
    Component: EditFormat,
    title: 'Edit Format',
    permission: {
      resource: 'formats',
      action: 'edit',
    },
  },
  tags: {
    path: '/tags',
    Component: Tags,
    title: 'Tags',
    permission: {
      resource: 'tags',
      action: 'get',
    },
  },
  createTag: {
    path: '/tags/create',
    Component: CreateTag,
    title: 'Create Tag',
    permission: {
      resource: 'tags',
      action: 'create',
    },
  },
  editTag: {
    path: '/tags/:id/edit',
    Component: EditTag,
    title: 'Edit Tag',
    permission: {
      resource: 'tags',
      action: 'edit',
    },
  },
  media: {
    path: '/media',
    Component: Media,
    title: 'Media',
    permission: {
      resource: 'media',
      action: 'get',
    },
  },
  createMedia: {
    path: '/media/upload',
    Component: UploadMedium,
    title: 'Medium Upload',
    permission: {
      resource: 'media',
      action: 'create',
    },
  },
  editMedium: {
    path: '/media/:id/edit',
    Component: EditMedium,
    title: 'Edit Media',
    permission: {
      resource: 'media',
      action: 'edit',
    },
  },
  posts: {
    path: '/posts',
    Component: Posts,
    title: 'Posts',
  },
  createPost: {
    path: '/posts/create',
    Component: CreatePost,
    title: 'Add Posts',
    permission: {
      resource: 'posts',
      action: 'create',
    },
  },
  editPost: {
    path: '/posts/:id/edit',
    Component: EditPost,
    title: 'Edit Post',
    permission: {
      resource: 'posts',
      action: 'edit',
    },
  },
  ratings: {
    path: '/ratings',
    Component: Ratings,
    title: 'Ratings',
    permission: {
      resource: 'ratings',
      action: 'get',
    },
  },
  createRating: {
    path: '/ratings/create',
    Component: CreateRating,
    title: 'Create Rating',
    permission: {
      resource: 'ratings',
      action: 'create',
    },
  },
  editRating: {
    path: '/ratings/:id/edit',
    Component: EditRating,
    title: 'Edit Rating',
    permission: {
      resource: 'ratings',
      action: 'edit',
    },
  },
  claimants: {
    path: '/claimants',
    Component: Claimants,
    title: 'Claimants',
    permission: {
      resource: 'claimants',
      action: 'get',
    },
  },
  createClaimant: {
    path: '/claimants/create',
    Component: CreateClaimant,
    title: 'Create Claimant',
    permission: {
      resource: 'claimants',
      action: 'create',
    },
  },
  editClaimant: {
    path: '/claimants/:id/edit',
    Component: EditClaimant,
    title: 'Edit Claimant',
    permission: {
      resource: 'claimants',
      action: 'edit',
    },
  },
  claims: {
    path: '/claims',
    Component: Claims,
    title: 'Claims',
    permission: {
      resource: 'claims',
      action: 'get',
    },
  },
  createClaim: {
    path: '/claims/create',
    Component: CreateClaim,
    title: 'Create Claim',
    permission: {
      resource: 'claims',
      action: 'create',
    },
  },
  editClaim: {
    path: '/claims/:id/edit',
    Component: EditClaim,
    title: 'Edit Claim',
    permission: {
      action: 'edit',
      resource: 'claims',
    },
  },
  googleFactCheck: {
    path: '/fact-check/google',
    Component: GoogleFactCheck,
    title: 'Google',
  },
  factly: {
    path: '/fact-check/factly',
    Component: Factly,
    title: 'Factly',
  },
  users: {
    path: '/users',
    Component: Users,
    title: 'Users',
  },
  usersPermission: {
    path: '/users/:id/permissions',
    Component: PermissionList,
    title: 'Users Permission ',
    permission: {
      resource: 'users',
      action: 'get',
    },
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
