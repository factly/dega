---
sidebar_position: 9
---

# Policies

Policies are mandatory for Dega to work as expected. Default Policies can be added by clicking on Create Default Policies and Roles.

The default policies are

- Editor
- Contributor
- Author

A role is associated with a policy that authorizes what a role can access and update.
Each policy defines permission to get, create, update and delete for entities. Permission to publish or update a post is defined in a policy. These policies are used as permission across the Dega space while making any change to any entity.

All the Policies will be available under the Policies menu.
Policies can be deleted by clicking on the Delete button. To edit a Policy click on the name of the policy in the list.

The role can add a new policy from the Policy menu by clicking on the New Policy button on the right side.

- Name: Name of the policy
- roles: This allows the role to select roles of the application to be associated with the policy.
- Description: Describes what the policy is for.

Permission to be provided to the role for each entity can be marked as checked from the options provided.

### Policies

The default policies are:

- Admin have the permission to read, create, update and delete the policy.
- Editor and Author have the permission to read policy.
  Apart from the default policies, the admin can customize the [policies](/docs/core-concepts/policies) from Policies Menu.

### Events

The defined events for the policies to trigger notification are:

| Events        | Description                        |
| ------------- | ---------------------------------- |
| Create Policy | Triggered when a policy is added   |
| Update Policy | Triggered when a policy is updated |

These events can be registered while creating a webhook. These Events can be configured from [Events](/docs/core-concepts/events) menu.
