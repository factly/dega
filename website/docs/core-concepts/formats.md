---
sidebar_position: 5
---

# Formats

Formats for a space can be created from the Formats menu. Creating formats is a must for writing any post or fact-check. Default formats for Dega can be added by clicking on the Create default Formats.

The current default formats available in Dega are:

- Fact-Check
- Article

Fact-Check and Article formats are mandatory formats for Dega.

- Name: This allows the user to add a Name of the format
- Featured - This field can be used to highlight the Format on the website if it is enabled.
- Featured Image - Image for the format
- Description: Describes what the format is.

### SEO Metadata

Apart from the basic information, extra data can be added such as [SEO metadata](/docs/features/search-engine-optimisation). SEO metadata includes title, description, and canonical URL. It can be added by clicking on the Add MetaData button.

### Metafields

There is also a provision to add more information about the format if the field is not included in the form. The user can use the [Metafields](/docs/features/extend-features) section by clicking on the Meta Fields section to feed in extra data as a JSON object.

Customizing the header and footer specific to a format can be done by adding code in the Code Injection section by clicking on the Code Injection section.

All the Formats will be available under the Formats menu.
Formats can be deleted by clicking on the Delete button. To edit a Format click on the name of the format in the list.

### Policies

The default policies for the formats are:

- Admin have the permission to read, create, update and delete the formats.
- Editor, Author and Contributor have the permission to read formats.
  Apart from the default policies, the admin can customize the [policies](/docs/core-concepts/policies) from Policies Menu.

### Events

The defined events for the ratings to trigger notification are:

| Events        | Description                        |
| ------------- | ---------------------------------- |
| Create Format | Triggered when a format is added   |
| Update Format | Triggered when a format is edited  |
| Delete Format | Triggered when a format is deleted |

These events can be registered while creating a webhook. These Events can be configured from [Events](/docs/core-concepts/events) menu.
