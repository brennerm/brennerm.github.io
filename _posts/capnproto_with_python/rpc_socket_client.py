import capnp
import tempconv_capnp
from socket import socket

s = socket()
s.connect(('127.0.0.1', 12345))

client = capnp.TwoPartyClient(s)
tempconv = client.bootstrap().cast_as(tempconv_capnp.TempConv)

request = tempconv.convert_request()

request.temp.value = 100
request.temp.unit = 'c'
request.target_unit = 'k'

promise = request.send()

# asynchronous
# promise.then(lambda ret: print(ret)).wait()

# synchronous
result = promise.wait()
print(result)
