import capnp
import tempconv_capnp


client = capnp.TwoPartyClient('localhost:12345')

tempconv = client.ez_restore('tempConv').cast_as(tempconv_capnp.TempConv)

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
