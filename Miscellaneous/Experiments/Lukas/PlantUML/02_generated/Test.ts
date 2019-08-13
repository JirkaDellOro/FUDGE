namespace NameOne {
	export namespace SubNameOne{
		export class A {
			doSomething() { console.log("this is NameOne A"); }
		}
	}
}

namespace NameTwo {
	class A {
		thisIsSomething() { console.log("this is NameTwo A"); }
	}
	class B extends NameOne.SubNameOne.A {
		doSomethingElse() { console.log("this is NameTwo B"); }
	}
	class C extends A {
		somethingSomething() {console.log("this is NameTwo C");}
	}
}