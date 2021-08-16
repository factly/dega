---
sidebar_position: 1
---

# Introduction

<!--

Thank you for contributing changes to this document! Because we use a central repository
to synchronize this file across all our repositories, make sure to make your edits
in the correct file, which you can find here:

https://github.com/ory/meta/blob/master/templates/repository/common/CONTRIBUTING.md

-->

There are many ways in which you can contribute, beyond writing code. The goal
of this document is to provide a high-level overview of how you can get
involved.

_Please note_: At Factly, we take security and our users' trust very
seriously. If you believe you have found a security issue in any of our applications,
please responsibly disclose by contacting us at security@factly.in.

First: As a potential contributor, your changes and ideas are welcome at any
hour of the day or night, weekdays, weekends, and holidays. Please do not ever
hesitate to ask a question or send a pull request.

If you are unsure, just ask or submit the issue or pull request anyways. You
won't be yelled at for giving it your best effort. The worst that can happen is
that you'll be politely asked to change something. We appreciate any sort of
contributions, and don't want a wall of rules to get in the way of that.

That said, if you want to ensure that a pull request is likely to be merged,
talk to us! You can find out our thoughts and ensure that your contribution
won't clash or be obviated by the product's normal direction. A great way to
do this is via the project's Github Discuccions page or [Factly's Chat](http://slack.factly.org/).

## FAQ

- I am new to the community. Where can I find the [Factly Community Code of Conduct?](./code-of-conduct)

- I have a question. Where can I get [answers to questions regarding the application?](/docs/contact-us)

- I would like to contribute but I am not sure how. Are there [easy ways to contribute?](#how-can-i-contribute)

- I want to talk to other application users. [How can I become a part of the community?](/docs/contact-us)

## How can I contribute?

If you want to start contributing code right away, we have a list of issues labelled `good first issue` on our GitHub issues page.

There are many other ways you can contribute without writing any code. Here are
a few things you can do to help out:

- **Give us a star.** It may not seem like much, but it really makes a difference. 
  This is something that everyone can do to help with the projects developed at Factly Labs.
  Github stars help our projects gain visibility and stand out.

- **Join the community.** Sometimes helping people can be as easy as listening
  to their problems and offering a different perspective. Join our Slack, have a
  look at discussions in the forum. More info on this in [Communication](/docs/contact-us).

- **Helping with open issues.** We have a lot of open issues for various projects at Factly Labs
  and some of them may lack necessary information, some are duplicates of older
  issues. You can help out by guiding people through the process of filling out
  the issue template, asking for clarifying information, or pointing them to
  existing issues that match their description of the problem.

- **Reviewing documentation changes.** Most documentation just needs a review
  for proper spelling and grammar. If you think a document can be improved in
  any way, feel free to hit the `edit` button at the top of the page. More info
  on contributing to documentation here.

- **Help with tests.** Some pull requests may lack proper tests or test plans.
  These are needed for the change to be implemented safely.


## Contributing Code

Unless you are fixing a known bug, we **strongly** recommend discussing it with
the core team via a GitHub issue or [in our chat](http://slack.factly.org/)
before getting started to ensure your work is consistent with the product roadmap and architecture.

All contributions are made via pull requests. To make a pull request, you will
need a GitHub account; if you are unclear on this process, see GitHub's
documentation on [forking](https://help.github.com/articles/fork-a-repo) and
[pull requests](https://help.github.com/articles/using-pull-requests). Pull
requests should be targeted at the `develop` branch. Before creating a pull
request, go through this checklist:

1. Create a feature branch off of `develop` so that changes do not get mixed up.
1. [Rebase](http://git-scm.com/book/en/Git-Branching-Rebasing) your local
   changes against the `develop` branch.
1. For Golang tests, navigate to `server/test`(or equivalent golang code directory) and run the test suite with the `go test ./...` command and confirm that it passes.
1. Ensure that each commit has a descriptive prefix. This ensures a uniform
   commit history and helps structure the changelog.  
   Please refer to this
   [list of prefixes for Hydra](https://github.com/ory/hydra/blob/master/.github/semantic.yml)
   for an overview.

If a pull request is not ready to be reviewed yet
[it should be marked as a "Draft"](https://docs.github.com/en/github/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/changing-the-stage-of-a-pull-request).

When pull requests fail testing, authors are expected to update their pull
requests to address the failures until the tests pass.

Pull requests eligible for review

1. follow the repository's code formatting conventions;
1. include tests which prove that the change works as intended and does not add
   regressions;
1. document the changes in the code and/or the project's documentation;
1. pass the CI pipeline;
1. include a proper git commit message following the
   [Conventional Commit Specification](https://www.conventionalcommits.org/en/v1.0.0/).

If all of these items are checked, the pull request is ready to be reviewed and
you should change the status to "Ready for review" and
[request review from a maintainer](https://docs.github.com/en/github/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/requesting-a-pull-request-review).

Reviewers will approve the pull request once they are satisfied with the patch.

## Documentation

Please provide documentation when changing, removing, or adding features.
Documentation for the project resides in its GitHub repository in the `website` directory. 

## Disclosing vulnerabilities

**Do not use GitHub issues when reporting security issues.**
Please disclose vulnerabilities exclusively to
[security@factly.in](mailto:security@factly.in). 

## Code Style

Please follow these guidelines when formatting source code:

- Go code should match the output of `gofmt -s` and pass `golangci-lint run`.
- NodeJS and JavaScript code should be prettified using `npm run format` where
  appropriate.

### Working with Forks

```
# First you clone the original repository
git clone git@github.com:factly/factly/<PROJECT-NAME>.git

# Next you add a git remote that is your fork:
git remote add fork git@github.com:<YOUR-GITHUB-USERNAME-HERE>/factly/<PROJECT-NAME>.git

# Next you fetch the latest changes from origin for master:
git fetch origin
git checkout master
git pull --rebase

# Next you create a new feature branch off of master:
git checkout my-feature-branch

# Now you do your work and commit your changes:
git add -A
git commit -a -m "fix: this is the subject line" -m "This is the body line. Closes #123"

# And the last step is pushing this to your fork
git push -u fork my-feature-branch
```

Now go to the project's GitHub Pull Request page and click "New pull request"

## Conduct

Whether you are a regular contributor or a newcomer, we care about making this
community a safe place for you and we've got your back. Please read our [code of conduct page](code-of-conduct) for further details.


We welcome discussion about creating a welcoming, safe, and productive
environment for the community. If you have any questions, feedback, or concerns
[please let us know](https://slack.factly.org).
