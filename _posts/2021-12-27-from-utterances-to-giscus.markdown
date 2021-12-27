---
layout: post
title: Moving from utterances to giscus
description: Here's how to migrate from utterances to giscus without loosing existing comments on single or multiple pages.
category: posts
tags: 
draft: false
thumbnail: utterances-to-giscus.png
---

{% include image.html url="/static/images/utterances-to-giscus.png" width="640" %}

## Why migrate?

I added the ability to leave comments on posts of this blog around a year ago. Back then I was looking for a privacy friendly, open source, free and easy to setup solution. When I came across [utterances](https://utteranc.es/){:target="_blank"} and knew I found the right tool.

Using Github's issue feature as a backend for comments is just a very elegant solution in my opinion. No database that you need to manage, using Github to authenticate users (although I'd like to allow for anonymous users) and an integration that only requires you to load one client-side script.

utterances served me very well and I could have used for way longer. If just there wouldn't be a better alternative. Around March 2021 a new Github project with the name [_giscus_](https://github.com/giscus/giscus) has been created.

While being very similar to utterances there's one distinct difference. Instead of using Github Issues it uses the fairly new Discussions feature to store comments. This alone would not have made me do a move as there's no major advantage of one over the other for this use case. But there a few points and one in particular that drove my decision to migrate.

**Github Dark theme**

Starting with a small annoyance, utterances is missing the Github Dark theme. Although there's a theme with this name, the colors don't match and I dislike the looks of it.

**Post reactions**

utterances allows you to add reactions to comments but as an author I'm also interested in the general reception of the post itself. giscus provides this feature.

{% include image.html url="/static/images/post-reactions.png" description="giscus displaying page reactions" %}

**Conversation view**

While you are able to tag users, utterances will simply render comments as a list in the order they have been created. Following conversations this way is pretty hard. giscus groups replies to a comment instead.

This is perhaps the only point where Github Discussions has a slight advantage over using Issues as the reply feature is directly built into it.

{% include image.html url="/static/images/comment-reply.png"  description="giscus rendering replies"%}

**Missing maintenance**

Coming to the most important fact that made me migrate. As with many open source projects, utterances is being taken care of by a single developer. Unfortunately it seems like he lost interest in supporting the project over the last year.

There are a lot of open issues and even PRs that aim to solve almost all of my problems with utterances. But sadly the project seems to have been abandoned completely.

Don't get me wrong, I'm not blaming anyone here. I'm an open source maintainer myself and know how changing times and interests can highly impact the level of effort you want to put into certain projects. But of course this will (rightfully) make your users move away from your software.

So the decision has been made. But how did I migrate my blog from utterances to giscus without loosing existing comments?

## Preparing your site

The setup for giscus is very similar to the one for utterances. Simply go to [giscus.app](https://giscus.app/){:target="_blank"}, click through the configuration guide, copy the resulting script tag and paste it into your page where the comments should appear. Here's my script tag with some explanation:

```html
<script src="https://giscus.app/client.js" <!-- the script to load -->
        data-repo="brennerm/brennerm.github.io-comments" <!-- the name of the repo to store the comments -->
        data-repo-id="MDEwOlJlcG9zaXRvcnkzMTg1MTk0ODQ=" <!-- the id of the repo to store the comments -->
        data-category="Announcements" <!-- the name of the Discussions category to store the comments -->
        data-category-id="DIC_kwDOEvw4vM4CAcbV" <!-- the ID of the Discussions category to store the comments -->
        data-mapping="pathname" <!-- the type of page to discussions mapping -->
        data-reactions-enabled="1" <!-- flag to enable/disable post reactions -->
        data-theme="dark" <!-- the theme to use -->
        data-lang="en" <!-- the language the comment renderer should use -->
        crossorigin="anonymous"<!-- performing CORS request without credentials -->
        async> <!-- flag to load the script asynchronously -->
</script>
```

If your repository is public, has the Discussions feature enabled and the giscus app installed, you should see the comment renderer displaying 0 items at this point. If you don't have any previous comments that you'd like to keep, you are basically done at this point.

## Migrating comments of a single page

The most important part when migrating comments from utterances to giscus is to keep the mapping of pages to discussions working. This works by selecting to correct mapping value in your script tag.

Usually it should be the same as in your utterances script tag as both offer the same mapping techniques and I expect them to be compatible. I kept using the _pathname_ mode and it worked flawlessly for me.

To be sure, try to create a new discussion containing at least one comment with the same title as your utterances issues. If everything works it should appear on your page. Be sure to delete this discussion to prevent any conflicts later on.

After verifying that the mapping works simply navigate to the relevant Github issue and click on _Convert to discussion_ on the bottom right. The following dialog should appear in which you select the correct category.

{% include image.html url="/static/images/convert-issue.png"  description="Converting an issue into a discussion" width="640"%}

If that works you are done. In my case I ended up with this error.

{% include image.html url="/static/images/unable-to-convert.png" description="Error I encountered when converting an issue to a discussion" %}

Luckily I found a workaround which should work for you as well. Navigate to the _Discussions_ tab, edit the categories and change the, in my case, _Announcements_ category to an _Open ended discussion_. Convert the issue, which should succeed now and revert the category change.

If everything worked you should see the comments pop up on your page.

## Migrating comments of multiple pages

To migrate comments of multiple pages we simply need to repeat the above process for each issue. Fortunately Github provides some bulk operations to speed up the process. At first we need to label all issues that we want to migrate. Feel free to use an existing or create a new label.

Then select the issues and apply the label of choice.

{% include image.html url="/static/images/issue-label.png"  description="Labelling multiple issues at once"%}

Afterwards navigate to the _Labels_ overview and select the _Convert issues_ action of the appropriate label.

{% include image.html url="/static/images/bulk-convert.png"  description="Converting multiple issues into discussions" width="640"%}

This process happens in the background and may take some time depending on the number of issues you migrate. After it's done all your comments should be successfully shown by the giscus comment renderer on each of your pages.

Feel free to leave a reaction and comment to make sure I did everything right. 😉 If you run into any trouble make sure to let me know or seek help in the [giscus community](https://github.com/giscus/giscus/discussions){:target="_blank"}.

---
