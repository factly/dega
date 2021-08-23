---
sidebar_position: 9
---

# Events

Events define when to trigger a notification for a webhook.

#### Webhooks
Webhooks are used to notify the users when defined events have occurred. These allow Dega to send POST requests to user-configured URLs to send them a notification about it. The request contains a triggered event and the result could be a notification on the set URL. 
To use webhooks, setting up [Hukz](https://github.com/factly/hukz) is required. Hukz is a simple & lightweight service implemented in GO to add webhooks to your application. This service is intended to fire webhooks on different events that are registered.
Webhook can be added from the Webhook menu item by clicking on New Webhook. Webhooks can be added only by admins of the organization.

The user can add default events supported by Dega by clicking on Create default events. Events can be added only by the super organization. While creating webhook supported events are assigned to a webhook.

All the Events will be available under the Events menu. 
Events can be deleted by clicking on the Delete button. To edit an event click on the name of the event in the list.

The events supported in Dega are listed below:

|  Events          | Description                                        |
|------------------|----------------------------------------------------|
| Create Category  | Triggered when a category is added                 |
| Update Category  | Triggered when a category is edited                |
| Delete Category  | Triggered when a category is deleted               |
| Create Format    | Triggered when a format is added                   |
| Update Format    | Triggered when a format is edited                  |
| Delete Format    | Triggered when a format is deleted                 |
| Create Media     | Triggered when a media  is added                   |
| Update Media     | Triggered when a media is edited                   |
| Delete Media     | Triggered when a media is deleted                  |
| Create Menu      | Triggered when a menu is added                     |
| Update Menu      | Triggered when a menu is edited                    |
| Delete Menu      | Triggered when a menu is deleted                   |
| Create Post      | Triggered when a post is added                     |
| Update Post      | Triggered when a post is edited                    |
| Delete Post      | Triggered when a post is deleted                   |
| Create Template  | Triggered when a template is created               |
| Publish Post     | Triggered when a post is published                 |
| Unpublish Post   | Triggered when a post is unpublished               |
| Ready Post       | Triggered when a post is saved as Ready to Publish |
| Create Space     | Triggered when a space is added                    |
| Update Space     | Triggered when a space is edited                   |
| Delete Space     | Triggered when a space is deleted                  |
| Create Tag       | Triggered when a tag is added                      |
| Update Tag       | Triggered when a tag is edited                     |
| Delete Tag       | Triggered when a tag is deleted                    |
| Create Claim     | Triggered when a claim is added                    |
| Update Claim     | Triggered when a claim is edited                   |
| Delete Claim     | Triggered when a claim is deleted                  |
| Create Claimant  | Triggered when a claimant is added                 |
| Update Claimant  | Triggered when a claimant is edited                |  
| Delete Claimant  | Triggered when a claimant is deleted               |
| Create Rating    | Triggered when a rating is added                   |
| Update Rating    | Triggered when a rating is edited                  |
| Delete Rating    | Triggered when a rating is deleted                 |
| Create Podcast   | Triggered when a podcast is added                  |
| Update Podcast   | Triggered when a podcast is edited                 |
| Delete Podcast   | Triggered when a podcast is deleted                |
| Create Episode   | Triggered when a episode is added                  |
| Update Episode   | Triggered when a episode is edited                 |
| Delete Episode   | Triggered when a episode is deleted                |
| Create Policy    | Triggered when a policy is added                   |
| Update Policy    | Triggered when a policy is updated                 |
