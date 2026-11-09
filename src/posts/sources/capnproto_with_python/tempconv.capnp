@0xa1a74b07a3427e1f;

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