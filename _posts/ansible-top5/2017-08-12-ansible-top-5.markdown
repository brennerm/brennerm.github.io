---
layout: post
title: My top 5 about Ansible in 2017
category: posts
draft: true
---

**Intro:** The following post requires a basic understanding of the concepts of Ansible. 
I'm a guy that lives in a Linux dominated infrastructure. Additionally most of the points are Therefore you may have collected different experiences with Ansible. Feel free to let me know at [@__brennerm](https://twitter.com/__brennerm).

**Hint:** The latest Ansible release as of this writing is 2.3.2.0.

## 1. The client requirements
Unlike other provisioning tools, like Puppet, Ansible is not in need of any additional agent software being installed on the clients. The only requirements are SSH access and Python being installed, that are already fulfilled on most modern operating systems. The latter isn't even required as you can use the [raw module](http://docs.ansible.com/ansible/latest/raw_module.html) to install Python e.g. by executing `apt install -y python2.7`



---
