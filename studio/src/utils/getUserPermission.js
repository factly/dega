export const permissionRequirements = {
  '/posts': [
    { resource: 'categories', action: 'get' },
    { resource: 'tags', action: 'get' },
    { resource: 'posts', action: ['get', 'create'] },
  ],
  '/posts/create': [
    { resource: 'categories', action: 'get' },
    { resource: 'media', action: 'get' },
    { resource: 'tags', action: 'get' },
    { resource: 'posts', action: ['get', 'create'] },
  ],
  '/pages': [
    { resource: 'categories', action: 'get' },
    { resource: 'tags', action: 'get' },
    { resource: 'pages', action: ['get', 'create'] },
  ],
  '/pages/create': [
    { resource: 'categories', action: 'get' },
    { resource: 'media', action: 'get' },
    { resource: 'tags', action: 'get' },
    { resource: 'pages', action: ['get', 'create'] },
  ],
  '/fact-checks': [
    { resource: 'categories', action: 'get' },
    { resource: 'tags', action: 'get' },
    { resource: 'fact-checks', action: ['get', 'create'] },
  ],
  '/fact-checks/create': [
    { resource: 'categories', action: 'get' },
    { resource: 'tags', action: 'get' },
    { resource: 'media', action: 'get' },
    { resource: 'claims', action: 'get' },
    { resource: 'fact-checks', action: ['get', 'create'] },
  ],
  '/claims': [
    { resource: 'claimants', action: 'get' },
    { resource: 'ratings', action: 'get' },
    { resource: 'claims', action: ['get', 'create'] },
  ],
  '/claims/create': [
    { resource: 'claimants', action: 'get' },
    { resource: 'ratings', action: 'get' },
    { resource: 'claims', action: ['get', 'create'] },
  ],
  '/categories/create': [
    { resource: 'media', action: 'get' },
    { resource: 'categories', action: ['get', 'create'] },
  ],
  '/tags/create': [
    { resource: 'media', action: 'get' },
    { resource: 'tags', action: ['get', 'create'] },
  ],
  '/claimants/create': [
    { resource: 'media', action: 'get' },
    { resource: 'claimants', action: ['get', 'create'] },
  ],
  '/ratings/create': [
    { resource: 'media', action: 'get' },
    { resource: 'ratings', action: ['get', 'create'] },
  ],
};

function getUserPermission({ resource, action, spaces }) {
  const { selected, details } = spaces;
  const selectedSpace = details[selected];
  const userPermission =
    selectedSpace && selectedSpace.permissions ? selectedSpace.permissions : [];
  const org_role = selectedSpace && selectedSpace.org_role;

  if (org_role === 'admin') {
    return ['admin'];
  }

  const node = userPermission.findIndex(
    (each) =>
      each.resource === 'admin' || (each.resource === resource && each.actions.includes(action)),
  );

  return node > -1 ? userPermission[node].actions : [];
}

export default getUserPermission;
