---
sidebar_position: 2
---

# Fact Checks

Fact-checks are posts of format: fact-check. Fact-checks have all the features available in a regular post (format: default) and are extended to add features specific to fact-checking.
Fact-Check can include claims and images.
New fact-check can be created from the Fact-Checks menu by clicking on the New Fact-Check button on the right side.

The user can start writing fact-check using an [editor](/docs/features/powerful-editor) which is a rich text editor. It makes embedding images, links, or any related content very easy.

The user can directly publish or can save it as a draft. The user can also mark the post as ready to Publish.

Each post created has status from any of the following.

- Draft
- Published
- Ready to Publish

To save as draft click on the Save button on the right and to save as Ready to Publish; before clicking on the Save button make sure Ready to Publish is checked.
To publish the Fact-Check click on the Publish button. Only the user who is either an admin or has the permission to publish can publish the fact-check.

Once the post is created, templates can be created from the post which can be used for future fact-checks. Templates are created by clicking on the Create Template button.
New Fact-checks can be created from templates by clicking on any of the templates available from the Templates section which is at the top of the Fact-check page.

The user can add information about the fact-check by clicking on the Settings button.

- Featured Image - An image that is a pictorial representation of the content and can also be used as a thumbnail for the fact-check.
- Excerpt - Brief description of the post
- [Tags](/docs/core-concepts/tags) - This allows users to add or assign tags to the post
- [Categories](/docs/core-concepts/categories) - This allows users to add or assign categories to the post
- [Claims](docs/core-concepts/claims) - This allows users to add claims to the post. The user can either select from the existing list of claims or can create a new claim by clicking on the Add claim button.
  When clicked on the Add Claim button, a modal popup opens to add in details about the claim.
  A Fact-check can have multiple claims.
- Authors - This allows users to add the author of the post
- Published Date - The date of publishing for the fact-check. If not entered automatically takes the current date when clicked on the Publish button.

### SEO Metadata

Apart from the basic information, extra data can be added such as [SEO metadata](/docs/features/search-engine-optimisation). SEO metadata includes title, description, and canonical URL. It can be added by clicking on the Add MetaData button.

### Metafields

There is also a provision to add more information about the fact-check if the field is not included in the form. The user can use the [Metafields](/docs/features/extend-features) section by clicking on the Add Meta Fields button to feed in extra data as a JSON object.

### Code Injection

Customizing the header and footer specific to a post can be done by adding code in the Code Injection section by clicking on the Code Injection button.

### Schema

Schema is generated automatically in the backend. This will be available in the Schema Section.

All the fact-checks will be available under the Fact-Check menu. The list shows fact-checks with their categories, tags, and status. Three options are available: Edit, Quick Edit, and Delete.

To simplify the [search](/docs/features/search-and-filtering) for a fact-check, filter and sort options are available.
Click on the More filters button right next to the New Fact-Check button to see the available filters.
Available filters are Tags, Categories, Status, Authors.

The quick edit option helps to quickly edit any fact-check post settings such as tags, categories, authors, claims, status, published date, title, etc.

To view the total number of Fact-Checks, click on the Dashboard menu.
It shows total Fact-checks as well as a count of Fact-Checks that are: draft, published, and ready to publish.

### Policies

The default policies for the fact-checks are:

- Editor and Admin have the permission to read, create, update, delete and publish the fact-checks.
- Author and Contributor have the permission to read, create and update the fact-checks.
  Apart from the default policies, the admin can customize the [policies](/docs/core-concepts/policies) from Policies Menu.

### Events

The defined events for the fact-checks to trigger notification are:

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
