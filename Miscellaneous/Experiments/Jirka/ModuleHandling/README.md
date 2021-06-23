# TS-Namespaces and ES-Modules
I love namespaces in TypeScript!  

I can spread my project over several files, for example create a file for each class, and compile it all together in one single Javascript file, without the need of imports and extra code for module handling etc. It's nice and easy to create a clean and well structured package, easy to load into the browser using the most simple script tag in HTML.  

However, there is also the need to load packages and libraries at runtime without preloading via HTML. In the past, various module loaders were created for this, like CommonJS, AMD etc. Fiddling around with the TypeScript-configurations for this drove me nuts. With ES6, a standard loader was introduced and is or will be supported by all browsers natively. So it appears to be recommendable to focus on this.  

Unfortunately, ES-Modules don't go well together with the beloved namespaces. There are third party tools and bundlers that address this problem to some extend, but I consider the TypeScript-compiler so powerful, that it should not have that problem in the first place. In this little playground, I'll try to fiddle around to see what can be done. The playground consists of multiple folders each with a similar structure showing basically the same example according to the different chapters in this text. Each shows a folder `Source` containing the code for the library, which is (if possible) compiled into a single file in the folder `Build`. The configuration file for this sits in `Source`. Parallel to these folders there is or are the Test.ts-file(s) containing the program consuming the Library, the configuration file to compile it and the HTML-file to load everything at runtime. Additional files may be found as needed.  

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
- Insert a simple script-tag with the path to file as `src` attribute in the HTML-file.
- Loading the HTML-file into the browser causes the namespace-object to appear as a property in the scope of globalThis, the window respectively. It is considered 'cluttering', but makes things easy. This is what the first lines of output of `console.log(window)` look like:
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
- This, however, will deter the use of namespaces. Also, in order to get type support, the .d.ts-file of the module needs to show all the export statements.

### Workaround  
- At the end of the compiled library-file, insert the following
  ```javascript
  globalThis.Library = Library;
  ```
- This recreates the clutter by adding a reference to the library in the global scope.
- Since module loading happens asynchronously, the consumption must not happen before the module is fully loaded and referenced. A `load` handler is used in the script to wait for the HTML to be fully loaded and parsed, and the attribute `defer` delays execution of the script in the first place. At this point of time, it appears that both mechanisms are necessary.
- In the HTML-file, the script-tags now look like this:
  ```html
    <script type="module" src="./Build/Library.js"></script>
    <script src="Test.js" defer></script>
  ```
- For testing, I added a file `Test2.ts` that compiles together with `Test.ts` to `Test.js`.

## Pure module
Third party modules usually come in a different form in order to be imported by the module loader. From what I have so far, I'd like to dive deeper into that format. In order to import the module from the file, the d.ts-file needs to be adjusted.
- Write `import {Library} from "./Build/Library";` as first line in Test.ts. 
- TypeScript tells that Library is not a module any more.
- Write `export` in front of every namespace declaration, class, interface etc. in the d.ts-file
- Now TypeScript excepts Library as a module, but Test is now a module also, due to the use of the import {...}
- Thus, at design time, namespaces is ignored and types will not automatically cross file borders
- At runtime, `define` is required, since Test has been compiled with `system`
- So switch to `ESNext` in the configuration, which requires disabling compilation into one outfile
- In the sourcecode, strip away the namespaces and add the import to Test2.ts as well
- Test2.ts also doesn't the the abbreviation lib, since that was defined in Test.ts, so it needs to be replaced with Library
- Test on the other hand, doesn't know the TestClass from Test2, so it needs to import it from Test2 using `import {TestClass} from "./Test2.js"`
- At runtime, the browser complains that it can't use the import statement outside of a module. In the HTML-file, change the type-attribute of the script-tag loading Test to `module` and dismiss defer.
- So now it should be running. I lost the namespaces and now have to explicitly import everything in every file that is used there.