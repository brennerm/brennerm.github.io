---
layout: post
title: Why newly created AWS Route53 records may not resolve
description: Resolving newly created AWS Route53 DNS records may end up taking several minutes or even hours. Here's the explanation of one possible cause.
category: posts
tags: aws
draft: false
thumbnail: route53-nxdomain.png
---

{% include image.html url="/static/images/route53-nxdomain.png" %}

So there you are with your newly created Route53 hosted zone, ready to assign some DNS names to your hosts. A simple click on the "Create Record" button and you want to check if it works immediately. But trying to resolve the DNS entry fails. What's going on?

## pending vs. insync

Creating a Route53 record is a two-step process consisting of:

- pushing the record to the Route 53 database
- propagating it to the AWS DNS servers

Whether you use the AWS console, the CLI tool or the API, only the first step will happen synchronously and almost immediately. Afterwards the record or rather the submitted change request will be in the `PENDING` state.

Using the [`GetChange` API endpoint](https://docs.aws.amazon.com/Route53/latest/APIReference/API_GetChange.html){:target="_blank"} or the [`wait resource-record-sets-changed` CLI command](https://awscli.amazonaws.com/v2/documentation/api/latest/reference/route53/wait/resource-record-sets-changed.html){:target="_blank"} you can then make sure the state switches to `INSYNC`. This indicates that your changes have been propagated to all AWS DNS servers responsible for your domain. AFAIK the AWS console does not allow you to check this synchronization state. But AWS claims that [propagation is finished within 60 seconds](https://aws.amazon.com/premiumsupport/knowledge-center/route-53-propagate-dns-changes/){:target="_blank"}.

Alright, your newly created record is now in sync and you can finally resolve it. Just to realize that it fails again. What's the deal now?

## understanding SOA

If you have been managing a DNS domain you probably came across certain record types like A, CNAME or TXT. There's another very important but fairly unknown one, called SOA.

SOA stands for "start of authority record" and contains several information about a given DNS zone. For `shipit.dev` it looks like so:

```bash
$ dig shipit.dev SOA  
...
shipit.dev. 1934 IN SOA dns1.registrar-servers.com. hostmaster.registrar-servers.com. 1638547874 43200 3600 604800 3601
...
```

Here's an explanation of each part. All time value are in seconds.

- `shipit.dev.`: the zone name
- `1934`: the TTL of the SOA record
- `IN`: the class of this record
  `SOA`: the type of this record
- `dns1.registrar-servers.com.`: the primary DNS server
- `hostmaster.registrar-servers.com.`: the administrator's mail address
- `1638547874`: the zone's serial number
- `43200`: the time secondary servers should wait until they refresh from the primary one
- `3600`: the retry interval for failed requests of secondary servers
- `604800`: the expiration time for secondary servers if primary is unreachable
- `3601`: the minimum duration value for how long records may be cached

I won't go into each fields' detail as only two of them are relevant for our topic.

You may know the term TTL (time to live) which determines how long a response for a certain DNS record is being cached. What's important to us is that there's even a TTL value for records that can't be resolved.

According to the [RFC 2308](https://datatracker.ietf.org/doc/html/rfc2308#section-5){:target="_blank"}, it's being calculated by choosing the smaller value between the TTL of the SOA record, in our case `1934`, and the minimum duration value of our zone, in our case `3601`. The resulting value is also being referred to as the negative TTL.

This means in our scenario, a negative answer to a DNS query may be cached up to one hour at worst. And this may lead to our problem.

## putting it together

In case you haven't figured out what's going on, let's have a look at the timeline of events.

1. We create a new AWS Route53 DNS record.
2. We try to resolve it but the record has not yet been propagated to AWS' DNS servers and the resolution fails.
3. The negative answer is being cached with a certain TTL.
4. We wait 60 seconds until our new DNS record has been propagated to all DNS servers.
5. All consecutive tries to resolve the record keep failing until the negative answer in our cache expires.

And this is why newly created Route53 records may not resolve for quite some time if you query them too quickly. This pitfall is especially important when creating records in an automated fashion and querying them immediately after.

For example in my case I was encountering this issue when using external-dns. This component automatically sets up DNS entries for applications running in Kubernetes. Deploying my application and executing tests against its external endpoints using a CI pipeline resulted in numerous failing DNS queries.

Preventing this issue from happening is fairly simple though. Waiting a minute before querying is probably the easiest solution. Actively polling the synchronization state will be a bit quicker but may be a lot harder depending on the situation.

Be aware that this is not really an issue with AWS Route53 in particular. Negative TTLs exist for every DNS domain and are there to protect the DNS server from unnecessary queries.

Hopefully you are going to remember this post when encountering similar issues. Until then, enjoy your time in the cloud.

---
