---
sidebar_position: 9
---

# Events

Events define when to trigger a notification for a webhook.

Webhooks
Webhooks are used to notify the users when defined events have occurred. These allow Dega to send POST requests to user-configured URLs to send them a notification about it. The request contains a triggered event and the result could be a notification on the set URL. 
To use webhooks, setting up Hukz is required. Hukz is a simple & lightweight service implemented in GO to add webhooks to your application. This service is intended to fire webhooks on different events that are registered.
Webhook can be added from the Webhook menu item by clicking on New Webhook. Webhooks can be added only by admins of the organization.

The user can add default events supported by Dega by clicking on Create default events. Events can be added only by the super organization. While creating webhook supported events are assigned to a webhook.

All the Events will be available under the Events menu. 
Events can be deleted by clicking on the Delete button. To edit an event click on the name of the event in the list.

The events supported in Dega are listed below:

create.category - Triggered when a category is added
update.category - Triggered when a category is edited
delete.category - Triggered when a category is deleted
create.format - Triggered when a format is added
update.format - Triggered when a format is edited
delete.format - Triggered when a format is deleted
create.media - Triggered when a media  is added
update.media - Triggered when a media is edited
delete.media - Triggered when a media is deleted
create.menu - Triggered when a menu is added
update.menu - Triggered when a menu is edited
delete.menu - Triggered when a menu is deleted
create.post - Triggered when a post is added
update.post - Triggered when a post is edited
delete.post - Triggered when a post is deleted
create.template - Triggered when a template is created
publish.post - Triggered when a post is published
unpublish.post - Triggered when a post is unpublished
ready.post - Triggered when a post is saved as Ready to Publish
create.space - Triggered when a space is added
update.space - Triggered when a space is edited
delete.space -Triggered when a space is deleted
create.tag - Triggered when a tag is added
update.tag - Triggered when a tag is edited
delete.tag - Triggered when a tag is deleted
create.claim - Triggered when a claim is added
update.claim - Triggered when a claim is edited
delete.claim - Triggered when a claim is deleted
create.claimant - Triggered when a claimant is added
update.claimant - Triggered when a claimant is edited
delete.claimant - Triggered when a claimant is deleted
create.rating - Triggered when a rating is added
update.rating - Triggered when a rating is edited
delete.rating - Triggered when a rating is deleted 
create.podcast - Triggered when a podcast is added
update.podcast - Triggered when a podcast is edited
delete.podcast - Triggered when a podcast is deleted
create.episode - Triggered when a episode is added
update.episode - Triggered when a episode is edited
delete.episode - Triggered when a episode is deleted
