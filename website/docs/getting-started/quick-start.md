---
sidebar_position: 3
---

import useBaseUrl from '@docusaurus/useBaseUrl';

# Quick Start

If you are using the Managed Environment, you could skip the next paragraph about Super organisation.

When Dega is installed and started for the first time, it automatically creates a `Super organisation` which has admin permissions to manage the entire Dega instance. Name of the organisation is managed by the env variable: `SUPER_ORGANISATION_TITLE` and if you haven't changed the env file as mentioned in the [installation](installation) guide, the super organisation created will have the name: `Dega Administration`.

Also, a super organisation is only created during the startup if the value `CREATE_SUPER_ORGANISATION` is set to `true`. The startup process will skip creating a super organisation, if the value is set to `false` or if an organisation with the name exists already.

## Step 1: Create Space 

[Space](/docs/core-concepts/spaces) is a concept that is consistent with other applications developed at Factly Labs. Following are a few basic concepts that you would want to know about spaces before getting started.

- Each [organisation](/docs/core-concepts/organisations) can have multiple spaces.
- Every website needs at least one space.
- Users within an organisation are managed in Kavach. User access to entities within a space is managed through policies.

Dega supports creating multiple spaces within an organisation that can be managed through the `Spaces` menu item. To begin using the Dega, you need to create your first space within an organisation.The fields are self-explanatory but you can check [claimant](/docs/core-concepts/spaces) section for more details.

## Step 2: Create Formats

Once the Space is created, the user then needs to create [Formats](/docs/core-concepts/formats) for that space from the `Formats` menu item by clicking on the `Create Default Formats` button. The default formats that are created are mandatory for Dega to function as expected would be:

1. Article
1. Fact Check

## Step 3: Create Policies

Once the Space is created, the user then needs to create [Policies](/docs/core-concepts/policies) for that space from the `Policies` menu item by clicking on the `Create Default Policies` button. The default policies that are created and are mandatory for Dega to function as expected would be:

1. Contributor
1. Author
1. Editor

## Step 4: Create Events

This is an optional step. Clicking on the `Create Default Events` will create the default `Events` that are supported in Dega. Setting up [Hukz](https://github.com/factly/hukz) to manage outgoing webhooks is mandatory for events to be created and work as expected.

## Step 5: Create Ratings

Once the Space is created, the user then needs to create [Ratings](/docs/core-concepts/ratings) for that space from the `Ratings` menu item. Different organisations have a different rating mechanisms and you can read more about [here](/docs/core-concepts/ratings). The ratings added here will be available when fact-checking the videos. If you are not sure on what rating system to follow, you can click on `Create Default Ratings` that creates default ratings as defined in Dega.

The default ratings created would be:

1. False
1. Misleading
1. Unverified
1. Partly True
1. True


## Step 6: Create Claimants 

Every Fact Check will have a [claimant](/docs/core-concepts/claimants). So, lets add a claimant from the `claimant` menu. The fields are self-explanatory but you can check [claimant](/docs/core-concepts/claimants) section for more details.

## Step 7: Create Fact Checks

You can start creating your first Fact Check by clicking on `Create New` button from the Fact Checks menu.

### Create New Fact Check

- Navigate to the Fact Check Menu
- Click on `Create New` button to getting started with creating a new fact check
