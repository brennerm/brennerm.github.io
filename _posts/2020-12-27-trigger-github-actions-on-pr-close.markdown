---
layout: post
title: Github Actions workflow for merged/closed PRs
description: A little guide on how to trigger Github Actions workflows when a PR has been closed while distinguishing whether is has been merged or not.
category: posts
draft: false
---

Lately I made some investigations on different events that you can use to trigger Github Actions workflows. I was especially interested in the pull request events as executing some clean up task as soon as a PR is merged was one of my goals.

Going through the [list of available events](https://docs.github.com/en/free-pro-team@latest/actions/reference/events-that-trigger-workflows#pull_request){:target="_blank"}, `closed` turned out to be what I was looking for.
Additionally I added the requirement to make a distinction between the following two cases when closing a pull request.

- merged - the PRs' changes have been merged into the target branch
- closed - the PR has been closed without merging its changes

Turns out the [event received](https://docs.github.com/en/free-pro-team@latest/developers/webhooks-and-events/webhook-events-and-payloads#pull_request){:target="_blank"} contains the pull request object which itself contains a lot of additional information such as whether the PR has been merged or not. Thus the following configuration is what I came up with.

{% raw %}

```yaml
name: Close Pull Request

# only trigger on pull request closed events
on:
  pull_request:
    types: [ closed ]

jobs:
  merge_job:
    # this job will only run if the PR has been merged
    if: github.event.pull_request.merged == true
    runs-on: ubuntu-latest
    steps:
    - run: |
        echo PR #${{ github.event.number }} has been merged

  close_job:
    # this job will only run if the PR has been closed without being merged
    if: github.event.pull_request.merged == false
    runs-on: ubuntu-latest
    steps:
    - run: |
        echo PR #${{ github.event.number }} has been closed without being merged
```

{% endraw %%}

To see the above workflow in action check out this little [showcase repo](https://github.com/brennerm/github-actions-pr-close-showcase){:target="_blank"} I created. Feel free to use it as a starting point.

---
