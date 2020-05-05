---
layout: post
title: My top 5 positive points about Ansible in 2017
description: A 5 point list of my positive thoughts about Ansible in 2017.
category: posts
tags: ansible
draft: false
---

**Intro:** In this post you are going to find a list of aspects where I think the provisioning engine Ansible excels. I'm a guy that lives in a Linux dominated infrastructure. Therefore my experiences may not align with yours. Make sure to let me know your opinion at [@__brennerm](https://twitter.com/__brennerm).

**Hint:** The latest Ansible release as of this writing is 2.3.2.0.

## 1. The client requirements
Unlike other provisioning tools, like Puppet, Ansible is not in need of any additional agent software being installed on the clients. The only requirements are SSH access and Python, which are already fulfilled on most modern operating systems. The latter isn't even required as you can use the [raw module](http://docs.ansible.com/ansible/latest/raw_module.html) to install Python e.g. by executing `apt-get install -y python2.7` before the execution of your "real" configuration. This module also gives you the ability to configure devices that do not run a fully fledged operating system, like switches or PDUs.

## 2. The nonexistence of the "master server"

As for the clients, the requirements to be able to start provisioning are minimal. All you need is the Ansible executable, your configuration you want to apply and a way to authenticate against the clients. This leads to the fact that theoretically any machine can become one of your provisioning servers in a matter of seconds. The clients are not fixed to one master server which results in a lot of flexibility. Additionally you don't have to keep your provisioning server up all the time to be able to answer the client's request for configuration updates. Also you know exactly when your clients are being updated and it's easier to see what's exactly happening during the deployment.

## 3. Python

This is the most subjective point of this list but what can I say. It's just me liking Python and thus being able to extend Ansible in any way. I'm in contact with a lot of proprietary software where Ansible support isn't available. For this kind of stuff it's a real pleasure to use your beloved programming language to be able to create reusable building blocks in the form of [Ansible modules](http://docs.ansible.com/ansible/latest/dev_guide/developing_modules.html). Another place where Python excels is the [dynamic inventory](http://docs.ansible.com/ansible/latest/intro_dynamic_inventory.html). As there is an API for almost every IaaS implementation available for Python it's really easy to connect your Ansible provisioning to your already existing infrastructure. 

## 4. The documentation

Giving some credit to the maintainers, the documentation is really good. For every part of Ansible you are going to find extensive and high quality documentation that is up to date. Additionally as it's an already established piece of software a lot of questions have already been answered. The only small issue that comes to my mind is that [some of the built-in modules](http://docs.ansible.com/ansible/latest/command_module.html) are missing the documentation of their return values.

## 5. The ecosystem

Another advantage of Ansible being widely used is the existence of a lot of community projects around it. In this case I'm particularly talking about roles. There are roles for almost every piece of software that is publicly available. For popular technologies, like [PostgreSQL](https://github.com/ANXS/postgresql/blob/master/defaults/main.yml) or [Gitlab](https://github.com/debops/ansible-gitlab/blob/master/defaults/main.yml), you're going to find roles that let you adjust basically everything. Ansible Galaxy  does a good job of making all of these roles accessible over a unified interfaces. Additionally it prevents a lot of duplicate "code" as it allows you to easily handle your  [role dependencies](http://docs.ansible.com/ansible/latest/galaxy.html#dependencies).

That's my top 5 points about Ansible in 2017. If you think I missed something feel free to let me known at [@__brennerm](https://twitter.com/__brennerm).

Make sure you check back for my top 5 negative points about Ansible.

---
