import capnp
import tempconv_capnp

temp = tempconv_capnp.Temperature.new_message()

temp.value = 100
temp.unit = 'c'

print('temperature:' + str(temp))

temp_dict = temp.to_dict()
temp_dict['value'] = 50

restored_temp = tempconv_capnp.Temperature.new_message(**temp_dict)

print('temperature:' + str(restored_temp))