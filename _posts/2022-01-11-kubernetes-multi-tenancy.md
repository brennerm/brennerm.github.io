---
layout: post
title: Sharing a Kubernetes cluster between multiple tenants
description: Sharing Kubernetes clusters between multiple tenants becomes more and more important as adoption of it increases. Here's an overview about the tools you have to do it safely.
category: posts
tags: kubernetes
draft: false
thumbnail: multi-tenancy.png
---

{% include image.html url="/static/images/multi-tenancy.png" width=300 %}

Running and maintaining Kubernetes clusters is hard. They need to be upgraded, automatically scale based on demand, be monitored and most importantly, ensured to be highly available at all time.

So the idea of sharing clusters across teams, divisions or even whole companies is definitely valid. There are various ways of achieving multi-tenancy which we will be exploring today.

## Multiple clusters

This approach is probably not the one you were looking for when deciding to read this article but I don't want it to go unnoticed. Of course it has some obvious downsides, like having to set up and maintain multiple Kubernetes control planes. On the other hand it limits the amount of damage an application can do to the scope of a single cluster keeping the remaining ones safe.

But for sure, there are good ways to safely enable multi tenancy on a single Kubernetes cluster.

## Namespaces

Namespaces are a concept you are most likely already aware of. They are shipped with Kubernetes out of the box and a default installation already has few of them set up for you. Initially these namespaces are nothing more than a logical separation but in combination a few other components they introduce multi tenancy capabilities. Those are RBAC and resource quotas.

RBAC stands for role-based access control and allows you to configure fine grained permissions to certain namespaces or global resources. It may be used to realize the following use case cases:

- create one admin user that is able to manage all namespaces
- create several users with different levels of access to a single namespace

