Change Log
==========

Recent changes
--------------
* Converted all global variables to jQuery properties (1.3.8)
* Improved Iframe content handling (1.3.8)
* Iframes inside of modal box content are now lazy loaded if the modal box content is hidden on the page (1.3.8)
* Improved Image width handling (1.3.7)
* Fixed bug related to undefined data attributes (1.3.7)
* Added defining of modal content by id in data attribute (1.3.6)
* Corrected clone content handling to better respect element ids (1.3.6)
* Corrected typo in JSON manifest (1.3.5)
* Added manifest file for release on plugins.jquery.com (1.3.4)
* Added handling of link class applied to a link's direct container (1.3.3)
* Provided a minifed version of the script (1.3.2)
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
* Function parameters for changing the default CSS styles
	* Mask color
	* Mask opacity
	* Default padding
	* Content background
* Jquery animation queue integration
* Change namespacing of functions to work similar to $('#example').modal("open")
* Add position parameter to openModal function