---
layout: post
title: Cap'n Proto with Python
description: Find out how to use Cap'n Proto with Python.
category: posts
tags: python capnproto
draft: false
---
If you are already familiar with Cap'n Proto and just want to see how to use it with Python click [here](#capnpwithpython).
## Introduction to Cap'n Proto
Ever heard of Cap'n Proto? - No it's not one of the worst named superheroes ever. Lets have a look at what the [official webpage](https://capnproto.org) is saying:

*Cap’n Proto is an insanely fast data interchange format and capability-based RPC system.*

This addresses two points - **data interchange format** and **RPC**. But before we can make use of whatever this means we will have a look at Cap'n Proto's schema language.
### Schema language
This language is used to define structures for further use. It's syntax shows similarities to the C programming language and supports common data types like Boolean, Integer, Struct, Enum, etc.
Let's have a look at it:

{% highlight text %}
const blogUrl :Text = "brennerm.github.io/"; 

enum Language {
	en @0;
	de @1;
	ru @2;
}

struct Date{
	year @0 :Int16;
	month @1 :UInt8;
	day @2 :UInt8;
}

struct Post {
	availableLanguages @0 :List(Language);
	publishDate @1 :Date;
	content @2 :Text;
}
{% endhighlight %}

As you see containers like _struct_ or _enum_ are supported and can be used to easily abstract real-world objects. 

You may have already noticed the numbers behind every single field. This enables Cap'n Proto to keep your evolving schema backwards compatible. As long as you follow [some rules](https://capnproto.org/language.html#evolving-your-protocol) there is no need to spend time on keeping your application compatible with older versions.

There's no point going over the whole vocabulary of the schema language. It's just important to get a basic understanding, cause the following features use this schemas as a basis. If you want to learn more about the schema language have a look [here](https://capnproto.org/language.html).
### data interchange format
The data interchange format is based on messages that can contain multiple instances of our self-defined objects. These messages are saved in a binary format which is controlled by the Cap'n Proto library. 

Each data type is handled in a [defined way](https://capnproto.org/encoding.html#value-encoding) which results in a well organized format.
For bandwidth limited use cases Cap'n Proto provides a built-in packing that can save up a lot of unnecessary zero bytes. In some cases the size can be shrunk further by applying a suitable compression algorithm.
### RPC
RPC stands for **remote procedure call** which is a type of inter-process communication. It allows you to call functions that are provided by another process on your machine or even over the network.

It follows the client-server-architecture with the server providing and executing the functions and the clients calling them. The interface definition is handled through the schema language we discussed earlier:

{% highlight text %}
interface Calc {
	sum @0 (a :Int64, b :Int64) -> (result :Int64);
	sub @1 (a :Int64, b :Int64) -> (result :Int64);
	mul @2 (a :Int64, b :Int64) -> (result :Int64);
	div @3 (a :Int64, b :Int64) -> (result :Float64);
}
{% endhighlight %}

This is an example of a really basic calculator, but contains all you need to know. It's of course possible to use your own defined structures as parameters or return value.

There are already several implementations of RPC like Java's RMI, CORBA or DBUS, but Cap'n Proto provides a feature called **promise pipelining**. This lets you use a return value of one function call as an argument for another without waiting for the first function to finish. This is especially useful when your application runs in an environment with a long round trip time, cause you save up unnecessary requests. More information can be found [here](https://capnproto.org/rpc.html#time-travel-promise-pipelining).
<a name="capnpwithpython"></a>
## Cap'n Proto with Python
With the knowledge of what Cap'n Proto is all about we'll have a look into [pycapnp](https://github.com/jparyani/pycapnp). It's a wrapper for Cap'n Proto that makes most of the features available to use with Python. The following examples will be based on this schema:

{% highlight text %}
enum Unit {
	k @0;
	f @1;
	c @2;
}

struct Temperature {
	value @0 :Float64;
	unit @1 :Unit;
}

interface TempConv {
	convert @0 (temp :Temperature, target_unit :Unit) -> (result :Temperature);
}
{% endhighlight %}

### Message creation
Before we are able to create our messages we need to read in our schema. Pycapnp handles this pretty *pythonic*:

{% highlight python %}
import capnp
import tempconv_capnp
{% endhighlight %}

This will search the current directory and your *PYTHONPATH* for a file called *tempconv.capnp*. The schema is going to be processed and made accessible like a module within your code. You can then create and define your messages like that:

{% highlight python %}
temp = tempconv_capnp.Temperature.new_message()

temp.value = 100
temp.unit = 'c'
print('temperature:' + str(temp))
{% endhighlight %}

Pretty easy, right? Pycapnp handles all validation and errors are raised when a value is inappropriate (type mismatch, not in enum, ...).

If you like dicts, this is a way you can go:

{% highlight python %}
temp_dict = temp.to_dict()
temp_dict['value'] = 50

restored_temp = tempconv_capnp.Temperature.new_message(**temp_dict)
print('temperature:' + str(restored_temp))
{% endhighlight %}

### De-/Serialization
The de- and serialization from and to the data interchange format is supported as well:
{% highlight python %}
import capnp
import tempconv_capnp

temp = tempconv_capnp.Temperature.new_message()

temp.value = 100
temp.unit = 'c'
print(temp)

temp_bytes = temp.to_bytes()
print(temp_bytes)

restored_temp = tempconv_capnp.Temperature.from_bytes(temp_bytes)
print(restored_temp)
{% endhighlight %}

The resulting bytes can be send over the network or can be saved in a file.
To use Cap'n Proto's built-in packing just append *_packed* to *to_bytes* and *from_bytes*. 
### RPC
Let's come to the most interesting part of the library. Our target is to build a server that offers and executes the *convert* function. The functionality is implemented like this:
{% highlight python %}
# name of the class doesn't matter, as long as you inherit from your server class
class TempConv(tempconv_capnp.TempConv.Server):
    def convert(self, temp, target_unit, **kwargs):
        temp_dict = temp.to_dict()
		
		result = tempconv_capnp.Temperature.new_message()
        result.unit = target_unit
        result.value = CONVERTER[temp_dict['unit']][str(target_unit)](temp_dict['value'])

        return result
{% endhighlight %}

Be sure to name your function according to your interface definition and add *\*\*kwargs* to your parameters. This will ensure your server remains compatible with newer versions that may provide more arguments.

Now it's time to start our server:
{% highlight python %}
# enables you to save capabilities and restore them later
def restore(ref):
    assert ref.as_text() == 'tempConv'
    return TempConv()

server = capnp.TwoPartyServer('127.0.0.1:12345', restore)
server.run_forever()
{% endhighlight %}

With the server up and running we can now connect our client:

{% highlight python %}
client = capnp.TwoPartyClient('localhost:12345')

tempconv = client.ez_restore('tempConv').cast_as(tempconv_capnp.TempConv)
{% endhighlight %}

With the connection in hand we can finally call our *convert* function:

{% highlight python %}
request = tempconv.convert_request()

request.temp.value = 100
request.temp.unit = 'c'
request.target_unit = 'k'

promise = request.send()
{% endhighlight %}

The resulting promise can be handled in two ways:

- asynchronous:
{% highlight python %}
promise.then(lambda ret: print(ret)).wait()
{% endhighlight %}

- synchronous: 
{% highlight python %}
result = promise.wait()
{% endhighlight %}

And there is our result:
{% highlight python %}
( result = (value = 373.15, unit = k) )
{% endhighlight %}


That's all you need to know for now to make use of Cap'n Proto for your Python application. When having a look at the [roadmap](https://capnproto.org/roadmap.html) there will be some interesting features in the future, like *shared-memory RPC* or *dynamic schema transmission* so stay tuned for updates.
<br>All shown code examples can be found on [github](https://github.com/brennerm/brennerm.github.io/tree/master/_posts/capnproto_with_python).

#Update 20.05.2015
Played around using my own sockets when communicating with pycapnp's RPC lately and had some trouble in the beginning. So I just want to let you guys know how to get it working.
The first step is to connect your client and server socket:
{% highlight python %}
# server
s = socket()
s.bind(('127.0.0.1', 12345))
s.listen(1)
conn, addr = s.accept()

# client
s = socket()
s.connect(('127.0.0.1', 12345))
{% endhighlight %}

Now instead of handing over the address + port hand over your socket to the server and client constructor. 
{% highlight python %}
# server
server = capnp.TwoPartyServer(conn, bootstrap=TempConv())
server.on_disconnect().wait()

# client
client = capnp.TwoPartyClient(s)
tempconv = client.bootstrap().cast_as(tempconv_capnp.TempConv)

request = tempconv.convert_request()

request.temp.value = 100
request.temp.unit = 'c'
request.target_unit = 'k'

promise = request.send()
print(promise.wait())
{% endhighlight %}

Be sure to use *server.on_disconnect().wait()* instead of *server.run_forever()* and it will work as expected.
