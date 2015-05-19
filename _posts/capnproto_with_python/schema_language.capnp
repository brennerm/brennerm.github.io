@0x80319128e80b6bc3;

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