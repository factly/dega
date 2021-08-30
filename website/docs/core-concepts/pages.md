---
sidebar_position: 11
---

# Pages

A Page is an area on your site where you can display content. A page can be about anything at all. Some of the most common pages on a website include Home, About, and Contact pages.

You can add as many pages to your site as you would like, and you can update your pages as many times as you want. After a page is created, it can be added to the site's navigation menu.

New Page can be created from the Pages menu by clicking on the New Page button on the right side.

The user can start writing a page using an [editor](/docs/features/powerful-editor) which is a rich text editor. It makes embedding images, links, or any related content very easy.

The user can directly publish or can save it as a draft. The user can also mark the page as ready to Publish.

Each page created has status from any of the following.

- Draft
- Published
- Ready to Publish

To save as draft click on the Save button on the right and to save as Ready to Publish, before clicking on the Save button make sure Ready to Publish is checked.

To publish the Page click on the Publish button. Only the user who is either an admin or has the permission to publish can publish the Page.

Once the page is created, templates can be created from the page which can be used for future page. Templates can be created by clicking on the Create Template button.
New pages can be created from templates by clicking on any of the templates available from the Templates section which is at the top of the Pages page.

The user can add information about the page by clicking on the Settings button.

- Featured Image - An image that is a pictorial representation of the content and can also be used as a thumbnail for the page.
- Excerpt - Brief description of the page
- [Tags](/docs/core-concepts/tags) - This allows you to add or assign tags to the page
- [Categories](/docs/core-concepts/categories) - This allows you to add or assign categories to the page
- Authors - This allows you to add the author of the page
- Published Date - The date of publishing for the page. If not entered automatically takes the current date when clicked on the Publish button.

### SEO Metadata

Apart from the basic information, extra data can be added such as [SEO metadata](/docs/features/search-engine-optimisation). SEO metadata includes title, description, and canonical URL. It can be added by clicking on the Add MetaData button.

### Metafields

There is also a provision to add more information about the page if the field is not included in the form. The user can use the [Metafields](/docs/features/extend-features) section by clicking on the Add Meta Fields button to feed in extra data as a JSON object.

### Code Injection

Customizing the header and footer specific to a page can be done by adding code in the Code Injection section by clicking on the Code Injection button.

### Schema

Schema is generated automatically in the backend. This will be available in the Schema Section.

All the pages will be available under the Pages menu. The list shows pages with their categories, tags, and status. Three options are available: Edit, Quick Edit, and Delete.

To simplify the [search](/docs/features/search-and-filtering) for a page, filter and sort options are available.
Click on the More filters button right next to the New Page button to see the available filters.
Available filters are Tags, Categories, Status, Authors.

The quick edit option helps to quickly edit any page settings such as tags, categories, authors, status, published date, title, etc.

### Policies

The default policies for the pages are:

- Editor and Admin have the permission to read, create, update, delete and publish the pages.
- Author and Contributor have the permission to read, create and update the pages.
  Apart from the default policies, the admin can customize the [policies](/docs/core-concepts/policies) from Policies Menu.

### Events

The defined events for the pages to trigger notification are:

| Events      | Description                      |
| ----------- | -------------------------------- |
| Create Page | Triggered when a page is added   |
| Update Page | Triggered when a page is edited  |
| Delete Page | Triggered when a page is deleted |

These events can be registered while creating a webhook. These Events can be configured from [Events](/docs/core-concepts/events) menu.
