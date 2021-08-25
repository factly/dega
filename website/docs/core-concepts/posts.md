---
sidebar_position: 10
---

# Posts

Posts are articles or stories which may include images or other illustrations.
New Post can be created from the Posts menu by clicking on the New Post button on the right side.

The user can start writing a post using an [editor](/docs/features/powerful-editor) which is a rich text editor. It makes embedding images, links, or any related content very easy.

The user can directly publish or can save it as a draft. The user can also mark the post as ready to Publish.

Each post created has status from any of the following.

- Draft
- Published
- Ready to Publish

To save as draft click on the Save button on the right and to save as Ready to Publish, before clicking on the Save button make sure Ready to Publish is checked.

To publish the Post click on the Publish button. Only the user who is either admin or an admin or has the permission to publish can publish the Post.

Once the post is created, templates can be created from the post which can be used for future posts. Templates can be created by clicking on the Create Template button.
New posts can be created from templates by clicking on any of the templates available from the Templates section which is at the top of the Post page

The user can add information about the post by clicking on the Settings button.

- Featured Image - An image that is a pictorial representation of the content and can also be used as a thumbnail for the post.
- Excerpt - Brief description of the post
- [Tags](/docs/core-concepts/tags) - This allows you to add or assign tags to the post
- [Categories](/docs/core-concepts/categories) - This allows you to add or assign categories to the post
- Authors - This allows you to add the author of the post
- Published Date - The date of publishing for the post. If not entered automatically takes the current date when clicked on the Publish button.

### SEO Metadata

Apart from the basic information, extra data can be added such as [SEO metadata](/docs/features/search-engine-optimisation). SEO metadata includes title, description, and canonical URL. It can be added by clicking on the Add MetaData button.

### Metafields

There is also a provision to add more information about the post if the field is not included in the form. The user can use the [Metafields](/docs/features/extend-features) section by clicking on the Add Meta Fields button to feed in extra data as a JSON object.

### Code Injection

Customizing the header and footer specific to a post can be done by adding code in the Code Injection section by clicking on the Code Injection button.

### Schema
Schema is generated automatically in the backend. This will be available in the Schema Section.

All the posts will be available under the Posts menu. The list shows posts with their categories, tags, and status. Three options are available: Edit, Quick Edit, and Delete.

To simplify the [search](/docs/features/search-and-filtering) for a post, filter and sort options are available.
Click on the More filters button right next to the New Post button to see the available filters.
Available filters are Tags, Categories, Status, Authors.

The quick edit option helps to quickly edit any post settings such as tags, categories, authors, status, published date, title, etc.

To view the total number of posts, click on the Dashboard menu.
It shows total Posts as well as a count of Posts that are: draft, published, and ready to publish.

### Policies

The default policies for the posts are:

- Editor and Admin have the permission to read, create, update, delete and publish the posts.
- Author and Contributor have the permission to read, create and update the posts.
  Apart from the default policies, the admin can customize the [policies](/docs/core-concepts/policies) from Policies Menu.

### Events

The defined events for the posts to trigger notification are:

| Events          | Description                                        |
| --------------- | -------------------------------------------------- |
| Create Post     | Triggered when a post is added                     |
| Update Post     | Triggered when a post is edited                    |
| Delete Post     | Triggered when a post is deleted                   |
| Create Template | Triggered when a template is created               |
| Publish Post    | Triggered when a post is published                 |
| Unpublish Post  | Triggered when a post is unpublished               |
| Ready Post      | Triggered when a post is saved as Ready to Publish |

These events can be registered while creating a webhook. These Events can be configured from [Events](/docs/core-concepts/events) menu.
