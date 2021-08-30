---
sidebar_position: 7
---

# Media

All the media files used across the space are available here. The media files used in the space are reusable across different posts, settings, etc.
The administrator of an organization can limit the number of media files allowed within a space. This limit can be configured from the Space Requests menu by creating a request to change the media file limit for a space.

Media can be added from the Media menu by clicking on the Upload button on the right side.

Uploading new media is supported by Uppy. More than one image can also be uploaded at a time. Media to be uploaded can be selected from the device, google drive, or through a link.
While uploading, basic editing options like crop, rotate, etc are provided.

- Caption: This allows users to add a caption
- Alt-Text: This allows users to provide alternative text
- Description: This allows users to describe the media
- Delete button - To delete the media

### Metafields

There is also a provision to add more information about the media if the field is not included in the form. The user can use the [Metafields](/docs/features/extend-features) to feed in extra data as a JSON object.

All the media will be available under the Media menu.
[Search](/docs/features/search-and-filtering) and sort options are available to simplify the search for an image. To edit a Media click on the image in the list.

### Policies

The default policies for the media are:

- Editor and Admin have the permission to read, create, update, delete and publish the media.
- Author have the permission to read, create and update the media.
- Contributor have the permission to read and create media.
  Apart from the default policies, the admin can customize the [policies](/docs/core-concepts/policies) from Policies Menu.

### Events

The defined events for the posts to trigger notification are:

| Events       | Description                       |
| ------------ | --------------------------------- |
| Create Media | Triggered when a media is added   |
| Update Media | Triggered when a media is edited  |
| Delete Media | Triggered when a media is deleted |

These events can be registered while creating a webhook. These Events can be configured from [Events](/docs/core-concepts/events) menu.
