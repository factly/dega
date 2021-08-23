---
sidebar_position: 3
---

# Categories

Categories help to group related posts.
Users can add or assign categories while creating a post. While adding a category for a post, if a category does not exist then click on Create a Category. This allows users to quickly create a new category and assign it to a post.

Category can be added from the Categories menu item by clicking on the New Category button on the right side.

- Name: Name of a category
- Parent Category: Select Parent category for the category
- Featured - This field can be used to highlight the Category on the website if it is enabled.
- Featured Image: Image of category
- Description: Describes what the category is for.

### SEO Metadata
Apart from the basic information, extra data can be added such as [SEO metadata](/docs/features/search-engine-optimisation). SEO metadata includes title, description, and canonical URL. It can be added by clicking on the Add MetaData button.

### Metafields
There is also a provision to add more information about the category if the field is not included in the form. The user can use the [Metafields](/docs/features/extend-features) section by clicking on the Meta Fields section to feed in extra data as a JSON object.

Customizing the header and footer specific to a category can be done by adding code in the Code Injection section by clicking on the Code Injection section.

All the Categories will be available under the Categories menu.
Search and sort options are available to simplify the search for a Category. Categories can be deleted by clicking on the Delete button. To edit a Category click on the name of the category in the list.

### Policies

The default policies for the categories are:

- Admin, Editor and Author have the permission to read, create, update and delete the categories.
  Apart from the default policies, the admin can customize the [policies](/docs/core-concepts/policies) from Policies Menu.

### Events

The defined events for the posts to trigger notification are:

| Events          | Description                          |
| --------------- | ------------------------------------ |
| Create Category | Triggered when a category is added   |
| Update Category | Triggered when a category is edited  |
| Delete Category | Triggered when a category is deleted |

These events can be registered while creating a webhook. These Events can be configured from [Events](/docs/core-concepts/events) menu.
