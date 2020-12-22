---
layout: post
title: Screwing up remote access to dozens of servers within seconds
description: A little postmortem story of me using Ansible to disable access to dozens of servers in seconds and what I learned from my mistakes.
category: posts
tags: ansible
draft: false
---

## the power of infrastructure as code

Back in the day (must have been around 2016) my team and I were using Ansible to provision our infrastructure. It's a tool to configure servers in an automated and reproducible manner. It helped us to setup web servers, databases and all kinds of services with very little preconditions.

There's no central server that you need to setup initially and keep running. The client machines don't need any kind of custom agent. All that is required is a Python interpreter and remote access using SSH which both are baked into modern OS' anyway.

Additionally Ansible allows to create separate groups of servers and apply different actions on them as well as define tasks that will be executed for every server. E.g. increasing a version of nginx should only be applied to web servers while changing the address of the DNS or NTP server is something that is relevant for all hosts.

Due to parallel execution, Ansible is able to rollout these changes to a huge amount of clients in a very short amount of time. And with this great power comes great responsibility...

## the day I screwed up

As we used Ansible to make system level changes root permissions were almost always required. Hence we used the system's root user which is debatable from my todays' point of view. Anyway securing remote access to this user was very important.

SSH, among others, supports authentication using a password or a SSL key pair. We used the latter as it is more secure (and convenient) but logging into the root account using a password was still an option which we wanted to actively disable.

Sshd, the software realizing the remote access to the server, provides an configuration parameter called `PermitRootLogin` with the following options:

- `yes` - allows root login with all authentication methods
- `no` - disables root login using SSH completely
- `prohibit-password` - disables root login using password authentication

Number 3 it is, right? So I sat down and wrote the Ansible "code" (it's actually YAML). As I am an experienced engineer, so I thought, testing my changes before deploying them was obvious. I spun up a new machine running Ubuntu 16.04, deployed my change, verified the config, tried logging in using a password which failed as expected... everything was looking great.

There I was, confidently typing the Ansible command into my shell (it was actually executed on our CI server, but I'm trying to be dramatic here 😉), targeting all of our servers, hitting Enter and seeing the usual endless amounts of logs flying by.

And then boom...around 50 servers responded with an error, oddly all of them running Ubuntu 14.04. Turns out that Ubuntu 14.04. came with an older version of sshd which, instead of `prohibit-password`, expected the value `without-password` for the `PermitRootLogin` config.

As already said, when using Ansible 50% of what you need is SSH access but SSH access is also what you need a 100%. So take a guess, what happens to an sshd service that encounters an unknown configuration parameter during its startup? Correct, **there's no startup**. All there is is an error message that never reached the display of my PC as I screwed up the SSH connection.

## the learning

Luckily for me all of these servers were LXC containers and no physical machines. So fixing the sshd config was just a matter of crafting a script with the correct `lxc-execute` (same as `docker exec` if that's more familiar to you) command. Alright fire extinguished, coming to the even more important part. What could I have done to avoid this situation in the first place?

In an ideal world replicating the whole setup in a staging environment and applying my changes there would be the way to go. You and me know that in reality this is mostly not achievable due to various reasons, e.g. limited computing capacities.

Instead of copying the whole setup I could have tested my changes against all base images of our containers, e.g. Ubuntu 14.04 additionally to 16.04. This would have revealed this particular issue but may not have helped in a different case.

Another out of the box feature of Ansible that helps preventing making erroneous configurations to all of your hosts at once is called [rolling updates](https://docs.ansible.com/ansible/latest/user_guide/guide_rolling_upgrade.html#the-rolling-upgrade){:target="_blank"}. By passing the `serial` parameter, Ansible will apply your changes to batches of the given size. If it fails for one batch the execution will stop, leaving the remaining hosts intact.

All in all I'm happy that I made this mistake for a service with no impact to the end user at all. A web or database service that is not starting would have been much worse.

And that's my how I screwed up remote access to dozens of servers in seconds. Hopefully you had a good laugh from my postmortem story and ideally learned how to prevent something like this from happening to you. 👍

---
