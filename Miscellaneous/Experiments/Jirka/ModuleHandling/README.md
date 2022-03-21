# TS-Namespaces and ES-Modules
<small>Jirka Dell'Oro-Friedl, June 2021</small>  

I love TypeScript and I love namespaces in TypeScript!  

I can spread my project over several files, for example create a file for each class, and compile it all together in one single Javascript file, without the need of imports and extra code for module handling etc. It's nice and easy to create a clean and well structured package, easy to load into the browser using the most simple script tag in HTML.  

However, there is also the need to load packages and libraries at runtime without preloading via HTML. In the past, various module loaders were created for this, like CommonJS, AMD etc. Fiddling around with the TypeScript-configurations for this drove me nuts. With ES6, a standard loader was introduced and is or will be supported by all browsers natively. So it appears to be recommendable to focus on this.  

Unfortunately, ES-Modules appear not to go well together with the beloved namespaces. There are third party tools and bundlers that address this problem to some extend, but I consider the TypeScript-compiler so powerful, that it should not have that problem in the first place. In this little playground, I'll try to fiddle around to see what can be done. 
1. I'll create a little library with some code structures to test and a program to consume this library. This will be done on the basis of simple scripts using namespaces. So there is a folder `Library` containing the code for the library, and a folder `Consumer` containing the code for the program using the library. The code is spread over multiple files and comprises two corresponding namespaces. Both folders contain the configurations to compile to corresponding Javascript-, map- and declaration files in the folder `Build`.
2. From that base, I'll convert the result to modules to see what is necessary for this and for making it work. Only the js-files are used and altered in order to see what TypeScript would have to do, not what it currently does.
3. Then I'll try to mix both approaches having the library still as a module, built with namespaces, but the consuming code as a simple script using namespaces. Again, I'll work on the Javascript-level.

> At this point of time, the changes are minimal to get these tests working. It's actually almost shocking considering the many people struggling with it and projects merely failing because of it. And it seems as if it should to be possible to have the TypeScript-compiler taking care of this, thus bringing together the best of the module- and the namespace-world directly out of the box. However, this process has not been tested against various use-cases, so comments, ideas, improvements and any help is greatly appreciated. Maybe a proposal to the TypeScript-developers evolves from this...

## 1. Pure namespaces
See example [PureNamespace](PureNamespace)  

- Don't use import {} or import() in the namespace files. Using `import someVariableName = someNamespaceName;` is okay though, since it merely just defines an alias for an object in global scope.
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

## 2. Pure module
Making the program being based on ES-modules via the TypeScript compiler is a desaster. Compiling into one file is only possible with `system` or `amd`, so switching to any other `module`-directive emits one js-file for each ts-file. It would be necessary to use a bundler to pack them back into one file. Also, using imports in the TypeScript code deters the use of namespaces. TypeScript tells that the namespace is declared but never used and won't find declarations in other files, though appearently in the same namespace. It's then necessary in every file to explicitely import everything used in that file. While using modules this way reduces clutter in the global scope at runtime, it appears to me that it adds a lot of clutter, additional workload and a bloated toolchain at design time.  

---

But astonishingly, it seems to be quite easy to convert the compiled code from the PureNamespace-example to modules:  
- In the compiled javascript file of the library, simply insert one `export ` in front of the declaration of the namespace-object
  ```javascript
  "use strict";
  var Library;
  ```
  ```javascript
  "use strict";
  export var Library;
  ```
- That alone makes the object a module which loads differently. The browser console shows `SyntaxError: Unexpected token 'export'`
- You could add the attribute `type="module"` to the script tag in the HTML-file, which would make the module load properly. But the consuming script won't have access to it anyway, since it's managed by the module loader now.
- So delete the script tag loading the library in the HTML-file.  
- Instead, at the start of Consumer.js, add the following to make this script load the library.
  ```typescript
  import {Library} from "./Library.js";
  ``` 
- By using the import-statement, Consumer.js became a module itself. So here the script-tag needs the type-attribute set to "module" now.  

---

## 3. Mix module and namespace
See example [MixModuleNamespace](MixModuleNamespace)  
- First, switch back Consumer.js to the output from 1. or just delete the line added in 2.   
- The browser now complains that Library is not defined, since it was not loaded anywhere.
- So load the library with a script-tag in the HTML-file and `type="module"` before loading Consumer.js. Also remove the type-attribute from the script tag loading the Consumer-script, since it is not a module (any more).
- You see that the library loads and processes the code given in ClassA and ClassB, but now the Consumer-script complains about the non-existent library, as it is managed by the module-loader.
- Also, since module-loading happens asynchronously, the message from the consumer might appear before the message from the library. Add `defer` to the script-tag in HTML to defer loading Consumer. The message now should appear after.
- In order for the consumer to know the library, it needs a reference to it in the global scope, just as in 1. So adjust the first lines in Library.js to   
  ```javascript
  export var Library = {};
  globalThis.Library = Library;
  ```
  In addition to storing the reference now in globalThis with the same name, this first creates an empty object which would happen later anyway.
- If you recompile the library from TypeScript, you could also insert `globalThis.Library = Library;` somewhere in its namespace in the ts-files and omit the creation of the empty object. Remember, that the `export` still needs to be added to the js-file.
- In the HTML-file, the script-tags now look like this:
  ```html
    <script type="module" src="./Build/Library.js"></script>
    <script src="Consumer.js" defer></script>
  ```