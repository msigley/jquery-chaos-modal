/*
 * jQuery Chaos Modal
 * By Matthew Sigley
 * Based on concept work by Kevin Liew - http://www.queness.com/post/77/simple-jquery-modal-window-tutorial
 * Version 1.10.1
 */

(function( $ ) {

	//Bowser IE/Edge version detection
	var getIEEdgeVersion = function() {
		var ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
		if( /msie|trident/i.test(ua) ) {
			var match = ua.match(/(?:msie |rv:)(\d+(\.\d+)?)/i);
			return (match && match.length > 1 && match[1]) || '';
		} else if( /chrome.+? edge/i.test(ua) ) {
			var match = ua.match(/edge\/(\d+(\.\d+)?)/i);
			return (match && match.length > 1 && match[1]) || '';
		}
		return '';
	}

	var windowElement = $(window),
		IEEdgeVersion = '';
	
	if( bowser.msie )
		IEEdgeVersion = bowser.version;
	else if( bowser.msedge )
		IEEdgeVersion = bowser.version;
	else
		IEEdgeVersion = getIEEdgeVersion();

	//Fullscreen API polyfill
	$.chaosModalExitFullscreen = function() {
		if( 'fullscreenEnabled' in document )
			document.exitFullscreen();
		else if( 'webkitFullscreenEnabled' in document )
			document.webkitExitFullscreen();
		else if( 'mozFullScreenEnabled' in document )
			document.mozCancelFullScreen();
		else if( 'msExitFullscreen' in document )
			document.msExitFullscreen();
	};
	
	//Detects images that are not visible
	$.chaosModalIsVisible = function( element ) {
		if( element.offsetParent === null )
			return false;
		// This provides support for IE < 11
		if( IEEdgeVersion < 11 ) {
			var computedDisplay = '';
			if( typeof getComputedStyle != 'undefined' )
				computedDisplay = window.getComputedStyle(element).display;
			else if( typeof element.currentStyle != 'undefined' )
				computedDisplay = element.currentStyle['display'];
			if( 'none' == computedDisplay || 'fixed' == computedDisplay || 'absolute' == computedDisplay )
				return false;
		}
		return true;
	};


	//Global variables for generating modal box clones
	$.chaosModalLoading = null;
	$.modalMask = null;
	$.chaosModalCurrent = null;
	$.chaosModalMaxWidth = 0;
	$.chaosModalIndex = 0;
	$.chaosModalImagesLoaded = false;
	$.chaosModalIframesLoaded = false;
	$.chaosModalClickTimer = false;
	$.chaosModalResizeTimer = null;
	$.chaosModalPrintCSSElements = null;

	$.fn.openModal = function( options ) {
		//Exit any fullscreen elements
		$.chaosModalExitFullscreen();

		//If modal already open, return
		if($.chaosModalCurrent != null){
			return;
		}

		//Clone modal content
		var clone = this.clone(true),
			bodyElement = $('body'),
			htmlElement = $('html'),
			documentElement = $(document),
			windowElement = $(window),
			closeLink = options['closeLink'],
			printLink = options['printLink'],
			alwaysAtTop = options['alwaysAtTop'];
		//Update $.chaosModalMaxWidth
		$.chaosModalMaxWidth = options['maxWidth'];
		
		//Update $.chaosModalCurrent
		$.chaosModalCurrent = clone;

		var printIframeContent = clone.html();

		clone.attr({id: 'chaos-current-modal'});
		
		//Write print link if none exists
		if(clone.find('.print-link').length == 0 && printLink) {
			clone.prepend('<a class="print-link">Print</a>');
			clone.children('.print-link').css({'float': 'right', 'margin': '5px'});
		}
		
		//Write close link if none exists
		if(clone.find('.close-link').length == 0 && closeLink) {
			clone.prepend('<a class="close-link">Close</a>');
			clone.children('.close-link').css({'float': 'right', 'margin': '5px'});
		}
		
		//Set the popup window css
		clone.css({'display': 'block', 'position': 'absolute', 'background': '#fff', 'z-index': '9002', 'left': '-10000px', 'margin': '0', 'padding': '0'});
		
		//Lazy Load iFrame content
		function iframeDataSrc() {
			var thisElement = $(this),
				iframeDataSrc = thisElement.data('src');
			if( iframeDataSrc ) {
				if( options.iframeAddAutoplay ) {
					var queryStrPos = iframeDataSrc.indexOf( '?' );
					if( queryStrPos == -1 ) {
						iframeDataSrc += '?';
					} else if( queryStrPos != iframeDataSrc.length - 1 ) {
						iframeDataSrc += '&amp;';
					}
					iframeDataSrc += 'autoplay=1';
					thisElement.attr('allow', 'autoplay');
				}
				thisElement.attr('src', iframeDataSrc).attr('data-src', '');
			}
		}
		var cloneIframes = clone.find('iframe[src=""]');
		if( cloneIframes.length > 1 )
			options.iframeAddAutoplay = false;
		cloneIframes.each(iframeDataSrc);
		
		clone.prependTo(bodyElement);
		
		//Write hidden iframe for print support if none exists
		if(printLink) {
			if( !$.chaosModalPrintCSSElements )
				$.chaosModalPrintCSSElements = $(document.head).find('link[rel="stylesheet"]');
			//Iframe needs to be visible and have a decent width and height to prevent the browser from detecting it as hidden.
			var printIframe = $('<iframe class="print-iframe" width="100" height="100" style="position: absolute; left: -20000px; top: 0;"></iframe>');
				clone.append(printIframe);
			var printIframeDoc = printIframe.get(0).contentDocument;
			printIframeDoc.open();
			printIframeDoc.write('<!DOCTYPE html>');
			printIframeDoc.write('<html><head>');
			$.chaosModalPrintCSSElements.each( function(){
				printIframeDoc.write(this.outerHTML);
			});
			printIframeDoc.write('</head><body>');
			printIframeDoc.write(printIframeContent);
			printIframeDoc.write('</body></html>');
			printIframeDoc.close();
		}

		var showModal = function() {
			//Lock popup window width
			if(clone.width() > $.chaosModalMaxWidth){
				clone.width($.chaosModalMaxWidth);
			} else {
				clone.width(clone.width());
			}
			
			//Fix content widths
			clone.css('max-width', '92%');
			clone.find('img').css('max-width', '100%'); 
			
			clone.hide();
			
			//Calculate the modal mask size and popup window position
			clone.resizeModal( alwaysAtTop );
			
			//Bind the print link events if any close links exist
			if(clone.find('.print-link').length > 0) {
				clone.find('.print-link').bind('click', printCurrentModal);
			}
			
			//Bind the close link events if any close links exist
			if(clone.find('.close-link').length > 0) {
				clone.find('.close-link').bind('click', closeCurrentModal);
			}
			
			if( options.clickPassthrough ) {
				//Bind the fallback link events if any fallback links exist
				clone.find('.fallback-link').bind('click', function() {
					clearTimeout( $.chaosModalClickTimer );
				});
			}

			//transition effect
			$.modalMask.stop();
			clone.show(0, function() {
				//Bind the window resize event
				clone.resizeModal( alwaysAtTop );
				windowElement.bind('resize', {'alwaysAtTop': alwaysAtTop}, resizeCurrentModalEvent);
				$.fn.closeLoading();

				if( options.clickPassthrough ) {
					$.chaosModalClickTimer = setTimeout( function() {
						//IE Fix
						clearTimeout( $.chaosModalClickTimer );
						
						if( !window.open( options.clickPassthrough, options.clickTarget ) ) {
							//Browser blocked window.open call (popup blocker)
							if( confirm( "Displaying New Document\n\nUse Save As... to download, then click back to return to this page." ) ) { 
								location.href = options.clickPassthrough; 
							}
						}
					}, 3000 );
				}
			});
		};

		var isImageNotLoaded = function( index, img ) {
			if (!$.chaosModalIsVisible(img))
				return false;
			if ( (img.complete && img.getAttribute('src') != "") 
				&& (typeof img.naturalWidth == "undefined" || img.naturalWidth != 0) )
				return false;
			return true;
		};
		
		var isIframeNotLoaded = function( index, iframe ) {
			if( IEEdgeVersion ) //Ignore Iframes in IE due to security restrictions.
				return false;
			if (!$.chaosModalIsVisible(iframe))
				return false;
			var iframeDocument = iframe.contentDocument || iframe.contentWindow.document
			if ('complete' == iframeDocument.readyState)
				return false;
			return true;
		};

		//Show modal after all images and iframes have loaded
		var images = clone.find('img').filter(isImageNotLoaded),
			iframes = clone.find('iframe').filter(isIframeNotLoaded);
		$.imagesToLoad = images.length;
		$.iframesToLoad = iframes.length;

		if(!$.imagesToLoad && !$.iframesToLoad)
			showModal();
		else {
			images.on('load', function() {
				$.imagesToLoad -= 1;
				if(!$.imagesToLoad && !$.iframesToLoad)
					showModal();
			});
			iframes.on('load', function() {
				$.iframesToLoad -= 1;
				if(!$.imagesToLoad && !$.iframesToLoad)
					showModal();
			});
		}
		
		clone.show();
		
		return this;
	};

	$.fn.closeModal = function() {
		//Unbind the window resize event
		clearTimeout($.chaosModalResizeTimer);
		$(window).unbind('resize', resizeCurrentModalEvent);
		//Clear $.chaosModalCurrent
		$.chaosModalCurrent = null;
		
		//Unbind the close link events if any close links exist
		if(this.find('.close-link').length > 0) {
			this.find('.close-link').unbind('click');
		}
		
		//Remove the popup window
		this.hide().remove();
		
		//Remove the mask div
		$('#chaos-modal-mask').hide().remove();
		$.fn.closeLoading();
		
		return this;
	};
	
	$.fn.resizeModal = function( alwaysAtTop ) {
		var documentElement = $(document),
			windowElement = $(window),
			htmlElement = $('html'),
			maskHeight = documentElement.height(), //Get the screen height and width
			maskWidth = htmlElement.width(),
			winH = windowElement.height(), //Get the window height and width
			winW = windowElement.width();
		
		//Resize iframes (if jquery.iframe-wrapper.js is present)
		if($.isFunction( this.resizeIframes )) { this.resizeIframes(); }

		//Check for invalid mask dimensions
		if(maskHeight < this.height()) { maskHeight = this.height(); }
		if(maskWidth < winW) { maskWidth = winW; }

		//Set height and width to mask to fill up the whole screen
		$('#chaos-modal-mask').css({'width':maskWidth,'height':maskHeight});

		//Calculate popup window position
		var modalTop = winH/2-this.height()/2,
			modalLeft = winW/2-this.width()/2;

		//Check for invalid window positions
		if (modalTop < 0) { modalTop = 0; }
		if (modalLeft < 0) { modalLeft = 0; }

		if( alwaysAtTop ) { 
			windowElement.scrollTop(0); //Scroll to top of window
		} else {
			modalTop += windowElement.scrollTop();
			var spaceFromBottom = documentElement.height() - (modalTop + this.height());
			if( spaceFromBottom < 0 && modalTop + spaceFromBottom >= 0)
				modalTop += spaceFromBottom;
		}
		windowElement.scrollLeft(0);

		//Set the popup window to center
		this.css({'top': modalTop, 'left': modalLeft});

		return this;
	};
	
	$.fn.printModal = function() {
		var printIframeWindow = this.find('.print-iframe').get(0).contentWindow;
		printIframeWindow.focus();
		printIframeWindow.print();
	};
	
	function resizeCurrentModalEvent(e) {
		clearTimeout($.chaosModalResizeTimer);

		if( $.chaosModalCurrent ) {}
		else { return; }
		
		var alwaysAtTop = false;
		if( e.data.alwaysAtTop ) { alwaysAtTop = e.data.alwaysAtTop; }
		$.chaosModalResizeTimer = setTimeout(resizeCurrentModal, 16, alwaysAtTop);
		// -----------------------^^
		// Note: 15.6 milliseconds is lowest "safe"
		// duration for setTimeout and setInterval.
		//
		// http://www.nczonline.net/blog/2011/12/14/timer-resolution-in-browsers
		$.chaosModalCurrent.resizeModal( alwaysAtTop );
	}

	function resizeCurrentModal(alwaysAtTop) {
		//IE Fix
		clearTimeout($.chaosModalResizeTimer);

		$.chaosModalCurrent.resizeModal( alwaysAtTop );
	}

	function closeCurrentModal(e) {
		e.preventDefault(); //Prevents browser from following links
		//Velocity control
		if(Date.now() - $.openTime < 500){
			return false;
		}

		clearTimeout( $.chaosModalClickTimer );
		$(document).off('.chaosmodal');
		if($.chaosModalCurrent != null)
			$.chaosModalCurrent.closeModal();
		else{
			$(window).trigger('chaos-modal-preprocess-interrupt');
			$('#chaos-modal-mask').hide().remove();
			$.fn.closeLoading();
		}
		$.modalMask = null;
	}
	
	function printCurrentModal(e) {
		e.preventDefault(); //Prevents browser from following links
		$.chaosModalCurrent.printModal();
	}

	function closeOnESC(e) {
		if( e.which == 27 ) {
			closeCurrentModal(e);
		}
	}

	//Function shows the loading screen (modalMask and loading gif)
	$.fn.showLoading = function(){
		//Sets open time for velocity control
		$.openTime = Date.now();
		if($.modalMask != null){
			return;
		}
		var bodyElement = $('body'),
			windowElement = $(window),
			winH = windowElement.height(), //Get the window height and width
			winW = windowElement.width();
			maskClose = true;
		//Create mask div
		$.modalMask = $('<div id="chaos-modal-mask" class="chaos-modal-mask"></div>');
		$.modalMask.css({'position': 'absolute', 'z-index': '9000', 'background-color': 'rgba(0, 0, 0, 0.8)', 'display': 'none', 'top': '0', 'left': '0'});
		
		$.modalMask.prependTo(bodyElement);

		//Mask transition effect
		$.modalMask.show(0); //Transparency is applied with css background color

		var documentElement = $(document),
			windowElement = $(window),
			htmlElement = $('html'),
			maskHeight = documentElement.height(), //Get the screen height and width
			maskWidth = htmlElement.width();
		
		//Bind close event to mask click and when the ESC key is pressed
		if(maskClose) {
			$.modalMask.on('click', closeCurrentModal);
			documentElement.on('keyup.chaosmodal', closeOnESC);
		}

		//Check for invalid mask dimensions
		if(maskHeight < this.height()) { maskHeight = this.height(); }
		if(maskWidth < winW) { maskWidth = winW; }

		//Set height and width to mask to fill up the whole screen
		$('#chaos-modal-mask').css({'width':maskWidth,'height':maskHeight});

		//Sets positioning for the loading bar
		$('body').append('<div id="modal-loading" style="position: fixed; z-index: 9001; color: #fff;">Loading</div>');
		
		//Center Loading
		posx = (winW / 2) - parseInt($('#modal-loading').css('width')) / 2;
		posy = (winH / 2) - parseInt($('#modal-loading').css('height')) / 2;
		
		$.chaosModalLoading = $('#modal-loading');
		$.chaosModalLoading.css('top', posy);
		$.chaosModalLoading.css('left', posx);
		var alwaysAtTop = true;
		windowElement.bind('resize', {'alwaysAtTop': alwaysAtTop}, resizeLoading);	
	}

	function resizeLoading(){
		var documentElement = $(document),
			windowElement = $(window),
			htmlElement = $('html'),
			maskHeight = documentElement.height(), //Get the screen height and width
			maskWidth = htmlElement.width(),
			winH = windowElement.height(), //Get the window height and width
			winW = windowElement.width();

		$('#chaos-modal-mask').css({'width':maskWidth,'height':maskHeight});

		//Center Loading
		posx = (winW / 2) - parseInt($('#modal-loading').css('width')) / 2;
		posy = (winH / 2) - parseInt($('#modal-loading').css('height')) / 2;
		
		$.chaosModalLoading = $('#modal-loading');
		$.chaosModalLoading.css('top', posy);
		$.chaosModalLoading.css('left', posx);
	}

	//Closes the loading bar
	$.fn.closeLoading = function(){
		$.chaosModalLoading.remove();
	}
	
	$.processModalLink = function(e) {
		var thisElement = $(this);
	
		e.preventDefault(); //Prevents browser from following links
		thisElement.off('click', $.processModalLink); //Remove content processing event. It should only be run once per link.
		
		var modalContentId = thisElement.data('chaos-modal-box-id'),
			modalContent = false,
			modalContentClone = false,
			imageRegex = /\.(jpeg|jpg|gif|png|bmp|wbmp)$/i,
			imageUrl = false,
			imageCaption = false;
		
		if( modalContentId )
			modalContent = $('#'+modalContentId).first();
		else
			modalContent = thisElement.parent().find('.chaos-modal-box').first();
		
		//Check for pre-defined modal content
		if( modalContent.length ) {
			modalContentClone = $('<div></div>').css({'padding': '20px'});
			modalContent.clone(true).css({'display': 'block'}).appendTo(modalContentClone);
			modalContentClone = $('<div></div>').css({'background': '#fff'}).append(modalContentClone);
		} else {
			if( imageRegex.test(thisElement.attr('href')) ) {
				//Use link href as image url
				imageUrl = thisElement.attr('href');
				//Use link title as image caption
				imageCaption = thisElement.attr('title');
			} else {
				//Check for single image inside of modal link
				var modalImage = thisElement.find('img');
				if( modalImage.length == 1 ) {
					if( imageRegex.test(modalImage.attr('src')) ) {
						//Use image src as image url
						imageUrl = modalImage.attr('src');
						//Use image title as image caption
						imageCaption = modalImage.attr('title');
					}
				}
			}
			
			if( imageUrl ) {
				modalContentClone = $('<div></div>').css({'padding': '20px'});
				$('<img src="'+imageUrl+'" />').css({'display': 'block'}).appendTo(modalContentClone);
				modalContentClone = $('<div></div>').css({'background': '#fff'}).append(modalContentClone);
			}

			if( imageCaption ) {
				imageCaption = (imageCaption + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2');
			}
		}

		//Setup openModal event if content is available
		if( modalContentClone ) {
			//Remove original content element to avoid id conflicts
			modalContent.remove();
			//Assign unique ids to each modal link and content
			thisElement.data('chaos-modal-href', thisElement.attr('href'));
			thisElement.data('chaos-modal-target', thisElement.attr('target'));
			thisElement.attr({
				href: '#',
				target: null,
				id: 'chaos-modal-link-'+$.chaosModalIndex
			});
			modalContentClone.attr({
				id: 'chaos-modal-box-'+$.chaosModalIndex
			});
			modalContentClone.hide();
			
			//Append hidden modal content to body
			modalContentClone.appendTo('body');
			thisElement.click(function() {
				$.fn.showLoading();
				
				//Get options from modal-link
				var options = { maxWidth : 960,
					closeLink: true,
					printLink: false, 
					alwaysAtTop: false, 
					preprocessing: false,
					clickPassthrough: false,
					iframeAddAutoplay: true,
					caption: imageCaption };
				
				$.each(options, function(key, value){
					var optionData = thisElement.data('chaos-modal-'+key);
					if(typeof(optionData)!== 'undefined'){
						if(key == 'maxWidth'){
							options[key] = parseInt(optionData);
						} else {
							options[key] = optionData;
						}
					}
				});

				if( options.caption ) {
					var modalCaption = $('<div>'+options.caption+'</div>').css({
						'display': 'table-caption', 
						'caption-side': 'bottom', 
						'padding-top': 0,
						'padding-right': '20px',
						'padding-bottom': '20px',
						'padding-left': '20px'
					});
					modalContentClone.children().first().css('display', 'table').append(modalCaption);
					console.log(modalContentClone.clone());
				}

				if( options.clickPassthrough ) {
					options.clickPassthrough = thisElement.data('chaos-modal-href');
					options.clickTarget = thisElement.data('chaos-modal-target');
					if( !options.clickTarget )
						options.clickTarget = '_self';
				}

				preprocess = thisElement.attr('data-preprocess');
				var thisId = $(this).attr('id'),
					indexRegex = /chaos-modal-link-(\d+)/i,
					chaosModalIndex = thisId.match(indexRegex);
				if( chaosModalIndex[1] ) {
					var modalBox = $('#chaos-modal-box-'+chaosModalIndex[1]);
					if( modalBox.length == 1 && preprocess != 'true' ) {
						modalBox.openModal(options);
					} else if (modalBox.length == 1 && preprocess == 'true'){
						thisElement.trigger("chaos-modal-preprocess", [ modalBox, options ]);
					}
				}
				return false;
			});
			thisElement.click();
			
			$.chaosModalIndex++;
		}
		return false;
	}
})( jQuery );

/* Create modal box clones and click events */
jQuery(document).ready(function($){
	//Fix css classes
	$('.chaos-modal-link').not('a').each( function() {
		var thisElement = $(this),
			childElements = thisElement.children();
		thisElement.removeClass('chaos-modal-link');
		if( childElements.not('a').length )
			return;
		if( childElements.length == 1 )
			childElements.addClass('chaos-modal-link');
	});
	
	//Attach click event to links
	$('a.chaos-modal-link').on('click', $.processModalLink);
	
	//Lazy Load iFrame content
	function iframeDataSrc() {
		var thisElement = $(this),
			iframeSrc = thisElement.attr('src');
		if( iframeSrc )
			thisElement.attr('data-src', iframeSrc).attr('src', '');
	}
	$('.chaos-modal-box:hidden iframe').each(iframeDataSrc);
	$('.chaos-modal-link').each(function() {
		var modalContentId = $(this).data('chaos-modal-box-id');
		if( modalContentId )
			$('#'+modalContentId+':hidden iframe').each(iframeDataSrc);
	});
	
	//Polyfill for Date.now()
	//This provides support for IE < 9
	if(!Date.now){
		Date.now = function now(){
			return new Date().getTime();
		};
	}
});
