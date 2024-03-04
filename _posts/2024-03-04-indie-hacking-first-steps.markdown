---
layout: post
title: My first steps in indie hacking
description: Sharing the journey of getting my feet wet with indie hacking
category: posts
tags: indie-hacking
draft: false
thumbnail: steps.jpg
---

{% include image.html url="/static/images/steps.jpg" height="300px" description="Photo by Jake Hills" source="https://unsplash.com/photos/person-wearing-green-pants-bt-Sc22W-BE" %}

Hey, thanks for stopping by. After over two years of silence on this blog I finally felt the urge to write about something that is worth sharing again. A lot has happened since my last post but that's something for another day.

Today we are talking indie hacking, an endeavor? hobby? lifestyle? 🤷 that I started moving into at the end of last year. In case you are unfamiliar with the term indie hacking, here's my definition:

person + computer = product (ideally with users and which turns profits)

No external money, no employees, just a single person building and selling stuff online.

The last two months to me felt a bit like back then in 2020 when I decided to go freelance full-time. A lot of uncertainty and a whole lot of new stuff to learn. Exciting times, but let's start from the beginning.

## My Background

So here's my background in a few bullet points to set the baseline for my journey.

- got a degree in computer science
- started working as a software developer (Java back then 🙊)
- transitioned over to SysAdmin / DevOps, managing a local data center
- switched jobs to gain experience in cloud infrastructure
- stepped into DevOps freelancing full-time

All the while I was working on various open source projects, which allowed me get to ~~a decent~~ some level in programming. Technologies that I was already familiar with included:

- Python: main programming language for years
- HTML, CSS, JS: I know the basics, no pro in any of them (can you be pro at HTML? 🤔)
- Django: a few projects over the years, but nothing that made it into "production"
- Angular, React, Vue: one project each, just to understand what they're about

## Why indie hacking?

Actually I really asked myself this question for the first time while writing this post and it wasn't that easy to come up with an answer. I'm still not 100% sure but here are my thoughts.

#### Learning new stuff

This one is probably the biggest factor for me.

If you do something almost every day for a few years, you usually get pretty good at it. And that's where I'm currently at when it comes to setting up, maintaining and improving cloud infrastructure. Don't get me wrong, I'm definitely not saying that I am along the best DevOps guys out there. But for 90% of the topics the average client approaches me with, a solution is already in my head after a short time. Reason being that the challenges companies have, usually are all very similar.

Long story short, I want to dive into different topics and indie hacking allows me to do just that. Wearing the marketing, sales, technical, ... hat forces me to jump into areas I have never been in and that's what I'm looking for.

{% include image.html url="/static/images/dalle-indie-hacker.webp" height="400px" description="DALL-E's understanding of an indie hacker wearing multiple hats 😆" %}

#### Back to simplicity

Holy f, cloud infrastructure got (was made) complicated. From single VMs that you SSH into, to hundreds of cloud resources that get created almost instantly using some Terraform module just to run an app on 0.5 vCPU cores and 1GB of for 100 dollars a month (hello AWS Fargate 😉).

Obviously, there's a place for that kind of stuff and I still love to work on it in my freelance projects. But for my "personal" projects I'd like to take a step back and embrace simplicity again. Simple technologies, simple processes, just get things done when they need to in the shortest time possible.

This also touches the topic of perfectionism. In my professional work it's often not about finding just any solution but the best. And that's also what I expect from myself. Not just delivering anything, but the best possible thing.

This may be fine, but if you want to build a product, alone, from scratch, without spending months before launching it and finding out nobody cares about it, you have to focus on what matters and be fine with an 80% solution (for the moment).

#### Building for users

In my freelance projects, especially when not being part of the actual product development, you get fairly disconnected from the people that you are actually building for. Which makes me feel a bit sad.

If you've been shipping some kind of software you probably remember the first time you've got feedback from a random stranger on something you've built. Heck, even negative comments spark emotions as it's always exciting to hear what other people think about your creation.

I hope that with my indie projects I'll encounter these kinds of situations more often and eventually find something that helps other people in whatever they are trying to achieve.

#### Decoupling income from time

This one is pretty obvious and I'm probably romanticizing it too much. As a freelancer I know pretty well what it means to sell your time for money. I see these numbers every month on the invoices that I send out.

So generating some income without actively spending time working, sounds like something desirable. Who knows what I'm going to do with the freed up time. 🤷

## Getting things started

Alright, that was a pretty long intro but I feel like it was necessary.

So what was my first milestone? In the beginning of January I set myself the goal to get something shipped by the end of the month. It didn't have to be pretty, it didn't have to get much attention/users, it just had to be functional and providing some value (at least in my eyes). Here's what I came up with.

### Blocked by CORS

If you've been building web applications, you've probably come across CORS issues. If you haven't, just know, they are annoying, pretty hard to debug and a lot of developers encounter them each and every day (literally, just check Reddit 😄).

Recognizing this, I set out to build a "universal solution" for all kinds of CORS issues, providing a knowledge base but more importantly, tools to help developers figure out what's going on.

