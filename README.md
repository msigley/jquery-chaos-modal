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
		<script src="jquery-modal.js" />
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
	</body>
</html>
```