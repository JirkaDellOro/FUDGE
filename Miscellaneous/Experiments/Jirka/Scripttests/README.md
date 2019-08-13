Experiments for embeding und using a hierarchy of script-type objects

# Loading
## Demonstrated
### Script tags
Traversing a list of filenames matching according classnames, a script tag is placed for each in the header of the current html document while loading, causing the browser to load the files synchronously. Thereafter, the classes are available in the given namespace.
## Alternatives
### Web Workers
To be evaluated for advantages and tested. Note: Chrome doesn't process WebWorkers locally if not specifically configured (--allow-file-access-from-files)
# Attaching Script-Objects
## Demonstrated
A rudimentary GameObject-class was implemented, that can hold a reference to one script-object. Should later be replaced by a list of references. Using the namespace properties for creating objects from classnames enables recontruction of a scene from e.g. a json file. No references to instances need to be saved.
## Alternatives
?
# Events
## Demonstrated
Script-Class extends the class EventTarget of the DOM. Thus, event listeners can be attached to instances of the class and invoked using dispatchEvent it.
## Alternatives
?