As it was my first project I didn't expect anything from it. It was just about getting something out there and that's what I did. After just a little more than 7 days of work I started sharing [blockedbycors.dev](https://blockedbycors.dev/){:target="_blank"} publicly.

It only included one central feature, which is still its core as of today, a CORS debugging tool. Not getting into much detail here, but it tells you whether a request from you web app would pass a server's CORS policy.

{% include image.html url="/static/images/blockedbycors-result.png" height="200px" description="The result a user gets from the CORS debugger" %}

To save time, I simply used tools I already knew pretty well. Django as a fullstack framework, no fancy JS library, just a bit of HTMX for interactivity and TailwindCSS + DaisyUI to make things don't look too bad.

A few days later I also added a configuration generator, as properly configuring CORS is not an easy task. In general, during the building process and while learning the ins and outs of CORS, so many ideas popped into my mind that one could build. But I had to resist. There's another half (three-quarter? nine-tenth?), which is finding users for your app.

So I split up my marketing approach (it sounds so wrong to call it like that 😆) into two parts:

#### Short term strategy

To get some short term validation and finding out whether it's even worth pursuing the current path I just reached out to people having CORS issues and sharing my tool with them. Finding these people was pretty easy as they are numerous 😆. Enter "blocked by CORS" into Google, get the results from the last 24 hours, done.

This way I approached two to five people every day for at least a week. The feedback was pretty good and I was able to help almost all of them to fix their issue. Very nice! Plus, the places I shared my tool (StackOverflow, various forums) still bring in some traffic up until today.

This approach is perfect to get some (almost instant) feedback but obviously it doesn't scale well. Nobody wants to spend their time doing this for weeks or even months.

Additionally it's the nature of problem solving tools to become useless once the problem is solved. Once the people get their CORS issue sorted, they move on and may only come back when they encounter the next one. But CORS issues are not like dirty dishes. It's not something you have to deal with every week. At least I hope so.

What I also did was to bundle all the accumulated knowledge about CORS into an easily digestible format. The outcome is an [interactive mindmap](https://blockedbycors.dev/cheatsheet/){:target="_blank"} that was a nice piece to share and people really liked it. Traffic spikes from Reddit or Hacker News are motivating but they won't bring too much results long term.

So we need a way to bring in some regular traffic.

#### Long term strategy

The area of CORS issues felt like a typical case for organic traffic to me. People copy paste their CORS error into Google, they find an article on blockedbycors.dev, they use the tool to find the solution to their CORS issue, user is happy.

So I started setting up a blog with Hugo (great tool!) and wrote some articles about various CORS topics. Now comes the big question, how do I get people to find my blog?

The standard answer to this question are the magical three letters S E O (search engine optimization). You remember me saying that I wanted to dive into new topics? Here we go, I've never had anything to do with SEO. It's basically the language to talk to search engines and whisper them in their ears: "Hey, Google/Bing/DuckDuckGo. When someones searches for X, send them to my page!"

Here's the simplified concept:

- create content that contains keywords you want to rank for, e.g. in my example: CORS issue, blocked by CORS
- get other pages to link to your page with a dofollow link

This increases your domain rating, which in turn puts your page higher up in the search result.

For me, this was probably the hardest thing to do during the last two months. It feels like a game that should not be played. Plus the whole process has a feedback loop time that a developer cannot cope with. Be happy if you can see any results within two months. I'll keep you posted. 😅

## Any Results?

OK, so what has been the outcome of all this work?

Let's start with some traffic numbers. For the static blog that contains the articles and references to the tools, Cloudflare Analytics reported 1200 page visits since the launch on January 17th. As usual, people that are using ad blockers or privacy protection are not included in these numbers.

{% include image.html url="/static/images/blockedbycors-blog-traffic.png" height="300px" description="Top traffic sources on blockedbycors.dev of the last 30 days, numbers aren't accurate, Cloudflare Analytics just rounds everything to hundreds" %}

I also added some server-side request tracking to the Django application that is providing the tools and this reports 2400 visits since launch.

{% include image.html url="/static/images/blockedbycors-backend-traffic.png" height="300px" description="Traffic on app.blockedbycors.dev of the last 30 days" %}

So all together we are looking at roughly 3500 visits in total, which is a nice bit of traffic for a page that only exists for a few weeks.

I'm even more happy to see that people are regularly using the CORS debugger to, hopefully, fix their CORS issues. Currently there are 5 to 10 different sites (and some of them are pretty well known 😆) analyzed everyday using the tool.

To capture some direct user feedback I also added a small form, but I didn't receive any submissions yet. Means that everything is working, right? 😅

During the whole process I also started sharing regular updates about anything I do on Twitter and built a bit of a following by doing so. Currently I use it as a bit of a public journal which also really helped me when writing this blog post to kind of remind me of the whole process I went through.

## Was it worth it?

Well, it's difficult to give a definitive answer here. I'm very happy that I was able to fulfil my goal of shipping an app from scratch within a very short time frame. I learned a whole lot during the process and could keep myself going even when tackling topics that I did not enjoy but were necessary.

On the other side, all of this required me to spent substantial amounts of time. For roughly three weeks I probably spent 20-30 hours per week on top of my day job, tinkering on my indie project. This left little to no time on doing other things that I enjoy. It was very exciting to go "all-in" on it but I realized that if I want to do this long-term I had to take a different approach. So what's up next?

## What's next?

With the accumulated knowledge I'm now feeling more confident than ever on continuing my indie hacker journey. To tell you the truth, I already did 😆. The initial idea of this blog post was to cover my first **two** indie projects, but after writing about the first one, I realized that it's just too much for one post. So yeah, I already worked on and **even published** my second project.

I'll talk about it and what I did differently in the next blog post. In case you are curious, I already shared parts of the story in small pieces [on Twitter](https://twitter.com/__brennerm){:target="_blank"}.

By the way, if you are in a similar situation as me or have something to share or talk about, feel free to contact me. Difficult things get easier when you share them. Hope to talk to you soon. Cheers ✌️