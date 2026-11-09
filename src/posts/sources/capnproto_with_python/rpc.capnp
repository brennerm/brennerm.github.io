@0x82a37323ad26eddb;

interface Calc {
	sum @0 (a :Int64, b :Int64) -> (result :Int64);
	sub @1 (a :Int64, b :Int64) -> (result :Int64);
	mul @2 (a :Int64, b :Int64) -> (result :Int64);
	div @3 (a :Int64, b :Int64) -> (result :Float64);
}