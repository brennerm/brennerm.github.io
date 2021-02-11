---
layout: post
title: AWS EC2 launch configurations vs launch templates
description: A comparison of EC2 launch configurations and launch templates + an advice which one you should prefer
category: posts
tags: [aws]
draft: false
---
At first sight AWS launch configurations and templates may seem very similar. Both allow you to define a blueprint for EC2 instances. Let's have a look at their differences and see which one we should prefer.

## They grow up so fast

Launch configuration are old. In terms of cloud technologies they are essentially ancient. During my research I found articles that date back to 2010. It's hard to find exact details but it seems like they have been introduced together Auto Scaling Groups (ASGs) or shortly after. This also explains why there are only compatible with ASGs. Want to create a single EC2 instance based on an launch configuration? That is not going to happen.

Settings that are supported include:

- the EC2 image (AMI)*
- the instance type (e.g. m5.large)*
- an SSH key pair to connect to the VM*
- the purchase options (on-demand or spot)
- an IAM profile
- one or more security groups
- a block device mapping to specify additional storage volumes
- a few more minor things

_* marks required values_

Changing any of these parameters is not supported due to launch configurations' nature of being immutable. This means instead of updating it in place you need to delete and recreate it.

All in all launch configurations have a very specific use case and a set of configuration options limited to the basic parameters. Let's see how launch templates compare.

## The hot stuff

The first big difference is the wider range of AWS services that are compatible with launch templates. Additionally to ASGs it can be used in managed EKS node groups and to create single EC2 instances.

Regarding configuration options, they support a bit more than launch configurations like network settings and a few more advanced details (interruption behavior, termination protection, CloudWatch monitoring, ...).

{% include image.html url="/static/images/launch-template-advanced.png" description="A few of launch templates' advanced settings" %}

The main difference here is that every setting is optional. As you can see in the image above you can set the value "Don't include in launch template" for every parameter. You can essentially create a launch template that specifies nothing. That's kinda pointless but you get the idea.

Combining this with the ability to source values from existing templates and you can start to imagine all the options that arise. Similar to something like Docker images you can start to create your base template(s) and inherit more specific templates from them.

As nice as this may sound I just want to advice you to be cautious with doing this. Depending on organization and your upfront template "architecture" planning this may work really well. But it hasn't been just once that I've seen this ending up in dependency hell. (including rhyme in blog post ✅) So think about if you don't wanna stick with independent templates especially when factoring in the next feature.

Launch templates support versioning. Meaning while a single version is immutable you are still able to make modifications which will result in a new one that you can refer to. In my opinion this workflow provides a much better user experience compared to the delete and recreate approach that you need to go through with launch configurations. But again it adds complexity of managing the references in your ASGs and child templates.

## Which is the better choice?

So, how did both do? Is there a clear winner or can I give you at least a recommendation which one you should prefer?

I'm not sure how things really evolved so take the following with a grain of salt. To me it seems like launch configurations have been created out of necessity when introducing ASGs. Afterwards the folks from AWS noticed that having an EC2 blueprint could be useful for other services as well. Cause it was probably easier to create something new instead of making the existing solution more generic they [introduced launch templates in late 2017](https://aws.amazon.com/about-aws/whats-new/2017/11/introducing-launch-templates-for-amazon-ec2-instances/){:target="_blank"}.

Additionally as far as I know there's nothing that you can achieve with launch configurations which is not doable using launch templates. Please let me know if there's a use case I'm missing here. The only advantage of launch configurations is that they are just simpler. No versioning, no inheritance, immutability, just a minimal set of required and a few optional values and you are good to create your ASG.

My impression from reading through the documentation is that AWS will soon start to deprecate launch configurations. They clearly [discourage from using them](https://docs.aws.amazon.com/autoscaling/ec2/userguide/LaunchConfiguration.html){:target="_blank"} and even provide [a guide](https://docs.aws.amazon.com/autoscaling/ec2/userguide/replace-launch-config.html){:target="_blank"} to replace existing launch configurations with templates. That's why I'd suggest you to use launch templates for anything new and start to migrate your existing launch configurations if you plan on continue using them long-term.

That's all with my little comparison. Hope you got some value out of it. Enjoy your day 👍

---
