---
sidebar_position: 8
---

# Multitenancy

Dega has multi-tenant architecture in which a single instance of Dega supports multiple [organisations](/docs/core-concepts/organisations). It has one super-organisation which can also act like a normal organisation but has capabilities to manage the entire Dega instance. Apart from the super-organisation, there can be multiple isolated normal organisations. All the organisations function as logically independent organisations but are physically integrated.

An organisation can internally have multiple spaces. It is mandatory to have at least one space per organisation. Each organisation has its administrator to manage its organisation and spaces.

```
Dega Instance
│
└───Super Organisation
│   │
│   └───Space 1
│   └───Space 2
│
└───Organisation 1
│   │
│   └───Space 1
│
└───Organisation 1
│   │
│   └───Space 1
│   └───Space 2
│   └───Space 3
```
