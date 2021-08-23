---
sidebar_position: 3
---

# Tags

Tags are like hashtags. Tags provide a useful way to group related posts. Tags also make it easier for people to find your content.

Users can add or assign tags while creating a post. While adding a tag for a post, if a Tag does not exist then click on Create a Tag button. This allows users to quickly create a new tag and assign it to a post.

Tags can be added from the Tags menu item by clicking on the New Tag button on the right side.

- Name: Name of a tag
- Description: Describe what tag is for
- Featured Image: Image for a tag
- Featured - This field can be used to highlight the Tag on the website if it is enabled.

### SEO Metadata
Apart from the basic information, extra data can be added such as [SEO metadata](/docs/features/search-engine-optimisation). SEO metadata includes title, description, and canonical URL. It can be added by clicking on the Add MetaData button.

### Metafields
There is also a provision to add more information about the tag if the field is not included in the form. The user can use the [Metafields](/docs/features/extend-features) section by clicking on the Meta Fields section to feed in extra data as a JSON object.

Customizing the header and footer specific to a tag can be done by adding code in the Code Injection section by clicking on the Code Injection section.

All the Tags will be available under the Tags menu.
Search and sort options are available to simplify the search for a Tag. Tags can be deleted by clicking on the Delete button. To edit a Tag click on the name of the tag in the list.

### Policies

The default policies for the tags are:

- Admin, Editor and Author have the permission to read, create, update and delete the tags.
  Apart from the default policies, the admin can customize the [policies](/docs/core-concepts/policies) from Policies Menu.

### Events

The defined events for the tags to trigger notification are:

| Events     | Description                     |
| ---------- | ------------------------------- |
| Create Tag | Triggered when a tag is added   |
| Update Tag | Triggered when a tag is edited  |
| Delete Tag | Triggered when a tag is deleted |

These events can be registered while creating a webhook. These Events can be configured from [Events](/docs/core-concepts/events) menu.
