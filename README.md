jQuery Chaos Modal
==================

A Simple yet extendable jQuery modal script built for use with inline HTML, forms, and images in mind.

There are many other modal plugins out there. The goal of this project is to make one that is dead simple to use and implement, while still allowing for easy customization.

Example Usage
-------------

```
<html>
	<head>
		<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js"></script>
		<script src="jquery-modal.js"></script>
	</head>
	<body>
		<h1>jQuery Chaos Modal Examples</h1>
		<h2>Image modals</h2>
		<a href="test_image.png" class="chaos-modal-link"><img src="test_image.png" /></a>
		<div class="chaos-modal-link">
			<a href="test_image.png"><img src="test_image.png" /></a>
		</div>
		<h2>Html Content Modals</h2>
		<div class="content-wrap">
			<a href="#" class="chaos-modal-link">Click Here to open the modal</a>
			<div class="chaos-modal-box">
				All HTML in here is used as the modal's content.
			</div>
		</div>
		<h2>Html Content ID Modals</h2>
		<div class="content-wrap">
			<a href="#" class="chaos-modal-link" data-chaos-modal-box-id="modal-content-id">Click Here to open the modal</a>
		</div>
		<div class="modal-content-id">
			All HTML in here is used as the modal's content.
		</div>
	</body>
</html>
```

Events Usage
----------------
```html
<html>
	...
	<!-- Put data-preprocess='true' on link of modal you wish to pre-process -->
	<div class='chaos-modal-link' data-preprocess='true'>Link</div>
	...
</html>
```

```javascript
var modal_links = $('.chaos-modal-link');

//Runs on modal link selector before modal is displayed
//Modal variable contains the modal associated with the modal link.
modal_links.on('chaos-modal-preprocess', function( event, modal){

	$(window).on('chaos-modal-preprocess-interrupt', function( event ){
		//Event fires when modal/loading screen is closed.
	});
	
	//If you do not want to pre-process every time, set data-preprocess to false
	//When done pre-processing
	$(this).attr('data-preprocess','false');
	
	//Preprocessing function MUST call openModal when preprocessing complete
	modal.openModal();
});
```

Options Usage
----------------
Attach data attributes to the modal's link as so;

```html
<a class="chaos-modal-link" data-chaosmodal-max-width="710"> Link </a>

```
###Supported options:
####data-chaosmodal-max-width : 
Sets the maximum width of the modal
####data-chaosmodal-close-link : 
Sets whether or not to display default close link


Features
--------

* Stand alone JS file. No additional CSS file required.
* Window resize handling for better performance on responsive websites.
* Vertical scroll position retention to maintain the user's position on the webpage.
* On-the-fly modal HTML generation. No preprocessing loops before the page is shown to the user.
* Content type handling:
	* Image tags
	* Links to images
	* Inline HTML
	* Inline HTML defined by element id
* Iframe lazy loading for iframes in hidden modal content to improve page load.
* Internet Explorer support back to version 8.
* Event support for pre-processing the modal content.
* Options for changing default behavior.

Wishlist
--------

* Options for changing the CSS styles.