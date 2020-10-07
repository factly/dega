import { useSelector } from 'react-redux';

function getUserPermission({ resource, action }) {
  const userPermission = useSelector(({ spaces }) => {
    const { selected, details } = spaces;
    return details[selected] ? details[selected].permissions : [];
  });

  const node = userPermission.findIndex(
    (each) =>
      each.resource === 'admin' || (each.resource === resource && each.actions.includes(action)),
  );

  return node > -1 ? userPermission[node].actions : [];
}

export default getUserPermission;
