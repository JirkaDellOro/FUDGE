
[Typedoc](http://typedoc.org/) was used to generate the FUDGE documentation.
And can be installed with the following command.
   
    npm install typedoc -g

In addition, [typedoc-plugin-merge-modules](https://www.npmjs.com/package/typedoc-plugin-merge-modules) must be installed in order to use typedoc version 0.20. to obtain a meaningful data structure for the documentation.

    npm install typedoc-plugin-merge-modules -g

In order to generate a new documentation, a terminal must be opened in a `source folder`, the documentation can be generated there with the command 

    typedoc

`source folder:` 
* "FUDGE/Core/Source"
* "FUDGE/Aid/Source" 
* "FUDGE/UserInterface/Source"

