---
layout: post
title: Optimizing applications on Kubernetes using Machine Learning
description: Draft
category: posts
tags: kubernetes
draft: false
---

> Hint: This post has been happily sponsored by [StormForge](https://www.stormforge.io/){:target="_blank"}, the company building the product that is being used. Despite sponsorship, they allowed me to share my honest opinion. Huge thanks for their trust and support!

## intro

Optimizing an application on Kubernetes is hard, especially if your goal is to keep costs low. They're plenty of options, the dependency trees in modern microservice architectures are getting bigger and bigger and for some (most?) of us all of this takes place on hardware that we have no control over.

Additionally without a lot of testing and monitoring effort it's very difficult to determine the "correct" specs for your deployments. It requires extensive trial and error to push your application into the area where it still performs without being overprovisioned.

Otherwise you'll end up wasting resources and thus [money](https://brennerm.github.io/posts/wasting-money-with-kubernetes.html){:target="_blank"} or with a system that falls apart as load increases. That's why we will take a look at a tool that aims to solve this problem without occupying endless amounts of engineering time called StormForge Optimize.

## StormForge Optimize

StormForge Optimize (SFO) is a SaaS product that combines trial and error experiments with machine learning to help you determine configurations that will optimize your application for the metrics you care about. It consists of the following three key components:

- the SFO Kubernetes controller, handling the experiment execution and the communication with the ML model
- the ML model, responsible for selecting the parameter sets for each trial based on previous results
- the SFO dashboard, allowing you to analyze and export the resulting configurations of your experiments during and after the execution

Below you can find a visualization that explains the general workflow of an SFO experiment.

{% include image.html url="/static/images/sfo-flow.png" description="StormForge Optimize experiment flow" %}

TODO

As Kubernetes is SFO's primary target platform you interact with it using the manifests you should be already familiar with. The main one being the _Experiment_ manifest, which consists of the following parts:

### Optimization

The optimization section allows you to set the number of iterations that the experiment will go through. Adjust this value according to your use case. Integrating SFO experiments into your CI pipeline to prevent performance regression? 20 trials may be sufficient.

Wanting to create a baseline configuration for your newly written application? Let SFO cycle through 200 iterations and leave it running overnight to get the most accurate result.

Example:

```yaml
...
  optimization:              
  - name: "experimentBudget"
    value: "50"
...
```

### Parameters

Parameters define the possible configuration values that SFO can experiment with, like the amount of memory, number of replicas or different disk storage types.

As a general rule of thumb **increase the number of trials along with your number of parameters**. The more permutations your experiment is covering the more data points the ML model will need to determine the optimal configurations.

Example:

```yaml
...
  parameters:
  - name: memory
    min: 500
    max: 2000
    baseline: 1000
  - name: cpu
    min: 500
    max: 2000
    baseline: 500
...
```

### Patches

Patches instruct the SFO controller how to apply the previously declared parameters to your Kubernetes manifests. This is where SFO's biggest strength is in my opinion as **you can patch everything that is configurable through a Kubernetes manifest**.

It may start with simple things like CPU and memory resource limits. But with more and more extensions coming to Kubernetes lately the possibilities are endless. One example I can imagine is using [Crossplane](https://crossplane.io/){:target="_blank"} to cycle through VM types of different cloud providers and see on which your application performs best.

Example:

```yaml
...
  patch: |
    spec:
      template:
        spec:
          containers:
          - name: my-app
            resources:
              limits:
                memory: "{{ .Values.memory }}Mi"
                cpu: "{{ .Values.cpu }}m"
...
```

### Trial template

The trial template specifies how your application specific performance measurement looks like. Internally it launches a [Kubernetes Job](https://kubernetes.io/docs/concepts/workloads/controllers/job/){:target="_blank"} which gives you the freedom of using your tool of choice, like [StormForge's in-house load tester](https://www.youtube.com/watch?v=rDpeXWTAdS4){:target="_blank"}, Locust or Gatling.

Also you can take care of some preparation tasks like deploying a Helm chart or a dedicated Prometheus instance. Be aware that trial jobs will be executed on the same Kubernetes cluster as your application under test. So make sure to keep room for its potential additional CPU and RAM usage.

Example for a PostgreSQL load test trial template:

```yaml
...
  template:
    spec:
      initialDelaySeconds: 15
      template:
        spec:
          template:
            spec:
              containers:
              - image: crunchydata/crunchy-pgbench:centos7-11.4-2.4.1
                name: pgbench
                envFrom:
                - secretRef:
                    name: postgres-secret
...
```

### Metrics

Metrics allow you to define the criteria that you want to gather and/or optimize, e.g. minimizing the costs while maximizing the throughput of your application. SFO comes with certain metrics out of the box, like trial duration but can also query popular monitoring systems like Prometheus or Datadog if you are looking to optimize more specific metrics.

Example:

```yaml
...
  metrics:
  - name: duration
    minimize: true
    query: "{{duration .StartTime .CompletionTime}}"
  - name: cost
    minimize: true
    type: pods
    # calculating with $20/month/CPU core and $3/month/GB of RAM
    query: '{{resourceRequests .Pods "cpu=0.020,memory=0.000000000003"}}'
    selector:
      matchLabels:
        component: my-app
...
```

For more information check out [SFO's documentation](https://docs.stormforge.io/experiment/){:target="_blank"} which covers all these elements in more detail.

## getting started

With all the concepts clarified let's prepare our application and cluster for the first experiment. To begin with we have to decide on an application that we want to optimize. I went with Apache Cassandra cause I always see it using huge amounts of resources in Kubernetes clusters and wanted to check whether this can be improved.

So I went ahead and created a standard _StatefulSet_ that takes care of deploying my Cassandra pods. Additionally we'll need some way of putting load onto the database during the trial job. Luckily Cassandra comes with a tool to do just that called _cassandra-stress_.

```yaml
...
  template:
    spec:
      template:
        spec:
          containers:
          - image: cassandra:4.0
            name: cassandra-stress
            # making sure that our trial job does not eat up endless amounts of resources 
            resources:
              limits:
                memory: "1024Mi"
                cpu: "2000m"
            command:
            - bash
            - -c
            - |
              CASSANDRA_URL="cassandra.default.svc.cluster.local"
              /opt/cassandra/tools/bin/cassandra-stress write n=100000 -rate threads=400 -node $CASSANDRA_URL
              /opt/cassandra/tools/bin/cassandra-stress mixed n=100000 -rate threads=400 -node $CASSANDRA_URL
              cqlsh --request-timeout=60 -e "DROP KEYSPACE keyspace1;" $CASSANDRA_URL || true
```

As you can see our trial job consists of the following three steps:

- measuring write performance while prepopulating the cluster at the same time
- measuring mixed (~50:50 read and write) performance
- dropping the keyspace to make sure each test run starts in a clean environment

Because we always execute the same number of read and write operations (2 x 10000) simply measuring the time of the trial job to complete will be a good way to judge how our database performs.

With our application good to go, let's quickly prepare our Kubernetes cluster. Assuming you have a connection to it set up, after [installing the `redskyctl` CLI tool](https://docs.stormforge.io/getting-started/install/#installing-the-stormforge-optimize-tool){:target="_blank"} the following commands will deploy the StormForge Optimize controller.


```bash
$ redskyctl login # log into our StormForge account
Opening your default browser to visit:

        https://auth.carbonrelay.io/authorize?...

You are now logged in.
$ redskyctl init # deploy the StormForge controller
customresourcedefinition.apiextensions.k8s.io/experiments.redskyops.dev created
customresourcedefinition.apiextensions.k8s.io/trials.redskyops.dev created
clusterrole.rbac.authorization.k8s.io/redsky-manager-role created
clusterrolebinding.rbac.authorization.k8s.io/redsky-manager-rolebinding created
namespace/redsky-system created
deployment.apps/redsky-controller-manager created
clusterrole.rbac.authorization.k8s.io/redsky-patching-role created
clusterrolebinding.rbac.authorization.k8s.io/redsky-patching-rolebinding created
secret/redsky-manager created
$ redskyctl check controller --wait # wait for the controller to become ready
Success.
```

## starting simple

After going through the preparation phase we can start with our first experiment. To keep it simple we will start with two parameters (CPU and memory limits) and a single metric (duration of our trial) that we want to optimize. Below you can see the relevant parts of the experiment spec:

```yaml
...
  parameters:                                                                                                   
  - name: memory                             
    min: 1000
    max: 4000
    baseline: 2000
  - name: cpu
    min: 500
    max: 3500
    baseline: 1000
  patches:
  - targetRef:
      kind: StatefulSet
      apiVersion: apps/v1
      name: cassandra
    patch: |
      spec:
        template:
          spec:
            containers:
            - name: cassandra
              resources:
                limits:
                  memory: "{{ .Values.memory }}Mi"
                  cpu: "{{ .Values.cpu }}m"
                requests:
                  memory: "{{ .Values.memory }}Mi"
                  cpu: "{{ .Values.cpu }}m"
  metrics:
  - name: duration
    minimize: true
    query: "{{duration .StartTime .CompletionTime}}"
...
```

After roughly 1.5 hours we end up with the following chart in the SFO dashboard.

{% include image.html url="/static/images/sf-single-metric.png" description="Results of the single metric experiment" %}

As you may have already guessed, the results are not really surprising. The more resources fuel your application, the better it will perform. Who would've thought? Anyway I think this experiment is valuable for the following two reasons.

It's a simple showcase to understand how StormForge Optimize works and it helped us **validate our assumptions**. Imagine if Cassandra performed worse with more resources or the trial duration turned out to be completely random. In this case we would know that something in our test setup is messed up. Instead we now can jump onto our first proper experiment with confidence.

## adding another dimension

So let's add another dimension of metrics. In most real world scenarios you try to achieve the best performance while keeping the resource usage as low as possible. And that's exactly what we will be trying to do. As a general rule of thumb for all kinds of optimization, you should always try to **optimize at least two metrics that contradict each other**, like increasing throughput while decreasing CPU usage or reducing latency while minimizing cache size.

We will be combining the CPU and memory usage into a single cost estimation metric by using the _resourceRequests_ function which allows us to create a weighted sum of the two. The parameters will stay the same while the metrics change to the following:

```yaml
{% raw %}
...
  metrics:
  - name: duration
    minimize: true
    query: "{{duration .StartTime .CompletionTime}}"
  - name: costs
    type: pods                                    
    # weights are equal to AWS EC2 pricing of c5.xlarge instance ($30.60/month/CPU core,$15.30/month/GB RAM)
    query: '{{resourceRequests .Pods "cpu=0.03060,memory=0.000000000001530"}}'
    selector:                                     
      matchLabels:                         
        component: cassandra
...
{% endraw %}
```

After applying our Experiment manifest we can have a look at the individual trials runs using _kubectl_ like so:

```bash
$ kubectl get trials -o wide -w                                     
NAME                          STATUS      ASSIGNMENTS             VALUES
cassandra-two-metrics-1-000   Completed   memory=2000, cpu=1000   duration=69, costs=33.808642559999996
cassandra-two-metrics-1-001   Completed   cpu=2845, memory=3003   duration=36, costs=91.87477680384
cassandra-two-metrics-1-002   Completed   cpu=1782, memory=2886   duration=47, costs=59.15927121407999
cassandra-two-metrics-1-003   Completed   cpu=1529, memory=3225   duration=51, costs=51.961336128
cassandra-two-metrics-1-004   Completed   cpu=728, memory=3403    duration=87, costs=27.73630531584
cassandra-two-metrics-1-005   Completed   cpu=537, memory=2269    duration=107, costs=20.07240498432
cassandra-two-metrics-1-006   Completed   cpu=1929, memory=4000   duration=41, costs=65.44468512
...
```

{% include image.html url="/static/images/sf-two-metrics.png" description="Results of the two metrics experiment" %}

Now that we have a chart with more useful information here's an explanation of the different data points:

- The blue square represents the result of our baseline configuration, in our case 1 CPU core and 2 GB of RAM which resulted in a trial job duration of 69 seconds.
- Green circles stand for "normal" trial runs. Those can mostly be ignored as they were outperformed by others.
- The beige squares show the trial runs that performed well and give you a variety of choices depending on whether you are focussing on either lowering costs or increasing performance.
- The orange square represents the trial run that SFO selected as the sweet spot, in our case decreasing the costs by 16 % while achieving the same trial run duration.

TODO

## horizontal or vertical scaling?

TODO

## summary

---
