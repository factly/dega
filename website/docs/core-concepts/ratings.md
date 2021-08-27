---
sidebar_position: 5
---

# Ratings

Each claim has a rating associated with it. Fact-checkers while creating a claim assign ratings to it. Organizations can have their rating system or can use the default ratings available. To add the default ratings the user can click on Create Default Ratings.

The default ratings for Dega are

- True
- False
- Misleading
- Unverified
- Party True

The attributes of a rating are :

- Name: Name for the rating
- Numeric Value: Rating value associated with each rating
- Background Color: This allows users to choose a background color to display for a rating
- Text Color: This allows users to choose a text color for a rating for displaying
- Preview: This previews the rating display with the selected background and text colors
- Description: Describes what the rating is.

### SEO Metadata

Apart from the basic information, extra data can be added such as [SEO metadata](/docs/features/search-engine-optimisation). SEO metadata includes title, description, and canonical URL. It can be added by clicking on the Add MetaData button.

### Metafields

There is also a provision to add more information about the rating if the field is not included in the form. The user can use the [Metafields](/docs/features/extend-features) section by clicking on the Meta Fields section to feed in extra data as a JSON object.

Customizing the header and footer specific to a rating can be done by adding code in the Code Injection section by clicking on the Code Injection section.

All the Ratings will be available under the Ratings menu.
Ratings can be deleted by clicking on the Delete button. To edit a Rating click on the name of the rating in the list.

### Policies

The default policies for the ratings are:

- Editor and Admin have the permission to read, create, update and delete the ratings.
- Author and Contributor have the permission to read ratings.
  Apart from the default policies, the admin can customize the [policies](/docs/core-concepts/policies) from Policies Menu.

### Events

The defined events for the ratings to trigger notification are:

| Events        | Description                        |
| ------------- | ---------------------------------- |
| Create Rating | Triggered when a rating is added   |
| Update Rating | Triggered when a rating is edited  |
| Delete Rating | Triggered when a rating is deleted |

These events can be registered while creating a webhook. These Events can be configured from [Events](/docs/core-concepts/events) menu.
