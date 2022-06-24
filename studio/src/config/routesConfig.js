import {
  PieChartTwoTone,
  ControlTwoTone,
  AudioTwoTone,
  ToolTwoTone,
  SettingTwoTone,
  SecurityScanTwoTone,
} from '@ant-design/icons';

//Pages
import Dashboard from '../pages/dashboard';
import Analytics from '../pages/analytics';

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

//Episodes
import Episodes from '../pages/episodes';
import CreateEpisode from '../pages/episodes/CreateEpisode';
import EditEpisode from '../pages/episodes/EditEpisode';

//Podcasts
import Podcasts from '../pages/podcasts';
import CreatePodcast from '../pages/podcasts/CreatePodcast';
import EditPodcast from '../pages/podcasts/EditPodcast';

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

//Fact Checks
import GoogleFactCheck from '../pages/fact-checks/GoogleFactCheck';
import Factly from '../pages/fact-checks/Factly';
import FactCheck from '../pages/fact-checks';
import CreateFactCheck from '../pages/fact-checks/CreateFactCheck';
import EditFactCheck from '../pages/fact-checks/EditFactCheck';

// Users & Permissions
import Users from '../pages/users';
import PermissionList from '../pages/users/PermissionList';

// Organisation Permissions
import OrganisationPermissions from '../pages/permissions/organisations';
import CreateOrganisationPermission from '../pages/permissions/organisations/CreateOrganisationPermission';
import EditOrganisationPermission from '../pages/permissions/organisations/EditOrganisationPermission';

// Space Permissions
import SpacePermissions from '../pages/permissions/spaces';
import CreateSpacePermission from '../pages/permissions/spaces/CreateSpacePermission';
import EditSpacePermission from '../pages/permissions/spaces/EditSpacePermission';

// Organisation Requests
import OrganisationRequests from '../pages/requests/organisations';
import CreateOrganisationRequest from '../pages/requests/organisations/CreateOrganisationRequest';

// Space Requests
import SpaceRequests from '../pages/requests/spaces';
import CreateSpaceRequest from '../pages/requests/spaces/CreateSpaceRequest';

// Menu
import Menu from '../pages/menu';
import CreateMenu from '../pages/menu/CreateMenu';
import EditMenu from '../pages/menu/EditMenu';

//Events
import Events from '../pages/events';
import CreateEvent from '../pages/events/CreateEvent';
import EditEvent from '../pages/events/EditEvent';

//Pages
import Pages from '../pages/pages';
import CreatePage from '../pages/pages/CreatePage';
import EditPage from '../pages/pages/EditPage';

//Webhooks
import Webhooks from '../pages/webhooks';
import CreateWebhook from '../pages/webhooks/CreateWebhook';
import EditWebhook from '../pages/webhooks/EditWebhook';

//profile
import Profile from '../pages/profile';

// Website
import Website from '../pages/website';
import EditWebsite from '../pages/website/EditWebsite';
import CodeInjection from '../pages/website/CodeInjection';
import Branding from '../pages/website/Branding';
import AnalyticsForm from '../pages/website/AnalyticsForm';

// Advanced
import Advanced from '../pages/advanced';

// Members
import Members from '../pages/members';
import Requests from '../pages/requests';
import Permissions from '../pages/permissions';

