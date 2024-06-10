import React from 'react';
import {
  HomeOutlined,
  InfoCircleOutlined,
  AudioOutlined,
  GlobalOutlined,
  SettingOutlined,
  SecurityScanOutlined,
} from '@ant-design/icons';
import { Result, Button } from 'antd';
import { Link } from 'react-router-dom';
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

//Roles
import Roles from '../pages/roles';
import CreateRole from '../pages/roles/CreateRole';

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

// Settings
import Settings from '../pages/settings';
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
import { Component } from 'react';
import ViewPolicy from '../pages/policies/components/ViewPolicy';
import RoleUsers from '../pages/roles/users';
import EditRole from '../pages/roles/EditRole';
import BasicLayout from '../layouts/basic';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminRoute from '../components/AdminRoute';
import Callback from '../pages/redirect';

export function extractV6RouteObject(
  routes,
  formats,
  setReloadFlag,
  reloadFlag,
  authenticated,
  setAuth,
  userManager,
  handleLogout,
) {
  const extractedRoutes = [];

  // Loop through the original routes object and convert each route to v6 format
  for (const routeKey in routes) {
    const route = routes[routeKey];
    const { path, Component, title, permission, isAdmin, isOwner, menuKey } = route;

    // Create the v6 route element based on the original route data
    let v6RouteElement;

    if (permission) {
      v6RouteElement = (
        <BasicLayout>
          <ProtectedRoute
            key={path}
            permission={permission}
            exact
            path={path}
            component={Component}
            formats={formats}
            setReloadFlag={setReloadFlag}
            reloadFlag={reloadFlag}
          />
        </BasicLayout>
      );
    } else if (isAdmin) {
      v6RouteElement = (
        <BasicLayout>
          <AdminRoute key={path} exact path={path} component={Component} formats={formats} />
        </BasicLayout>
      );
    } else {
      v6RouteElement = (
        <BasicLayout>
          <Component
            formats={formats}
            authenticated={authenticated}
            setAuth={setAuth}
            userManager={userManager}
            handleLogout={handleLogout}
          />
        </BasicLayout>
      );
    }

    // Create the v6 route object based on the original route data
    const v6Route = {
      path,
      element: v6RouteElement,
      title,
      ...(permission && { permission }),
      ...(isAdmin && { isAdmin }),
      ...(isOwner && { isOwner }),
    };

    // Check if menuKey exists and add it to the v6 route object
    if (menuKey) {
      v6Route.menuKey = menuKey;
    }

    // Push the v6 route object to the extractedRoutes array
    extractedRoutes.push(v6Route);
  }

  return extractedRoutes;
}
const routes = {
  dashboard: {
    path: '/dashboard',
    menuKey: '/',
    Component: Dashboard,
    title: 'Dashboard',
  },
  home: {
    path: '/',
    menuKey: '/',
    Component: Dashboard, // component is empty for now
    title: 'Home',
  },
  analytics: {
    path: '/analytics',
    menuKey: '/analytics',
    Component: Analytics,
    title: 'Analytics',
  },
  spaces: {
    path: '/admin/spaces',
    menuKey: '/admin/spaces',
    Component: Spaces,
    title: 'Spaces',
  },
  createSpace: {
    path: '/admin/spaces/create',
    menuKey: '/admin/spaces',
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
    menuKey: '/admin/spaces',
    Component: EditSpace,
    title: 'Edit',
    permission: {
      resource: 'spaces',
      action: 'update',
    },
  },
  editWebsite: {
    path: '/settings/website/general',
    menuKey: '/website',
    Component: EditWebsite,
    title: 'General',
    permission: {
      resource: 'spaces',
      action: 'update',
    },
  },
  codeInjection: {
    path: '/settings/website/code-injection',
    menuKey: '/website',
    Component: CodeInjection,
    title: 'Code Injection',
    permission: {
      resource: 'spaces',
      action: 'update',
    },
  },
  branding: {
    path: '/settings/website/branding',
    menuKey: '/website',
    Component: Branding,
    title: 'Branding',
    permission: {
      resource: 'spaces',
      action: 'update',
    },
  },
  analyticsForm: {
    path: '/settings/website/analytics',
    menuKey: '/website',
    Component: AnalyticsForm,
    title: 'Analytics',
    permission: {
      resource: 'spaces',
      action: 'update',
    },
  },
  reindex: {
    path: '/settings/advanced/reindex',
    menuKey: '/advanced',
    Component: Reindex,
    title: 'Reindex',
  },
  episodes: {
    path: '/episodes',
    menuKey: '/episodes',
    Component: Episodes,
    title: 'Episodes',
  },
  createEpisode: {
    path: '/episodes/create',
    menuKey: '/episodes',
    Component: CreateEpisode,
    title: 'New Episode',
    permission: {
      resource: 'episodes',
      action: 'create',
    },
  },
  editEpisode: {
    path: '/episodes/:id/edit',
    menuKey: '/episodes',
    Component: EditEpisode,
    title: 'Edit',
    permission: {
      resource: 'episodes',
      action: 'update',
    },
  },
  podcasts: {
    path: '/podcasts',
    menuKey: '/podcasts',
    Component: Podcasts,
    title: 'Podcasts',
  },
  createPodcast: {
    path: '/podcasts/create',
    menuKey: '/podcasts',
    Component: CreatePodcast,
    title: 'New Podcast',
    permission: {
      resource: 'podcasts',
      action: 'create',
    },
  },
  editPodcast: {
    path: '/podcasts/:id/edit',
    menuKey: '/podcasts',
    Component: EditPodcast,
    title: 'Edit',
    permission: {
      resource: 'podcasts',
      action: 'update',
    },
  },
  permissions: {
    path: '/admin/permissions',
    menuKey: '/admin/permissions',
    Component: Permissions,
    title: 'Permissions',
    isAdmin: true,
  },
  requests: {
    path: '/admin/requests',
    menuKey: '/admin/requests',
    Component: Requests,
    title: 'Requests',
    isOwner: true,
  },
  organisationPermissions: {
    path: '/admin/permissions/organisations',
    menuKey: '/admin/permissions',
    Component: OrganisationPermissions,
    title: 'Organisations',
    isAdmin: true,
  },
  createOrganisationPermission: {
    path: '/admin/permissions/organisations/create',
    menuKey: '/admin/permissions',
    Component: CreateOrganisationPermission,
    title: 'Create',
    isAdmin: true,
  },
  editOrganisationPermission: {
    path: '/admin/organisations/:oid/permissions/:pid/edit',
    menuKey: '/admin/permissions',
    Component: EditOrganisationPermission,
    title: 'Edit',
    isAdmin: true,
  },
  spacePermissions: {
    path: '/admin/permissions/spaces',
    menuKey: '/admin/permissions',
    Component: SpacePermissions,
    title: 'Spaces',
    isAdmin: true,
  },
  createSpacePermission: {
    path: '/admin/permissions/spaces/create',
    menuKey: '/admin/permissions',
    Component: CreateSpacePermission,
    title: 'Create',
    isAdmin: true,
  },
  editSpacePermission: {
    path: '/admin/spaces/:sid/permissions/:pid/edit',
    menuKey: '/admin/spaces',
    Component: EditSpacePermission,
    title: 'Edit',
    isAdmin: true,
  },
  organisationRequests: {
    path: '/admin/requests/organisations',
    menuKey: '/admin/requests',
    Component: OrganisationRequests,
    title: 'Organisations',
    isOwner: true,
  },
  createOrganisationRequest: {
    path: '/admin/requests/organisations/create',
    menuKey: '/admin/requests',
    Component: CreateOrganisationRequest,
    title: 'New Request',
    isOwner: true,
  },
  spaceRequests: {
    path: '/admin/requests/spaces',
    menuKey: '/admin/requests',
    Component: SpaceRequests,
    title: 'Spaces',
    isOwner: true,
  },
  createSpaceRequest: {
    path: '/admin/requests/spaces/create',
    menuKey: '/admin/requests',
    Component: CreateSpaceRequest,
    title: 'New Request',
    isOwner: true,
  },
  categories: {
    path: '/categories',
    menuKey: '/categories',
    Component: Categories,
    title: 'Categories',
    permission: {
      resource: 'categories',
      action: 'get',
    },
  },
  createCategory: {
    path: '/categories/create',
    menuKey: '/categories',
    Component: CreateCategory,
    title: 'New Category',
    permission: {
      resource: 'categories',
      action: 'create',
    },
  },
  editCategory: {
    path: '/categories/:id/edit',
    menuKey: '/categories',
    Component: EditCategory,
    title: 'Edit',
    permission: {
      resource: 'categories',
      action: 'update',
    },
  },
  policies: {
    path: '/settings/members/policies',
    menuKey: '/members',
    Component: Policies,
    title: 'Policies',
  },
  roles: {
    path: '/settings/members/roles',
    menuKey: '/members',
    Component: Roles,
    title: 'Roles',
  },
  roleEdit: {
    path: '/settings/members/roles/:id/edit',
    Component: EditRole,
    menuKey: '/members/roles/edit',
    title: 'Edit Role',
  },
  roleUsers: {
    path: '/settings/members/roles/:roleID/users',
    menuKey: '/members',
    Component: RoleUsers,
    title: 'Role Users',
  },
  createPolicy: {
    path: '/settings/members/policies/create',
    menuKey: '/members',
    Component: CreatePolicy,
    title: 'New Policy',
    permission: {
      resource: 'policies',
      action: 'create',
    },
  },
  ViewPolicy: {
    path: '/settings/members/policies/:policyID/view',
    menuKey: '/members',
    Component: ViewPolicy,
    title: 'Policy',
  },
  createRole: {
    path: '/settings/members/roles/create',
    menuKey: '/members',
    Component: CreateRole,
    title: 'New Role',
    // permission: {
    //   resource: 'policies',
    //   action: 'create',
    // },
  },
  editPolicy: {
    path: '/settings/members/policies/:id/edit',
    menuKey: '/members',
    Component: EditPolicy,
    title: 'Edit',
    permission: {
      resource: 'policies',
      action: 'update',
    },
  },
  formats: {
    path: '/settings/advanced/formats',
    menuKey: '/advanced',
    Component: Formats,
    title: 'Formats',
    permission: {
      resource: 'formats',
      action: 'get',
    },
  },
  createFormat: {
    path: '/settings/advanced/formats/create',
    menuKey: '/advanced',
    Component: CreateFormat,
    title: 'New Format',
    permission: {
      resource: 'formats',
      action: 'create',
    },
  },
  editFormat: {
    path: '/settings/advanced/formats/:id/edit',
    menuKey: '/advanced',
    Component: EditFormat,
    title: 'Edit',
    permission: {
      resource: 'formats',
      action: 'update',
    },
  },
  tags: {
    path: '/tags',
    menuKey: '/tags',
    Component: Tags,
    title: 'Tags',
    permission: {
      resource: 'tags',
      action: 'get',
    },
  },
  createTag: {
    path: '/tags/create',
    menuKey: '/tags',
    Component: CreateTag,
    title: 'New Tag',
    permission: {
      resource: 'tags',
      action: 'create',
    },
  },
  editTag: {
    path: '/tags/:id/edit',
    menuKey: '/tags',
    Component: EditTag,
    title: 'Edit',
    permission: {
      resource: 'tags',
      action: 'update',
    },
  },
  media: {
    path: '/media',
    menuKey: '/media',
    Component: Media,
    title: 'Media',
    permission: {
      resource: 'media',
      action: 'get',
    },
  },
  createMedia: {
    path: '/media/upload',
    menuKey: '/media',
    Component: UploadMedium,
    title: 'Upload',
    permission: {
      resource: 'media',
      action: 'create',
    },
  },
  editMedium: {
    path: '/media/:id/edit',
    menuKey: '/media',
    Component: EditMedium,
    title: 'Edit',
    permission: {
      resource: 'media',
      action: 'update',
    },
  },
  posts: {
    path: '/posts',
    menuKey: '/posts',
    Component: Posts,
    title: 'Posts',
  },
  createPost: {
    path: '/posts/create',
    menuKey: '/posts',
    Component: CreatePost,
    title: 'New Post',
    permission: {
      resource: 'posts',
      action: 'create',
    },
  },
  editPost: {
    path: '/posts/:id/edit',
    menuKey: '/posts',
    Component: EditPost,
    title: 'Edit',
    permission: {
      resource: 'posts',
      action: 'update',
    },
  },
  ratings: {
    path: '/ratings',
    menuKey: '/ratings',
    Component: Ratings,
    title: 'Ratings',
    permission: {
      resource: 'ratings',
      action: 'get',
    },
  },
  createRating: {
    path: '/ratings/create',
    menuKey: '/ratings',
    Component: CreateRating,
    title: 'New Rating',
    permission: {
      resource: 'ratings',
      action: 'create',
    },
  },
  editRating: {
    path: '/ratings/:id/edit',
    menuKey: '/ratings',
    Component: EditRating,
    title: 'Edit',
    permission: {
      resource: 'ratings',
      action: 'update',
    },
  },
  claimants: {
    path: '/claimants',
    menuKey: '/claimants',
    Component: Claimants,
    title: 'Claimants',
    permission: {
      resource: 'claimants',
      action: 'get',
    },
  },
  createClaimant: {
    path: '/claimants/create',
    menuKey: '/claimants',
    Component: CreateClaimant,
    title: 'New Claimant',
    permission: {
      resource: 'claimants',
      action: 'create',
    },
  },
  editClaimant: {
    path: '/claimants/:id/edit',
    menuKey: '/claimants',
    Component: EditClaimant,
    title: 'Edit',
    permission: {
      resource: 'claimants',
      action: 'update',
    },
  },
  claims: {
    path: '/claims',
    menuKey: '/claims',
    Component: Claims,
    title: 'Claims',
    permission: {
      resource: 'claims',
      action: 'get',
    },
  },
  createClaim: {
    path: '/claims/create',
    menuKey: '/claims',
    Component: CreateClaim,
    title: 'New Claim',
    permission: {
      resource: 'claims',
      action: 'create',
    },
  },
  editClaim: {
    path: '/claims/:id/edit',
    menuKey: '/claims',
    Component: EditClaim,
    title: 'Edit',
    permission: {
      action: 'update',
      resource: 'claims',
    },
  },
  factCheck: {
    path: '/fact-checks',
    menuKey: '/fact-checks',
    Component: FactCheck,
    title: 'Fact-Checks',
  },
  createFactCheck: {
    path: '/fact-checks/create',
    menuKey: '/fact-checks',
    Component: CreateFactCheck,
    title: 'Create',
    permission: {
      resource: 'fact-checks',
      action: 'create',
    },
  },
  editFactCheck: {
    path: '/fact-checks/:id/edit',
    menuKey: '/fact-checks',
    Component: EditFactCheck,
    title: 'Edit',
    permission: {
      action: 'update',
      resource: 'fact-checks',
    },
  },
  googleFactCheck: {
    path: '/fact-checks/google',
    menuKey: '/fact-checks/google',
    Component: GoogleFactCheck,
    title: 'Google',
  },
  sach: {
    path: '/fact-checks/sach',
    menuKey: '/fact-checks/sach',
    Component: Factly,
    title: 'Sach',
  },
  users: {
    path: '/settings/members/users',
    menuKey: '/members',
    Component: Users,
    title: 'Users',
  },
  usersPermission: {
    path: '/settings/members/users/:id/permissions',
    menuKey: '/members',
    Component: PermissionList,
    title: 'Users Permission ',
    permission: {
      resource: 'users',
      action: 'get',
    },
  },
  menu: {
    path: '/settings/website/menus',
    menuKey: '/website',
    Component: Menu,
    title: 'Menus',
  },
  createMenu: {
    path: '/settings/website/menus/create',
    menuKey: '/website',
    Component: CreateMenu,
    title: 'New Menu',
    permission: {
      resource: 'menus',
      action: 'create',
    },
  },
  editMenu: {
    path: '/settings/website/menus/:id/edit',
    menuKey: '/website',
    Component: EditMenu,
    title: 'Edit',
    permission: {
      resource: 'menus',
      action: 'update',
    },
  },
  pages: {
    path: '/pages',
    menuKey: '/pages',
    Component: Pages,
    title: 'Pages',
  },
  createPage: {
    path: '/pages/create',
    menuKey: '/pages',
    Component: CreatePage,
    title: 'New Page',
    permission: {
      resource: 'pages',
      action: 'create',
    },
  },
  editPage: {
    path: '/pages/:id/edit',
    menuKey: '/pages',
    Component: EditPage,
    title: 'Edit',
    permission: {
      resource: 'pages',
      action: 'update',
    },
  },
  events: {
    path: '/admin/events',
    menuKey: '/admin/events',
    Component: Events,
    title: 'Events',
    isAdmin: true,
  },
  createEvent: {
    path: '/admin/events/create',
    menuKey: '/admin/events',
    Component: CreateEvent,
    title: 'New Event',
    isAdmin: true,
  },
  editEvent: {
    path: '/admin/events/:id/edit',
    menuKey: '/admin/events',
    Component: EditEvent,
    title: 'Edit',
    isAdmin: true,
  },
  webhooks: {
    path: '/settings/advanced/webhooks',
    menuKey: '/advanced',
    Component: Webhooks,
    title: 'Webhooks',
    permission: {
      resource: 'webhooks',
      action: 'get',
    },
  },
  createWebhook: {
    path: '/settings/advanced/webhooks/create',
    menuKey: '/advanced',
    Component: CreateWebhook,
    title: 'New Webhook',
    permission: {
      resource: 'webhooks',
      action: 'create',
    },
  },
  editWebhook: {
    path: '/settings/advanced/webhooks/:id/edit',
    menuKey: '/advanced',
    Component: EditWebhook,
    title: 'Edit',
    permission: {
      resource: 'webhooks',
      action: 'update',
    },
  },
  profile: {
    path: '/profile',
    menuKey: '/profile',
    Component: Profile,
    title: 'Edit Profile',
  },
  settings: {
    path: '/settings',
    menuKey: '/settings',
    title: 'Settings',
    Component: Settings,
  },
  website: {
    path: '/website',
    menuKey: '/website',
    Component: Website,
    title: 'Website',
  },
  members: {
    path: '/members',
    menuKey: '/members',
    Component: Members,
    title: 'Members',
  },
  advanced: {
    path: '/advanced',
    menuKey: '/advanced',
    Component: Advanced,
    title: 'Advanced',
  },
  redirect: {
    path: '/redirect',
    menuKey: '/redirect',
    Component: Callback,
  },
  noMatch: {
    path: '*',
    menuKey: '*',
    Component: () => (
      <Result
        status="403"
        title="404"
        subTitle="Sorry, page not found"
        extra={
          <Link to="/">
            <Button type="primary">Back Home</Button>
          </Link>
        }
      />
    ),
  },
};
export const sidebarMenu = [
  {
    title: 'Dashboard',
    Icon: (props) => <HomeOutlined {...props} />,
    children: [routes.home, routes.analytics],
    isService: false,
  },
  {
    title: 'Core',
    Icon: (props) => <InfoCircleOutlined {...props} />,
    children: [routes.posts, routes.pages, routes.categories, routes.tags, routes.media],
    isService: true,
  },
  {
    title: 'Fact Checking',
    Icon: (props) => <SecurityScanOutlined {...props} />,
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
    Icon: (props) => <AudioOutlined {...props} />,
    children: [routes.episodes, routes.podcasts],
    isService: true,
  },
  {
    title: 'Administration',
    Icon: (props) => <GlobalOutlined {...props} />,
    children: [routes.spaces, routes.requests, routes.permissions, routes.events],
    isService: false,
  },
];

export default routes;
