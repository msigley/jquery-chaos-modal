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
		<a href="test_image.png" class="chaos-modal-link" title="caption"><img src="test_image.png" /></a>
		<div class="chaos-modal-link">
			<a href="test_image.png" title="caption"><img src="test_image.png" /></a>
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
		<div id="modal-content-id">
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
<a class="chaos-modal-link" data-chaos-modal-max-width="710"> Link </a>

```

### Supported options:
#### data-chaos-modal-max-width : 
Sets the maximum width of the modal in pixels. Default 960.
#### data-chaos-modal-css-class : 
Sets the css class attribute on the current modal div. Default false.
#### data-chaos-modal-close-link : 
Sets whether or not to display the default close link. Default true.
#### data-chaos-modal-print-link : 
Sets whether or not to display the print link. Default false.
#### data-chaos-modal-click-passthrough : 
Sets whether or not to pass the value of the href attribute on the open modal link to a window.open call. This allows the model to be used for download prerolls. Default false.
#### data-chaos-modal-iframe-add-autoplay :
Sets whether or not to add 'autoplay=1' to the query string in the src and 'allow="autoplay"' of an iframe in the modals content if the modal contains a single iframe. This is useful for video modals especially youtube videos. Default true.
#### data-chaos-modal-caption :
Sets HTML content to use as a caption for the modal content. Default none, for image modals the value of the title attribute on the full image link.

Galleries
----------------
Modals can be linked into galleries with next/prev buttons for traversing the gallery by adding the ```data-chaos-modal-gallery``` attribute to container elements that contain modal links.
```html
<div data-chaos-modal-gallery="gallery1">
	Modal links in here are part of gallery1.
</div>
<div data-chaos-modal-gallery="gallery2">
	Modal links in here are part of gallery2.
</div>
<div data-chaos-modal-gallery="gallery1">
	Modal links in here are also part of gallery1.
</div>
```

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
* Event support for pre-processing the modal content.
* Options for changing default behavior.