//Reindex
import Reindex from '../pages/spaces/Reindex';

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
    Component: Analytics,
    title: 'Analytics',
  },
  spaces: {
    path: '/admin/spaces',
    Component: Spaces,
    title: 'Spaces',
  },
  createSpace: {
    path: '/admin/spaces/create',
    Component: CreateSpace,
    title: 'New Space',
    permission: {
      resource: 'spaces',
      action: 'create',
      isSpace: true,
    },
  },
  editSpace: {
    path: '/admin/spaces/:id/edit',
    Component: EditSpace,
    title: 'Edit',
    permission: {
      resource: 'spaces',
      action: 'update',
    },
  },
  editWebsite: {
    path: '/website/general',
    Component: EditWebsite,
    title: 'General',
    permission: {
      resource: 'spaces',
      action: 'update',
    },
  },
  codeInjection: {
    path: '/website/code-injection',
    Component: CodeInjection,
    title: 'Code Injection',
    permission: {
      resource: 'spaces',
      action: 'update',
    },
  },
  branding: {
    path: '/website/branding',
    Component: Branding,
    title: 'Branding',
    permission: {
      resource: 'spaces',
      action: 'update',
    },
  },
  analyticsForm: {
    path: '/website/analytics',
    Component: AnalyticsForm,
    title: 'Analytics',
    permission: {
      resource: 'spaces',
      action: 'update',
    },
  },
  reindex: {
    path: '/advanced/reindex',
    Component: Reindex,
    title: 'Reindex',
  },
  episodes: {
    path: '/episodes',
    Component: Episodes,
    title: 'Episodes',
  },
  createEpisode: {
    path: '/episodes/create',
    Component: CreateEpisode,
    title: 'New Episode',
    permission: {
      resource: 'episodes',
      action: 'create',
    },
  },
  editEpisode: {
    path: '/episodes/:id/edit',
    Component: EditEpisode,
    title: 'Edit',
    permission: {
      resource: 'episodes',
      action: 'update',
    },
  },
  podcasts: {
    path: '/podcasts',
    Component: Podcasts,
    title: 'Podcasts',
  },
  createPodcast: {
    path: '/podcasts/create',
    Component: CreatePodcast,
    title: 'New Podcast',
    permission: {
      resource: 'podcasts',
      action: 'create',
    },
  },
  editPodcast: {
    path: '/podcasts/:id/edit',
    Component: EditPodcast,
    title: 'Edit',
    permission: {
      resource: 'podcasts',
      action: 'update',
    },
  },
  permissions: {
    path: '/admin/permissions',
    Component: Permissions,
    title: 'Permissions',
    isAdmin: true,
  },
  requests: {
    path: '/admin/requests',
    Component: Requests,
    title: 'Requests',
    isOwner: true,
  },
  organisationPermissions: {
    path: '/admin/permissions/organisations',
    Component: OrganisationPermissions,
    title: 'Organisations',
    isAdmin: true,
  },
  createOrganisationPermission: {
    path: '/admin/permissions/organisations/create',
    Component: CreateOrganisationPermission,
    title: 'Create',
    isAdmin: true,
  },
  editOrganisationPermission: {
    path: '/admin/organisations/:oid/permissions/:pid/edit',
    Component: EditOrganisationPermission,
    title: 'Edit',
    isAdmin: true,
  },
  spacePermissions: {
    path: '/admin/permissions/spaces',
    Component: SpacePermissions,
    title: 'Spaces',
    isAdmin: true,
  },
  createSpacePermission: {
    path: '/admin/permissions/spaces/create',
    Component: CreateSpacePermission,
    title: 'Create',
    isAdmin: true,
  },
  editSpacePermission: {
    path: '/admin/spaces/:sid/permissions/:pid/edit',
    Component: EditSpacePermission,
    title: 'Edit',
    isAdmin: true,
  },
  organisationRequests: {
    path: '/admin/requests/organisations',
    Component: OrganisationRequests,
    title: 'Organisations',
    isOwner: true,
  },
  createOrganisationRequest: {
    path: '/admin/requests/organisations/create',
    Component: CreateOrganisationRequest,
    title: 'New Request',
    isOwner: true,
  },
  spaceRequests: {
    path: '/admin/requests/spaces',
    Component: SpaceRequests,
    title: 'Spaces',
    isOwner: true,
  },
  createSpaceRequest: {
    path: '/admin/requests/spaces/create',
    Component: CreateSpaceRequest,
    title: 'New Request',
    isOwner: true,
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
    title: 'New Category',
    permission: {
      resource: 'categories',
      action: 'create',
    },
  },
  editCategory: {
    path: '/categories/:id/edit',
    Component: EditCategory,
    title: 'Edit',
    permission: {
      resource: 'categories',
      action: 'update',
    },
  },
  policies: {
    path: '/members/policies',
    Component: Policies,
    title: 'Policies',
  },
  createPolicy: {
    path: '/members/policies/create',
    Component: CreatePolicy,
    title: 'New Policy',
    permission: {
      resource: 'policies',
      action: 'create',
    },
  },
  editPolicy: {
    path: '/members/policies/:id/edit',
    Component: EditPolicy,
    title: 'Edit',
    permission: {
      resource: 'policies',
      action: 'update',
    },
  },
  formats: {
    path: '/advanced/formats',
    Component: Formats,
    title: 'Formats',
    permission: {
      resource: 'formats',
      action: 'get',
    },
  },
  createFormat: {
    path: '/advanced/formats/create',
    Component: CreateFormat,
    title: 'New Format',
    permission: {
      resource: 'formats',
      action: 'create',
    },
  },
  editFormat: {
    path: '/advanced/formats/:id/edit',
    Component: EditFormat,
    title: 'Edit',
    permission: {
      resource: 'formats',
      action: 'update',
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
    title: 'New Tag',
    permission: {
      resource: 'tags',
      action: 'create',
    },
  },
  editTag: {
    path: '/tags/:id/edit',
    Component: EditTag,
    title: 'Edit',
    permission: {
      resource: 'tags',
      action: 'update',
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
    title: 'Upload',
    permission: {
      resource: 'media',
      action: 'create',
    },
  },
  editMedium: {
    path: '/media/:id/edit',
    Component: EditMedium,
    title: 'Edit',
    permission: {
      resource: 'media',
      action: 'update',
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
    title: 'New Post',
    permission: {
      resource: 'posts',
      action: 'create',
    },
  },
  editPost: {
    path: '/posts/:id/edit',
    Component: EditPost,
    title: 'Edit',
    permission: {
      resource: 'posts',
      action: 'update',
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
    title: 'New Rating',
    permission: {
      resource: 'ratings',
      action: 'create',
    },
  },
  editRating: {
    path: '/ratings/:id/edit',
    Component: EditRating,
    title: 'Edit',
    permission: {
      resource: 'ratings',
      action: 'update',
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
    title: 'New Claimant',
    permission: {
      resource: 'claimants',
      action: 'create',
    },
  },
  editClaimant: {
    path: '/claimants/:id/edit',
    Component: EditClaimant,
    title: 'Edit',
    permission: {
      resource: 'claimants',
      action: 'update',
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
    title: 'New Claim',
    permission: {
      resource: 'claims',
      action: 'create',
    },
  },
  editClaim: {
    path: '/claims/:id/edit',
    Component: EditClaim,
    title: 'Edit',
    permission: {
      action: 'update',
      resource: 'claims',
    },
  },
  factCheck: {
    path: '/fact-checks',
    Component: FactCheck,
    title: 'Fact-Checks',
  },
  createFactCheck: {
    path: '/fact-checks/create',
    Component: CreateFactCheck,
    title: 'Create',
    permission: {
      resource: 'fact-checks',
      action: 'create',
    },
  },
  editFactCheck: {
    path: '/fact-checks/:id/edit',
    Component: EditFactCheck,
    title: 'Edit',
    permission: {
      action: 'update',
      resource: 'fact-checks',
    },
  },
  googleFactCheck: {
    path: '/fact-checks/google',
    Component: GoogleFactCheck,
    title: 'Google',
  },
  sach: {
    path: '/fact-checks/sach',
    Component: Factly,
    title: 'Sach',
  },
  users: {
    path: '/members/users',
    Component: Users,
    title: 'Users',
  },
  usersPermission: {
    path: '/members/users/:id/permissions',
    Component: PermissionList,
    title: 'Users Permission ',
    permission: {
      resource: 'users',
      action: 'get',
    },
  },
  menu: {
    path: '/website/menus',
    Component: Menu,
    title: 'Menus',
  },
  createMenu: {
    path: '/website/menus/create',
    Component: CreateMenu,
    title: 'New Menu',
    permission: {
      resource: 'menus',
      action: 'create',
    },
  },
  editMenu: {
    path: '/website/menus/:id/edit',
    Component: EditMenu,
    title: 'Edit',
    permission: {
      resource: 'menus',
      action: 'update',
    },
  },
  pages: {
    path: '/pages',
    Component: Pages,
    title: 'Pages',
  },
  createPage: {
    path: '/pages/create',
    Component: CreatePage,
    title: 'New Page',
    permission: {
      resource: 'pages',
      action: 'create',
    },
  },
  editPage: {
    path: '/pages/:id/edit',
    Component: EditPage,
    title: 'Edit',
    permission: {
      resource: 'pages',
      action: 'update',
    },
  },
  events: {
    path: '/admin/events',
    Component: Events,
    title: 'Events',
    isAdmin: true,
  },
  createEvent: {
    path: '/admin/events/create',
    Component: CreateEvent,
    title: 'New Event',
    isAdmin: true,
  },
  editEvent: {
    path: '/admin/events/:id/edit',
    Component: EditEvent,
    title: 'Edit',
    isAdmin: true,
  },
  webhooks: {
    path: '/advanced/webhooks',
    Component: Webhooks,
    title: 'Webhooks',
    permission: {
      resource: 'webhooks',
      action: 'get',
    },
  },
  createWebhook: {
    path: '/advanced/webhooks/create',
    Component: CreateWebhook,
    title: 'New Webhook',
    permission: {
      resource: 'webhooks',
      action: 'create',
    },
  },
  editWebhook: {
    path: '/advanced/webhooks/:id/edit',
    Component: EditWebhook,
    title: 'Edit',
    permission: {
      resource: 'webhooks',
      action: 'update',
    },
  },
  profile: {
    path: '/profile',
    Component: Profile,
    title: 'Edit Profile',
  },
  website: {
    path: '/website',
    Component: Website,
    title: 'Website',
  },
  members: {
    path: '/members',
    Component: Members,
    title: 'Members',
  },
  advanced: {
    path: '/advanced',
    Component: Advanced,
    title: 'Advanced',
  },
};
export const sidebarMenu = [
  {
    title: 'Dashboard',
    Icon: PieChartTwoTone,
    children: [routes.home, routes.analytics],
    isService: false,
  },
  {
    title: 'Core',
    Icon: ControlTwoTone,
    children: [routes.posts, routes.pages, routes.categories, routes.tags, routes.media],
    isService: true,
  },
  {
    title: 'Fact Checking',
    Icon: SecurityScanTwoTone,
    children: [
      routes.factCheck,
      routes.claims,
      routes.claimants,
      routes.ratings,
      routes.googleFactCheck,
      routes.sach,
    ],
    isService: true,
  },
  {
    title: 'Podcast',
    Icon: AudioTwoTone,
    children: [routes.episodes, routes.podcasts],
    isService: true,
  },
  {
    title: 'Settings',
    Icon: SettingTwoTone,
    children: [routes.website, routes.members, routes.advanced],
    isService: false,
    isAdmin: true,
  },
  {
    title: 'Administration',
    Icon: ToolTwoTone,
    children: [routes.spaces, routes.requests, routes.permissions, routes.events],
    isService: false,
  },
];

export default routes;
