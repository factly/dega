---
sidebar_position: 3
---

# Claims

Claims given by any claimant can be added here. These claims can be assigned to a Fact-check. The user can add a claim from the Claims menu item by clicking on the New claim button on the right side.

Claim Settings:

- Claim - Title of the claim.
- Fact - Facts about the claim.
- [Claimant](/docs/core-concepts/claimants) - This allows you to add the claimant who made the claim
- [Rating](/docs/core-concepts/ratings) - This allows you to rate the claim, i.e True, False, etc.
- Claim Date - Date on which the claim was made
- CheckedDate - Date on which the claim was checked by fact-checkers
- Description - Describes what the claim is for.
- Claim Sources - This allows you to add a list of claim sources.
  By clicking on the Add Claim Sources button, new fields are added to add information about the claim sources. Url and description can be provided for each claim source.
- Review Sources - This allows you to add a list of review sources.
  By clicking on the Add Review Sources button, new fields are added to add information about the review sources. Url and description can be provided for each review source.

### SEO Metadata

Apart from the basic information, extra data can be added such as [SEO metadata](/docs/features/search-engine-optimisation). SEO metadata includes title, description, and canonical URL. It can be added by clicking on the Add MetaData button.

### Metafields

There is also a provision to add more information about the claim if the field is not included in the form. The user can use the [Metafields](/docs/features/extend-features) section by clicking on the Meta Fields section to feed in extra data as a JSON object.

Customizing the header and footer specific to a claim can be done by adding code in the Code Injection section by clicking on the Code Injection section.

All the Claims will be available under the Claims menu.
[Filter](/docs/features/search-and-filtering) and sort options are available to simplify the search for Claims. Available filters are Ratings and Claimants. Claims can be deleted by clicking on the Delete button. To edit a Claim click on the name of the claim in the list.

### Policies

The default policies for the claims are:

- Editor and Admin have the permission to read, create, update and delete the claims.
- Author and Contributor have the permission to read, create and update the claims.
  Apart from the default policies, the admin can customize the [policies](/docs/core-concepts/policies) from Policies Menu.

### Events

The defined events for the posts to trigger notification are:

| Events       | Description                       |
| ------------ | --------------------------------- |
| Create Claim | Triggered when a claim is added   |
| Update Claim | Triggered when a claim is edited  |
| Delete Claim | Triggered when a claim is deleted |

These events can be registered while creating a webhook. These Events can be configured from [Events](/docs/core-concepts/events) menu.
