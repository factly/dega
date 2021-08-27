---
sidebar_position: 1
---

# React Testing

Unit test cases for UI built using React are written using the Jest framework and the Enzyme library.

There are two types of test cases:

- Snapshot Testing: Snapshot tests are a very useful tool whenever you want to make sure your UI does not change unexpectedly. A typical snapshot test case renders a UI component, takes a snapshot, then compares it to a reference snapshot file stored alongside the test.

- Component test: These tests are useful to test the functionality of your react components. For example, to test on a button click, your code is working as expected.

Commands to be used to run test cases:

| Command                | Description                     |
| ---------------------- | ------------------------------- |
| npm test               | To run test cases               |
| npm test -- --coverage | To run test cases with coverage |
