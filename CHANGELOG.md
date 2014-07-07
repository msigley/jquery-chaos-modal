Change Log
==========

Recent changes
--------------
* Moved Change Log to its own file to decrease the file size (1.3.2)
* Fixed closeOnESC not passing its event to closeCurrentModal (1.3.1)
* Fixed container styles on custom html (1.3.1)
* Fixed improper class name on custom html containers (1.3.1)
* Added alwaysAtTop parameter to openModal and resizeModal function (1.3.0)
* Implemented vertical positioning from current scroll position (1.3.0)
* Fixed browser following the href of print and close links (1.3.0)
* Added image prerendering in modal content (1.2.0)
* Updated and fixed resizeModal function to work based off of the html element's width (1.2.0)
* Added image in link href support (1.2.0)
* Reworked automatic modal binding to clone content on-the-fly (1.2.0)
* Added maxWidth parameter to openModal function (1.1.0)
* Added automatic modal binding to .chaos-modal-link elements (1.1.0)
* Added option to close the modal when the mask is clicked or the ESC key is pressed (1.1.0)
* Reworked references to optimize javascript caching (1.1.0)
* Clones content container and appends to body for absolute positioning relative to body
* Added max width variable so you can keep modal content inside your wrapper div's width

Things left to do
-----------------
* Add padding option to openModal
* Jquery animation queue integration
* Function parameters for changing the default CSS styles
* Change namespacing of functions to work similar to $('#example').modal("open")
* Add position parameter to openModal function