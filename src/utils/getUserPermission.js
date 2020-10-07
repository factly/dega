function getUserPermission({ resource, action, spaces }) {
  const { selected, details } = spaces;
  const userPermission = details[selected] ? details[selected].permissions : [];

  const node = userPermission.findIndex(
    (each) =>
      each.resource === 'admin' || (each.resource === resource && each.actions.includes(action)),
  );

  return node > -1 ? userPermission[node].actions : [];
}

export default getUserPermission;
