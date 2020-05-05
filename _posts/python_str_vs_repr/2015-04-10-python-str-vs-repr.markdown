---
layout: post
title: Python's str() vs. repr()
description: This post will tell you difference between Python's str() and repr().
category: posts
tags: python
draft: false
---
Ever wondered what happens when you call Python's built-in str(X), with X being any object you want? The return value of this function depends on the two [magic methods](http://www.rafekettler.com/magicmethods.html) [\_\_str\_\_](https://docs.python.org/3/reference/datamodel.html#object.__str__) being the first choice and [\_\_repr\_\_](https://docs.python.org/3/reference/datamodel.html#object.__repr__) as a fallback. But what's the difference between them? When having a look at the docs

{% highlight python %}
>>> help(str)
'Create a new string object from the given object.'
>>> help(repr)
'Return the canonical string representation of the object.'
{% endhighlight %}
they seem to be fairly similar. Let's see them in action:

{% highlight python %}
>>> str(123)
'123'
>>> repr(123)
'123'
{% endhighlight %}
Alright no difference for now.

{% highlight python %}
>>> str('Python')
'Python'
>>> repr('Python')
"'Python'"
{% endhighlight %}
A second pair of quotes around our string. Why?<br/>With the return value of _repr()_ it should be possible to recreate our object using eval(). This function takes a string and evaluates it's content as Python code. In our case passing _"'Python'"_ to it works, whereas _'Python'_ leads to an error cause it's interpreted as the variable _Python_ which is of course undefined. Let's move on...

{% highlight python %}
>>> import datetime
>>> now = datetime.datetime.now() 
>>> str(now)
'2015-04-04 20:51:31.766862'
>>> repr(now)
'datetime.datetime(2015, 4, 4, 20, 51, 31, 766862)'
{% endhighlight %}
This is some significant difference. While _str(now)_ computes a string containing the value of _now_, _repr(now)_ again returns the Python code needed to rebuild our _now_ object.</br>

The following clues might help you to decide when to use which:

|str()                     |repr()                            |
|--------------------------|----------------------------------|
|- make object readable    |- need code that reproduces object|
|- generate output for end user|- generate output for developer|

<br>
These points should also be considered when writing \_\_str\_\_ or \_\_repr\_\_ for your classes. 

---
