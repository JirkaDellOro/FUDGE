# TS-Namespaces and ES-Modules
I love namespaces in TypeScript!  

I can spread my project over several files, for example create a file for each class, and compile it all together in one single Javascript file, without the need of imports and extra code for module handling etc. It's nice and easy to create a clean and well structured package, easy to load into the browser using the most simple script tag in HTML.  

However, there is also the need to load packages and libraries at runtime without preloading via HTML. In the past, various module loaders were created for this, like CommonJS, AMD etc. Fiddling around with the TypeScript-configurations for this drove me nuts. With ES6, a standard loader was introduced and is or will be supported by all browsers natively. So it appears to be recommendable to focus on this.  

Unfortunately, ES-Modules don't go well together with the beloved namespaces. In this little playground, I'll try to make peace between the two. It consists of a folder `Source` containing the code for the library, which is compiled into a single file in the folder `Build`. The configuration file for this sits in `Source`. Parallel to these folders there is the Test.ts-file which contains the program consuming the Library, the configuration file to compile it and the HTML-file to load everything at runtime.  

## Pure namespaces
See example [PureNamespace](PureNamespace)  
- Don't use import {} or import() in the namespace files, using `import someVariableName = someNamespaceName;` is okay though.
- Adjust tsconfig to "target": "ESNext", "module": "system", "declaration": true and define an "outFile".
- Compile the files belonging to the namespace into one single file.
- The namespace became a simple javascript-object, the functions successively adding everything that was defined in the different files to it.
  ```typescript
  // TypeScript
  namespace Library {
    ...
  }
  ```
  ```javascript
  // Javascript
  var Library;
  (function (Library) {
    ...
  }
  ```
- Insert a simple script-tag with the path to file as `src` attribute in the HTML-File.
- Loading the HTML-File into the browser causes the namespace-object to appear as a property in the scope of globalThis, the window respectively. It is considered 'cluttering', but makes things easy. This is what the first lines of output of `console.log(window)` look like:
```plaintext
- Window {window: Window, self: Window, document:  …}
  - Library:
    - ENUM: {INTERFACE: "Interface", SUPERCLASS: "SuperClass", SUBCLASS: "SubClass"}
    - SubClass: class SubClass
    - SuperClass: class SuperClass
    - getGreet: ƒ getGreet(_name)
    - __proto__: Object
```
---
- To use the Library now, load another script via the script tag.
- This may have also been compiled using namespace and multiple source files.
- Since the Library is in the global scope, the consuming script has instant access to it just by using the name given to the original namespace, here `Library`.
- It may be abbreviated using an alias like `lib` with
  ```typescript
  import lib = Library;
  ```
- In order to get type checking at design time, make sure to reference the d.ts-file either in the configuration file using `types` or as triple-slash directive in the code.  


## Create and use a module with namespaces 
See example [ModuleFromNamespace](ModuleFromNamespace)  

- In the compiled javascript file of the library, simply insert one `export` in front of the declaration of the namespace-object
  ```javascript
  "use strict";
  var Library;
  ```
  ```javascript
  "use strict";
  export var Library;
  ```
- That alone makes the object a module which loads differently.
- In the HTML-file add `type="module"` to the script-tag.
- This is when things diverge. The module will load fine, but not into the global scope. It's managed by the module loader now. The consuming script won't have access to it, unless it imports the module itself using a statement like
  ```typescript
  import {Library} from "./Build/Library.js";
  ```
- This, however, will deter the use of namespaces ...

### Workaround
- 