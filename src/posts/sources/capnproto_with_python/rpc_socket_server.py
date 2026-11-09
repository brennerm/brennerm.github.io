import capnp
import tempconv_capnp
from socket import socket


def k2f(value):
    return value * (9/5) - 459.67


def k2c(value):
    return value - 273.15


def f2k(value):
    return (value + 459.67) * (5/9)


def f2c(value):
    return (value - 32) * (5/9)


def c2k(value):
    return value + 273.15


def c2f(value):
    return value * 1.8 + 32.00


CONVERTER = {
    'k': {
        'f': k2f,
        'c': k2c
    },
    'f': {
        'k': f2k,
        'c': f2c
    },
    'c': {
        'k': c2k,
        'f': c2f
    },
}


def restore(ref):
    assert ref.as_text() == 'tempConv'
    return TempConv()


class TempConv(tempconv_capnp.TempConv.Server):
    def convert(self, temp, target_unit, **kwargs):
        temp_dict = temp.to_dict()
        
        result = tempconv_capnp.Temperature.new_message()
        result.unit = target_unit
        result.value = CONVERTER[temp_dict['unit']][str(target_unit)](temp_dict['value'])

        return result


if __name__ == '__main__':
    s = socket()
    s.bind(('127.0.0.1', 12345))
    s.listen(1)
    conn, addr = s.accept()
    
    server = capnp.TwoPartyServer(conn, bootstrap=TempConv())
    server.on_disconnect().wait()