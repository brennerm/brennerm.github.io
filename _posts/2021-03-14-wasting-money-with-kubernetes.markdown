---
layout: post
title: How to waste money using Kubernetes
description: Kubernetes is full of opportunities and wasting money is one of them. Find out how to avoid that as much as possible.
category: posts
tags: kubernetes
draft: false
thumbnail: k8s-money-burn.jpg
---

{% include image.html url="/static/images/k8s-money-burn.jpg" %}

Kubernetes enables you to do a lot. Orchestrating your application deployments, seamlessly integrating with public cloud services, distributing workload across thousand of nodes or simply generating a huge bill by the end of each month. While the latter can be beneficial if you are on the issuing side of the bill, this blog posts showcases a few pitfalls that I've seen (a lot) and explains how to avoid them to shave a few bucks off of it.

I'm mainly focussing on saving up on pay-as-you-go cloud services or IaaS/PaaS offerings here. But if you are running Kubernetes on-premise you may be able to spend your freed up resources on something else instead.

## the productive VM

Let's start with the topic that is probably going to have the biggest impact on your bill, insufficient or missing autoscaling.

Are you running the same amount of pods on the same number of nodes 24/7 to be able to handle the peak usage of your application that is occurring for only a few hours a day? Or do you keep your dev setups running all day long so that your engineers can continue where they left off at the next day?

If so there's something your are missing out on...Autoscaling

Let's highlight the three most common autoscaling mechanisms:

### vertical pod autoscaling

Pods can have hard limits for the amount of CPU and memory resources that they are allowed to consume. With vertical pod autoscaling those limits can be adjusted (within boundaries) on the fly and automatically.

### horizontal pod autoscaling

Here we are talking about adjusting the number of pod replicas. Your pod reaches a certain amount of load? Let's create another one and the let the load balancer do its job. The load decreases a lot? Let's scale down again.

### cluster autoscaling

This is by far the most important one as this is where the actual saving happens. Where's the benefit if you scale down pods and your nodes end up sitting there idling and wasting your money anyway? This is where cluster autoscaling comes into play that takes care of destroying and spawning nodes based on their utilization.

All of those three can be applied at the same time but you should know what you do in this case.

When coming from a background (and I certainly do) where you did setup a server or VM and labeled it _prod-24_7-dont-touch-super-important-app-0_ there's a mindset change necessary when moving to Kubernetes. Worker nodes are simple minions, slaves if you will with the only purpose of running your precious applications.

They can be created within seconds but also disposed at the same rate. As soon as you accept that you can start having fun by decreasing the amount of computing resources your cluster runs on. Give it a try. Having a cluster with zero worker nodes is a thing today. 😉

Sure, running a single _a1.xlarge_ AWS EC2 instance may only cost you 2.5 dollars a day but be aware that there a lot of factors that come into play here. Multiply this by having individual setups for your ten developers and running them 24/7 for a year and you are looking at a 9000 $ bill.

## fearing the spot

Cloud providers are always having a bit of extra computing capacity as requests are rising and there's a lot of demand fluctuation during the day. That's why most of them are offering so called spot instances. They are sold to you at a huge discount (70 - 90%) with the only premise that they can be shutdown and withdrawn with little to no announcement.

{% include image.html url="/static/images/spot.jpg" description="image credit: Marcelo Jaboo" %}

As that sounds completely inappropriate for your traditional productive VM it would be great if there'd be some platform that could gracefully handle this interruption for me, right? Surprise surprise, with a little bit of (or even no) preparation Kubernetes can take care of that.

If it receives the notification of a node being shut down it transfers the pods onto other nodes or requests a new one. Even if there's no notification, the pods that are being terminated will get shifted and your application stays up and running.

It takes some time to get confident with someone else randomly shutting down nodes that run your productive app but if you've seen it working a dozen times you get used to it. Honestly, depending on your bidding price for the spot instances it doesn't really happen often anyway (at least on AWS).

So instead of paying 100% of the on-demand price try offloading (some of) your workload onto those spot instances. If you want to be on the safe side you can also run your cluster on spot as well as on-demand instances at given ratio e.g. 50:50 or 20:80. That really comes down to your needs.

## lazy and hungry

What's worse than wasting money on an application that is just idling. Exactly, it's wasting money on an application that is just idling and consuming a lot of resources at the same time.

In my experience we are talking primarily about memory here. It has not been only once that I've seen a Java Spring micro service application consuming gigabytes of RAM and doing nothing. At the same time there are Go applications that you'd need hundred instances of to fill that amount of memory.

Databases and message queues is also something to watch out for. I've joined a client 2 months ago and Cassandra is still not letting go of that 2 gigabytes.

Of course there are a lot of other factors that come into play when choosing your tech stack but take the base capacity consumption into consideration. Another option is to extract resource hungry components and reuse them for multiple deployments of your application.

## buy 3, get 2

Having a look at the following image you can see that there's something that can have an impact on the amount of resource capacity that is allocatable for your pods.

{% include image.html url="/static/images/k8s-resources.svg" description="Overview of Kubernetes' resource capacity handling" %}

It's called memory and CPU reservations which are being taken care of by kubelet, the application managing your Kubernetes workers. Those are very important to make sure your nodes stay healthy and have enough resources to execute their own processes besides running your pods.

In most cases your worker nodes' sole purpose should be to take over Kubernetes workloads but mandatory OS process, the container runtime or kubelet itself introduce a certain memory and CPU overhead that need to be considered.

What's important here is that reservations are sized correctly so that all essential functions can be executed but you don't hold back resources that end up being unused. Most of the time you can influence these parameters by setting the _--kube-reserved_ and _--system-reserved_ kubelet parameters accordingly.

For certain Kubernetes offers you are bound to certain predefined values. E.g. Azure Kubernetes service comes with [increased reservations for small instances](https://docs.microsoft.com/en-us/azure/aks/concepts-clusters-workloads#resource-reservations){:target="_blank"} (on a percentage basis) so you may decide to go with less but bigger nodes instead.

Monitor your worker nodes and adjust the parameters or research your options depending on your Kubernetes operator and minimize the amount of money wasted on resource reservations.

## CPU and memory requests

As you can see in the graph above CPU and memory request values, defined for each your pods, are being used to schedule them onto worker nodes. Setting these parameters too low and your application wont be able to perform as intended or in the worst case even get killed.

Declaring them too high and you'll waste resources that could be used for scheduling other pods. E.g. if your are setting a memory request of 1 GB of RAM and your application never consumes more than 400 Mi you are essentially wasting money for 600 Mi.

This is why it's important to define your requests as close as possible to the actual usage with going rather a little high than too low. Very similar to the previous resource reservations.

Kubernetes' resource requests and limits is a very complex topic and you should get used to the fact that you'll never get it 100% right but rather aim for an "as good as possible" state. Collecting historical data of your pods' consumption or incorporating vertical pod autoscaling will help you with that.

## summary

Of course there are still plenty of other things that can be improved in order to reduce the bill. Cleaning up unused resources, preventing to collect unnecessary logs and metrics, etc. But those points pretty much apply to every other infrastructure as well and this blog post already got longer than I initially anticipated. Seems like Kubernetes is pretty good at burning money. 😉

So there you have it. Be aware that most of the topics discussed are only realizable if your applications meet certain requirements. Being able to get shutdown at any time and saving their state externally are only some. Talk with your devs, have a look at the [Twelve-Factor App](https://12factor.net/){:target="_blank"} and make a plan.

Hope you enjoyed the read and are able to save a few bucks in the future. 🙂

---
