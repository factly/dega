---
sidebar_position: 4
---

# Claimants

A claimant is a person who makes a claim. A claimant can be assigned to a claim while creating a claim.
The user can add a claimant from the Claimants menu item by clicking on the New Claimant button on the right side.

- Name - Name of the claimant.
- Featured Image - Image for the claimant
- Tag Line - Tag Line of the claimant
- Featured - This field can be used to highlight the Claimant on the website if it is enabled.
- Description - Information about the claimant

### SEO Metadata
Apart from the basic information, extra data can be added such as [SEO metadata](/docs/features/search-engine-optimisation). SEO metadata includes title, description, and canonical URL. It can be added by clicking on the Add MetaData button.

### Metafields
There is also a provision to add more information about the claimant if the field is not included in the form. The user can use the [Metafields](/docs/features/extend-features) section by clicking on the Meta Fields section to feed in extra data as a JSON object.

Customizing the header and footer specific to a claimant can be done by adding code in the Code Injection section by clicking on the Code Injection section.

All the Claimants will be available under the Claimants menu.
Search and sort options are available to simplify the search for a Claimant. Claimants can be deleted by clicking on the Delete button. To edit a Claimant click on the name of the claimant in the list.

### Policies

The default policies for the claimants are:

- Editor and Admin have the permission to read, create, update and delete the claimants.
- Author have the permission to read, create and update the claimants.
- Contributor have the permission to read and create the claimants.
  Apart from the default policies, the admin can customize the [policies](/docs/core-concepts/policies) from Policies Menu.

### Events

The defined events for the posts to trigger notification are:

| Events          | Description                          |
| --------------- | ------------------------------------ |
| Create Claimant | Triggered when a claimant is added   |
| Update Claimant | Triggered when a claimant is edited  |
| Delete Claimant | Triggered when a claimant is deleted |

These events can be registered while creating a webhook. These Events can be configured from [Events](/docs/core-concepts/events) menu.
