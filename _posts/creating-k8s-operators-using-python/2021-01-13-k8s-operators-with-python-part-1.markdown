---
layout: post
title: Kubernetes operators with Python &#35;1&#58; Creating CRDs
description: Developing Kubernetes/K8s operators with Python Part 1&#58; Creating CRDs using manifests and the Kubernetes API
category: posts
tags: kubernetes python
draft: false
---
## Introduction

A lot of the core processes happening in a Kubernetes cluster are following the so called [controller pattern](https://kubernetes.io/docs/concepts/architecture/controller/#controller-pattern){:target="_blank"}. This pattern describes an ongoing monitoring of resources and reacting appropriately to bring the current state closer their desired state.

A simple example is the relationship between the Deployment and Pod resources. When increasing the replica count in the Deployment object the number of Pods will be adjusted by the responsible controller.

Operators are a special kind of controllers and a popular way of extending Kubernetes clusters. They consist of a controller application and domain specific custom Kubernetes resources ([CRDs](https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/){:target="_blank"}). The controller is watching for changes on objects he's responsible for and executes tasks according to his business logic.

As a huge part of the K8s ecosystem is written in Golang it's also the de facto standard language when writing operators. Today I wanna show you how to write your own operator using a more beginner friendly programming language like Python.

To showcase the whole process we'll create an operator that provides currency exchange rates through a [ConfigMap](https://kubernetes.io/docs/concepts/configuration/configmap/){:target="_blank"} object. These can then be referred to by our Pods and Jobs. The rates will be fetched from the [Exchange Rates API](https://exchangeratesapi.io/){:target="_blank"} and to tell the operator which rates to pull, we'll register our own CRD. The following diagram will provide an overview of all components and their relations.

{% include image.html url="/static/images/exchangerates-operator.svg" description="Overview of how our Exchange Rates operator works" %}

We'll take care of implementing the controller application in the next part of this little blog series. At first we are going to start with defining our custom ExchangeRate resource by creating a CRD.

## Creating the CRD

Creating a CRD is nothing else than registering a new Kubernetes resource type with a fixed set of fields and their data types. To accomplish that we'll have a look at two different ways.

### Using a Kubernetes manifest

Every Kubernetes resource can be created using a manifest and as a CRD is a resource itself, it is no exception.

```yaml
# crd.yml
apiVersion: apiextensions.k8s.io/v1
kind: CustomResourceDefinition
metadata:
  name: exchangerates.operators.brennerm.github.io
spec:
  group: operators.brennerm.github.io
  versions:
    - name: v1 # it's possible to provide multiple versions of a CRD
      served: true # it's possible to disable a CRD
      storage: true # there can be multiple versions but only one can be used to store the objects
      schema:
        openAPIV3Schema:
          type: object
          properties:
            spec:
              type: object
              properties:
                currency:
                  type: string
                  enum: ["CAD","CHF","GBP","JPY","PLN","USD"] # we'll limit the valid currencies to these
  scope: Namespaced # resources can be namespaced or available for the whole cluster
  names:
    plural: exchangerates
    singular: exchangerate
    kind: ExchangeRate # this name is being used in manifests
    shortNames: # these short names can be used in the CLI, e.g. kubectl get er
    - er
```

The schema definition follows the [OpenAPI v3 specification](https://swagger.io/docs/specification/data-models/){:target="_blank"} which can be used to define various data types and nested structures. After applying this file, e.g. with `kubectl apply -f crd.yml` we are ready to create our first _ExchangeRate_ object using the following manifest.

```yaml
# exchangerate.yml
apiVersion: operators.brennerm.github.io/v1
kind: ExchangeRate
metadata:
  name: exchange-rate-usd
spec:
  currency: USD
```

### Using the Kubernetes API

Instead of using a manifest we can also register our CRD by using the Kubernetes API. Conveniently there's an [official Python client](https://github.com/kubernetes-client/python){:target="_blank"} that we'll use for this purpose.

Below you can find the definition of our CRD as a Python object. You'll see a lot of similarities to the above manifest.

```python
import kubernetes.client as k8s_client
import kubernetes.config as k8s_config

exchange_rate_crd = k8s_client.V1CustomResourceDefinition(
    api_version="apiextensions.k8s.io/v1",
    kind="CustomResourceDefinition",
    metadata=k8s_client.V1ObjectMeta(name="exchangerates.operators.brennerm.github.io"),
    spec=k8s_client.V1CustomResourceDefinitionSpec(
        group="operators.brennerm.github.io",
        versions=[k8s_client.V1CustomResourceDefinitionVersion(
            name="v1",
            served=True,
            storage=True,
            schema=k8s_client.V1CustomResourceValidation(
                open_apiv3_schema=k8s_client.V1JSONSchemaProps(
                    type="object",
                    properties={"spec": k8s_client.V1JSONSchemaProps(
                        type="object",
                        properties={"currency":  k8s_client.V1JSONSchemaProps(
                            type="string",
                            enum=["CAD","CHF","GBP","JPY","PLN","USD"]
                        )}
                    )}
                )
            )
        )],
        scope="Namespaced",
        names=k8s_client.V1CustomResourceDefinitionNames(
            plural="exchangerates",
            singular="exchangerate",
            kind="ExchangeRate",
            short_names=["er"]
        )
    )
)
```

Afterwards we'll need to load our _kubeconfig_ and call the API endpoint for finally creating the CRD.

```python
k8s_config.load_kube_config()

with k8s_client.ApiClient() as api_client:
    api_instance = k8s_client.ApiextensionsV1Api(api_client)
    try:
        api_instance.create_custom_resource_definition(exchange_rate_crd)
    except k8s_client.rest.ApiException as e:
        if e.status == 409: # if the CRD already exists the K8s API will respond with a 409 Conflict
            print("CRD already exists")
        else:
            raise e

```

The function `load_kube_config` reads the access credentials to your K8s cluster from your local environment (most likely _~/.kube/config_). If that's not what you intend, the library also provides manually setting the configuration or loading it from within an [in-cluster environment](https://github.com/kubernetes-client/python-base/blob/b0021104307c99bac5b2a7e353df21d864f85809/config/incluster_config.py#L112){:target="_blank"}.

No matter how you end up creating your CRD, executing `kubectl api-resources` should list your new resource type if you've done everything correctly.

```bash
$ kubectl api-resources
NAME                              SHORTNAMES   APIGROUP                       NAMESPACED   KIND
...
exchangerates                     er           operators.brennerm.github.io   true         ExchangeRate
...
```

Personally I prefer this approach compared to using a CRD manifest. I'll talk about the reason in [the second part](/posts/k8s-operators-with-python-part-2.html) of this blog series in which we'll implement the controller application.

---
