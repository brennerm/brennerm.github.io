---
layout: post
title: Kubernetes operators with Python &#35;2&#58; Implementing Controller
description: Developing Kubernetes/K8s operators with Python Part 2&#58; Implementing the controller using Kopf
category: posts
tags: kubernetes python
thumbnail: exchangerates-operator.svg 
draft: false
---
## Introduction

This post is the second part of a little blog series in which we are going through the complete process of implementing our own Kubernetes operator with Python. [Previously](/posts/k8s-operators-with-python-part-1.html) we had a look at two ways on how to register a CRD for our ExchangeRate resource. Based on this we can now start writing our controller that will query the requested currency exchange rate and make them available to our Pods and Jobs in the form of a ConfigMap.

## Implementing the controller

If you decided to create your CRD(s) using the Kubernetes API you can include and package this code together with your controller. This makes sure the resources your controller acts on, are definitely available in your cluster. Otherwise you'd need to make sure that your Kubernetes manifest is being applied before starting your controller which can be cumbersome. That's the reason I prefer the API approach and will be going forward using it.

The controller application itself is essentially an endless loop that constantly watches Kubernetes resources of a specific kind, in our case ExchangeRate objects. Upon an update (creation, modification, deletion) its business logic will react accordingly. This can be anything from:

- [creating DNS entries](https://github.com/kubernetes-sigs/external-dns){:target="_blank"}
- [issuing TLS certificates](https://github.com/jetstack/cert-manager){:target="_blank"}
- or fetching exchange rates from an API and storing the result in a ConfigMap

Although this could be implemented from scratch there's a great framework that does most of the heavy lifting called [Kopf](https://kopf.readthedocs.io/en/latest/){:target="_blank"}. It allows you to almost entirely focus on implementing the business logic of your controller.

Below you can see all the code that is necessary to watch for and react on a newly created ExchangeRate object.

```python
import kopf

@kopf.on.create('operators.brennerm.github.io', 'v1', 'exchangerates')
def on_create(namespace, spec, body, **kwargs):
    print(f"An ExchangeRate object has been created: {body}")
```

Having this we can concentrate on:

1. extracting the requested currency out of the ExchangeRate object
```python
currency = spec['currency']
```

2. querying the current exchange rate for this currency
```python
exchange_rates_url = 'https://api.exchangeratesapi.io/latest?symbols='
rate = requests.get(f"{exchange_rates_url}{currency}").json()['rates'][currency]
```

3. creating a new ConfigMap containing the exchange rate
```python
k8s_client.CoreV1Api().create_namespaced_config_map(namespace, 
    {
      'data': {
          'rate': str(rate)
      }
    }
)
```

So there you have the essential parts of the controller. All that is left is handling an update (= update the exchange rate if the currency changes) and deletion (= destroy the ConfigMap if the ExchangeRate object is deleted) of an ExchangeRate object. Updating is pretty much the same as the above code but instead of creating a ConfigMap you'll patch the existing one using:

```python
k8s_client.CoreV1Api().patch_namespaced_config_map(name, namespace, new_data)
```

Regarding handling the deletion we could choose the obvious way of implementing the `kopf.on.delete` handler and deleting the ConfigMap manually. The more elegant way IMO is making use of Kubernetes' [owner references](https://kubernetes.io/docs/concepts/workloads/controllers/garbage-collection/){:target="_blank"}. These allow to specify parent-child relationships between objects which will result in an automatic garbage collection of all children upon deleting the parent.

And as we are even too lazy to implement this ourselves we'll let Kopf take care of it by passing our ConfigMap data to `kopf.adopt`. Next to a few other things this will set the owner reference of the ConfigMap to our ExchangeRate object.

And that is all to create a simple "CRUD" controller application using Kopf. Let's package and finally deploy it to our Kubernetes cluster.

## Packaging and running the controller

As an operator will, similar to any other application, run within a Pod, we need to package it as one of the Kubernetes supported image formats. I decided to go with the most popular way of building my image using a Dockerfile. Below you can find its content and a few comments that explain each step.

```
FROM python:3.8-alpine
apk --update add gcc build-base # required to build some of the following pip packages
RUN pip install --no-cache-dir kopf kubernetes requests # install our dependencies
ADD exchangerates-operator.py / # copy our operator into the image
CMD kopf run /exchangerates-operator.py # start our operator on container creation
```

The resulting image needs to be pushed to some registry your Kubernetes cluster has access to. Afterwards you can deploy the operator e.g. by using a Deployment manifest that could look like this.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: exchangerates-operator
  labels:
    app: exchangerates-operator
spec:
  replicas: 1 # make sure to not have more than one replicas
  strategy:
    type: Recreate # make sure the old pod is being killed before the new pod is being created
  selector:
    matchLabels:
      app: exchangerates-operator
  template:
    metadata:
      labels:
        app: exchangerates-operator
    spec:
      containers:
      - name: exchangerates-operator
        image: registry.brennerm.io/exchangerates-operator:latest
```

If you are using RBAC ensure that your operator has the sufficient permissions to register CRDs, read ExchangeRate objects, create events and ConfigMaps. The according role could look like so:

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: exchangerates-operator
rules:
- apiGroups: ["apiextensions.k8s.io"]
  resources: ["customresourcedefinitions"]
  verbs: ["create"]
- apiGroups: ["operators.brennerm.github.io"]
  resources: ["exchangerates"]
  verbs: ["*"]
- apiGroups: [""]
  resources: ["configmaps"]
  verbs: ["create, patch"]
- apiGroups: [""]
  resources: ["events"]
  verbs: ["create"]
```

After that's done we are ready to try out our new operator. To do that we're going to use the following ExchangeRate object.

```yaml
# exchangerate.yml
apiVersion: operators.brennerm.github.io/v1
kind: ExchangeRate
metadata:
  name: exchange-rate-usd
spec:
  currency: USD
```

Apply it and a ConfigMap with the following content should appear pretty much instantly.

```bash
$ kubectl apply -f exchangerate.yml
$ kubectl get configmaps
NAME                      DATA   AGE
exchange-rate-usd-j98bc   1      2s

$ kubectl describe configmaps exchange-rate-usd-j98bc
Name:         exchange-rate-usd-j98bc
Namespace:    default
Labels:       <none>
Annotations:  <none>

Data
====
rate:
----
1.1901
Events:  <none>
```

And there we have our working operator that takes care of registering a CRD on startup and starting the controller application that watches objects of a this resource kind. Have a look at the picture below to review all the relevant parts and processes.

{% include image.html url="/static/images/exchangerates-operator.svg" description="Overview of how our Exchange Rates operator works" %}

Of course that's a fairly minimal example but it should give you all the tools and knowledge to create much more complex operators.

I pushed all the code and manifests into a [Git repository](https://github.com/brennerm/exchangerates-operator){:target="_blank"} for you to see the operator as a whole. If you still run into issues or have open questions feel free to drop me a message. Hope you enjoyed that little guide. 👍

## Update 19.01.2021
Nolar, aka Kopf's current maintainer, [pointed out](https://twitter.com/nolar/status/1351289223979143174?s=20){:target="_blank"} that Timers would be a good fit for this use case as well. They allow you to regularly trigger your controller no matter if there were changes on your objects. For our use case this would for example allow us to automatically pull and update the exchange rate every hour like so:

```python
@kopf.timer('operators.brennerm.github.io', 'v1', 'exchangerates', interval=3600.0)
def update_exchange_rate(namespace, name, spec, status, **kwargs):
    # update ConfigMap
    ...
```

Check [the documentation](https://kopf.readthedocs.io/en/stable/timers/){:target="_blank"} for some further details.

---
