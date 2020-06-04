/*
 * jQuery Chaos Modal
 * By Matthew Sigley
 * Version 1.13.2
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
	
	if( typeof bowser != 'undefined' ) {
		if( bowser.msie )
			IEEdgeVersion = bowser.version;
		else if( bowser.msedge )
			IEEdgeVersion = bowser.version;
	}
	
	if( IEEdgeVersion === '' )
		IEEdgeVersion = getIEEdgeVersion();

	//Fullscreen API polyfill
	$.chaosModalExitFullscreen = function() {
		if( !document.fullscreenElement 
			&& !document.webkitFullscreenElement 
			&& !document.mozFullScreenElement 
			&& !document.msFullscreenElement )
			return;
		
		var promise;
		if( 'fullscreenEnabled' in document )
			promise = document.exitFullscreen();
		else if( 'webkitFullscreenEnabled' in document )
			promise = document.webkitExitFullscreen();
		else if( 'mozFullScreenEnabled' in document )
			promise = document.mozCancelFullScreen();
		else if( 'msExitFullscreen' in document )
			promise = document.msExitFullscreen();

		if( promise && promise instanceof Promise ) promise.then({});
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
	$.chaosModalVideosLoaded = false;
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
			cssClass = options['cssClass'],
			closeLink = options['closeLink'],
			printLink = options['printLink'],
			alwaysAtTop = options['alwaysAtTop'],
			galleryPrevLink = options['galleryPrevLink'],
			galleryNextLink = options['galleryNextLink'];
			galleryLinkAreas = options['galleryLinkAreas'];
		//Update $.chaosModalMaxWidth
		$.chaosModalMaxWidth = options['maxWidth'];
		
		//Update $.chaosModalCurrent
		$.chaosModalCurrent = clone;

		var printIframeContent = clone.html();

		clone.attr({id: 'chaos-current-modal', class: cssClass});
		
		clone.prepend('<div style="clear: both;"></div>');

		//Write print link if none exists
		if(printLink)
			clone.prepend('<a class="print-link" style="float: left; margin: 5px;">Print</a>');
		
		//Write close link if none exists
		if(closeLink)
			clone.prepend('<a class="close-link" style="display: block; box-sizing: border-box; position: absolute; z-index: 10; top: -1em; right: -1em; width: 2em; height: 2em; border: 0.2em solid #fff; border-radius: 100%; color: #fff; background: #000; text-align: center; font-size: 15px; line-height: 1.6em; text-decoration: none;">&#10006;</a>');

		clone.append('<div style="clear: both;"></div>');

		if(galleryPrevLink) {
			clone.append('<a class="prev-link" style="display: block; box-sizing: border-box; position: absolute; z-index: 10; top: calc(50% - 1em); left: -1em; width: 2em; height: 2em; border: 0.2em solid #fff; border-radius: 100%; color: #fff; background: #000; text-align: center; font-size: 15px; line-height: 1.6em; text-decoration: none;">&#10094;</a>');
			if(galleryLinkAreas)
				clone.append('<a class="prev-link area" style="display: block; position: absolute; top: 0; left: 0; width: 20%; height: 100%;"></a>');
		}

		if(galleryNextLink) {
			clone.append('<a class="next-link" style="display: block; box-sizing: border-box; position: absolute; z-index: 10; top: calc(50% - 1em); right: -1em; width: 2em; height: 2em; border: 0.2em solid #fff; border-radius: 100%; color: #fff; background: #000; text-align: center; font-size: 15px; line-height: 1.6em; text-decoration: none;">&#10095;</a>');
			if(galleryLinkAreas)
				clone.append('<a class="next-link area" style="display: block; position: absolute; top: 0; right: 0; width: 80%; height: 100%;"></a>');
		}

		//Set the popup window css
		clone.css({'display': 'block', 'position': 'absolute', 'background': '#fff', 'z-index': '9002', 'left': '-10000px', 'margin': '0', 'padding': '0'});
		
		var cloneImages = clone.find('img[loading="lazy"]');
		
		// Lazy Load Image content
		function loadImage() {
			this.loading = 'eager';
			if( this.src )
				this.src = this.src;
			if( this.srcset )
				this.srcset = this.srcset;
		}

		cloneImages.each(loadImage);

		var cloneIframes = clone.find('iframe[src=""]'),
			cloneVideos = clone.find('video');
		
		if( cloneIframes.length + cloneVideos.length > 1 )
			options.iframeAddAutoplay = false;

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
		
		cloneIframes.each(iframeDataSrc);

		//Lazy Load video content
		function videoDataSrc() {
			var thisElement = $(this),
				videoDataSrc = thisElement.data('src');
			if( videoDataSrc ) {
				thisElement.attr('src', videoDataSrc).attr('data-src', '');
			}
		}
		
		cloneVideos.each(videoDataSrc);
		cloneVideos.css({'position': 'relative', 'z-index': '9'});
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
				clone.find('.print-link').on('click', printCurrentModal);
			}
			
			//Bind the close link events if any close links exist
			if(clone.find('.close-link').length > 0) {
				clone.find('.close-link').on('click', closeCurrentModal);
			}

			//Bind the prev gallery link events if any prev gallery links exist
			if(clone.find('.prev-link').length > 0) {
				clone.find('.prev-link').on('click', function() { galleryPrevLink.click(); });
			}

			//Bind the next gallery link events if any next gallery links exist
			if(clone.find('.next-link').length > 0) {
				clone.find('.next-link').on('click', function() { galleryNextLink.click(); });
			}
			
			if( options.clickPassthrough ) {
				//Bind the fallback link events if any fallback links exist
				clone.find('.fallback-link').on('click', function() {
					clearTimeout( $.chaosModalClickTimer );
				});
			}

			//transition effect
			$.modalMask.stop();
			clone.show(0, function() {
				//Bind the window resize event
				clone.resizeModal( alwaysAtTop );
				windowElement.on('resize', {'alwaysAtTop': alwaysAtTop}, resizeCurrentModalEvent);
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

		var isVideoNotLoaded = function( index, video ) {
			if (!$.chaosModalIsVisible(video))
				return false;
			if ( (video.readyState > 2 && video.getAttribute('src') != "")
				&& (typeof video.videoWidth == "undefined" || video.videoWidth != 0) )
				return false;
			video.load();
			return true;
		};

		//Show modal after all images and iframes have loaded
		var images = clone.find('img').filter(isImageNotLoaded),
			iframes = clone.find('iframe').filter(isIframeNotLoaded),
			videos = clone.find('video').filter(isVideoNotLoaded);
		$.imagesToLoad = images.length;
		$.iframesToLoad = iframes.length;
		$.videosToLoad = videos.length;

		if(!$.imagesToLoad && !$.iframesToLoad &&  !$.videosToLoad)
			showModal();
		else {
			images.on('load', function() {
				$.imagesToLoad -= 1;
				if(!$.imagesToLoad && !$.iframesToLoad &&  !$.videosToLoad)
					showModal();
			});
			iframes.on('load', function() {
				$.iframesToLoad -= 1;
				if(!$.imagesToLoad && !$.iframesToLoad &&  !$.videosToLoad)
					showModal();
			});
			videos.on('canplay', function() {
				$.videosToLoad -= 1;
				if(!$.imagesToLoad && !$.iframesToLoad &&  !$.videosToLoad)
					showModal();
			});
		}
		
		clone.show();
		
		return this;
	};

	$.fn.closeModal = function() {
		//Unbind the window resize event
		clearTimeout($.chaosModalResizeTimer);
		$(window).off('resize', resizeCurrentModalEvent);
		//Clear $.chaosModalCurrent
		$.chaosModalCurrent = null;
		
		//Unbind the close link events if any close links exist
		if(this.find('.close-link').length > 0) {
			this.find('.close-link').off('click');
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

		if (modalTop < 20) { modalTop = 20 };
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
		if(e) {
			//Velocity control
			if(Date.now() - $.openTime < 500){
				return false;
			}
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
		windowElement.on('resize', {'alwaysAtTop': alwaysAtTop}, resizeLoading);	
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
		if($.chaosModalLoading)
			$.chaosModalLoading.remove();
	}
	
	$.processModalLink = function(e) {
		var thisElement = $(this);
	
		e.preventDefault(); //Prevents browser from following links
		thisElement.off('click', $.processModalLink); //Remove content processing event. It should only be run once per link.
		
		var modalContentId = thisElement.data('chaos-modal-box-id'),
			modalContent = false,
			modalContentClone = false,
			imageRegex = /(^data:image\/[a-z0-9+\/=]*,)|(\.(jp(e|g|eg)|gif|png|bmp|wbmp|webp|svg|ico)((\?|#).*)?$)/i,
			videoRegex = /(\.(mp4)((\?|#).*)?$)/i,
			media = false,
			mediaCaption = false;
		
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
				media = $('<img loading="lazy" src="'+thisElement.attr('href')+'" />');
				//Use link title as image caption
				mediaCaption = thisElement.attr('title');
			} else if( videoRegex.test(thisElement.attr('href')) ) {
				//Use link href as video url
				media = $('<video src="'+thisElement.attr('href')+'" controls />');
				//Use link title as video caption
				mediaCaption = thisElement.attr('title');
			}

			if( !media ) {
				//Check for single image inside of modal link
				var modalImage = thisElement.find('img');
				if( modalImage.length == 1 ) {
					if( imageRegex.test(modalImage.attr('src')) ) {
						//Use image src as image url
						media = $('<img loading="lazy" src="'+modalImage.attr('src')+'" />');
						//Use image title as image caption
						mediaCaption = modalImage.attr('title');
					}
				}
			}

			if( !media ) {
				//Check for single video inside of modal link
				var modalVideo = thisElement.find('video');
				if( modalVideo.length == 1 ) {
					if( imageRegex.test(modalVideo.attr('src')) ) {
						//Use video src as video url
						media = $('<video src="'+modalVideo.attr('src')+'" controls />');
						//Use video title as video caption
						mediaCaption = modalVideo.attr('title');
					}
				}
			}

			
			if( media ) {
				modalContentClone = $('<div></div>').css({'padding': '20px'});
				media.css({'display': 'block', 'max-height': 'calc(80vh - 40px)' }).appendTo(modalContentClone);
				modalContentClone = $('<div></div>').css({'background': '#fff'}).append(modalContentClone);
				thisElement.data('chaos-modal-gallery-link-areas', true);
			}

			if( mediaCaption && !thisElement.data('chaos-modal-caption') ) {
				mediaCaption = (mediaCaption + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br />$2');
				thisElement.data('chaos-modal-caption', imageCaption);
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
				closeCurrentModal();
				$.fn.showLoading();
				
				//Get options from modal-link
				var options = { maxWidth : 960,
					cssClass: false,
					closeLink: true,
					printLink: false, 
					alwaysAtTop: false, 
					preprocessing: false,
					clickPassthrough: false,
					iframeAddAutoplay: true,
					caption: false,
					galleryPrevLink: false,
					galleryNextLink: false,
					galleryLinkAreas: false };
				
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
						'position': 'relative',
						'z-index': 9,
						'display': 'table-caption', 
						'caption-side': 'bottom', 
						'padding-top': 0,
						'padding-right': '20px',
						'padding-bottom': '20px',
						'padding-left': '20px',
						'background': '#fff'
					});
					modalContentClone.children().first().css('display', 'table').append(modalCaption);
					thisElement.data('chaos-modal-caption', '');
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
	$('.chaos-modal-link').not('a').each(function() {
		var thisElement = $(this),
			childElements = thisElement.children();
		thisElement.removeClass('chaos-modal-link');
		if( childElements.not('a').length )
			return;
		if( childElements.length == 1 )
			childElements.addClass('chaos-modal-link');
	});
	
	//Link gallery items
	var modalGalleries = {};
	$('[data-chaos-modal-gallery]').each(function() {
		var thisElement = $(this),
			galleryId = thisElement.data('chaos-modal-gallery');
		if( ! ( galleryId in modalGalleries ) )
			modalGalleries[galleryId] = [];
		modalGalleries[galleryId].push(thisElement);
	});

	$.each(modalGalleries, function() {
		var prevLink = false;
		$.each(this, function() {
			this.find('a.chaos-modal-link').each(function() {
				var thisElement = $(this);
				thisElement.data('chaos-modal-gallery-prev-link', prevLink);
				if( prevLink )
					prevLink.data('chaos-modal-gallery-next-link', thisElement);
				prevLink = thisElement;
			});
		});
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
});
