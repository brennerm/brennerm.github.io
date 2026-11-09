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