Resource quotas on the other hand allow you to define limits for the memory and CPU usage of all pods within a single namespace. This can be achieved by creating a [ResourceQuota object](https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-memory-cpu-namespace/#create-a-resourcequota){:target="_blank"}.

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: example-resource-quota
spec:
  hard:
    requests.cpu: "2"
    requests.memory: 2Gi
    limits.cpu: "4"
    limits.memory: 4Gi
```

Be aware that creating a ResourceQuota objects requires you to define CPU and memory requests and limits for each pod within this namespace. In case you want to know more about this topic check out my blog post about [how to waste money using Kubernetes](/posts/wasting-money-with-kubernetes.html){:target="_blank"}.

The below namespace structure may be the result when deploying a frontend and backend application into three different environments.

```bash
$ kubectl get namespaces
NAME               STATUS   AGE
kube-system        Active   1d
default            Active   1d
frontend-dev       Active   1d
frontend-staging   Active   1d
frontend-prod      Active   1d
backend-dev        Active   1d
backend-staging    Active   1d
backend-prod       Active   1d
```

Using RBAC we can then define a cluster admin that is able to assign the appropriate resource quota to each namespace and create further roles that provide the right level of access to other users.

What becomes clear is that this approach doesn't scale very well. Each newly created namespace needs its own set of role bindings and resource quotas.

Additionally, depending on your policies, creating these objects may require involvement of cluster admin users. So e.g. the backend team wouldn't be able to independently create new namespaces with resources assigned to them when necessary.

So how can we fix on these shortcomings?

## Hierarchical Namespaces

Hierarchical namespaces aren't too popular yet but are pretty self-explanatory. Instead of having a single level of namespaces, it introduces the ability to nest them, allowing for permission and object propagation. This not only simplifies the RBAC configuration but also enables teams to independently manage their resource allocation.

Assume your team's parent namespace have been given a certain amount of CPU and memory resources, e.g. your team lead can decide how much of these to assign to the dev, staging and prod environment. This can happen without needing to bother the cluster admins.

By introducing HNs our example namespace structure from above could be converted into this:

```bash
$ kubectl hns tree
kube-system
default
frontend
└── dev
└── staging
└── prod
backend
└── dev
└── staging
└── prod
```

This allows to give teams complete power over their parent namespace including the assigned resources. This way each team is independently able to create and manage namespaces and distribute their available CPU and memory across them.

To make use of this concept you first need to install the hierarchical namespace controller in your cluster. Have a look at [the docs](https://github.com/kubernetes-sigs/hierarchical-namespaces/releases/){:target="_blank"} to get more details on the process. Also be aware that there's no HNC release recommended for production yet. But according to the [roadmap](https://github.com/kubernetes-sigs/hierarchical-namespaces#roadmap-and-issues){:target="_blank"} this should happen very soon.

## Virtual cluster

Maybe you remember the term DinD that came up a few years ago. It stands for Docker in Docker, meaning you can manage Docker containers from within a Docker container.

A virtual cluster is pretty much the same in the Kubernetes world. It allows you to create a semi-independent cluster within your existing cluster. At the time of this writing there are two implementations that I know of and we will have a look at.

### Kubernetes VirtualCluster

[Kubernetes VirtualCluster](https://github.com/kubernetes-sigs/cluster-api-provider-nested/tree/main/virtualcluster){:target="_blank"} is the implementation of the official Kubernetes multi-tenancy SIG. It introduces a new CRD that can be used to create new clusters on demand. The solution consists of the following three components that share the necessary responsibilities:

#### vc-manager

The vc-manager manages the realization of said VirtualCluster CRD objects by creating the necessary control plane pods or even proxying an external Kubernetes cluster when providing the corresponding kubeconfig.

#### syncer

The syncer makes sure to reflect API object changes happening in the tenant cluster to the super cluster and to propagate events occurring in the super cluster back to the tenant cluster. During this process certain mappings may occur, e.g. to prevent naming conflicts. For example namespaces being created in the tenant cluster, will be stored with a prefix in the super cluster control plane.

#### vn-agent

The vn-agent is running on the worker node and proxying the API requests to the local kubelet process. It makes sure that each tenant can only access its own pods.

{% include image.html url="/static/images/virtual-cluster-architecture.png" description="VirtualCluster architecture" source="https://github.com/kubernetes-sigs/cluster-api-provider-nested/blob/main/virtualcluster/doc/vc-icdcs.pdf" width=700 %}

Even though VirtualCluster passes most of the Kubernetes conformance tests it still has a few limitations that you can read about [here](https://github.com/kubernetes-sigs/cluster-api-provider-nested/tree/main/virtualcluster#limitations){:target="_blank"}. Currently it does not support managing DaemonSets and persistent volumes from a tenant cluster just to name a few.

Similarly to the HNC, there's no productive release of VirtualCluster at the time of this writing but is expected to be coming soon.

### Loft Labs vcluster

Loft Labs implemented their own version of a [virtual Kubernetes cluster](https://www.vcluster.com/){:target="_blank"} and open sourced it in April 2021. It provides a similar functionality but with a slightly different user experience and architecture.

Instead of requiring you to install an operator and create an CRD object, vclusters are being deployed by applying standard Kubernetes manifests (StatefulSet, Service, Role, ...) onto your cluster. This creates a pod with 2 containers.

#### k3s

One is running k3s, a stripped down Kubernetes distribution, to create a separate control plane including the usual API server, data store and controller manager.

#### syncer

The other component is called syncer yet again and acts as an replacement for the default Kubernetes scheduler. Instead of distributing pods onto worker nodes it makes sure that vcluster pod specs are being passed to the host cluster and actually being applied there.

For every pod a proxy object is being instantiated in the vcluster that reflects the status of the actual pod running in the host cluster.

{% include image.html url="https://www.vcluster.com/docs/media/diagrams/vcluster-architecture.svg" description="vCluster architecture" source="https://www.vcluster.com/docs/architecture/basics" %}

If you are curious about a more detailed view of a Loft Labs employee about the differences between the two virtual cluster implementations have a look [here](https://github.com/loft-sh/vcluster/issues/5#issuecomment-825445342){:target="_blank"}.

## Conclusion

And there you have it. Four ways of providing Kubernetes to multiple tenants. Multiple clusters definitely provide the highest level of separation but at a "high" cost. Simple namespaces come with the exact opposite.

But upcoming technologies try to find a good balance between the two and broaden the arsenal of enabling multi-tenancy for Kubernetes clusters. This way, hopefully everyone is going to find the right tool of choice for their exact use case.

---
