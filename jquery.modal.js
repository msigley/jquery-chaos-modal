/*
 * jQuery Chaos Modal
 * By Matthew Sigley
 * Based on concept work by Kevin Liew - http://www.queness.com/post/77/simple-jquery-modal-window-tutorial
 * Version 1.4
 */

(function( $ ) {

	//Bowser IE version detection
	function getIEVersion() {
		var ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
		if( /msie|trident/i.test(ua) ) {
			var match = ua.match(/(?:msie |rv:)(\d+(\.\d+)?)/i);
    		return (match && match.length > 1 && match[1]) || '';
    	}
    	return '';
    }

	var windowElement = $(window),
		 IEVersion = '';
	
	if( bowser.msie )
		IEVersion = bowser.version;
	else
		IEVersion = getIEVersion();
	
	//Detects images that are not visible
	var isVisible = function( element ) {
		if( element.offsetParent === null )
			return false;
		if( IEVersion < 11 ) {
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
	$.chaosModalLoading  = null;
	$.modalMask          = null;
	$.chaosModalCurrent  = null;
	$.chaosModalMaxWidth = 0;
	$.chaosModalIndex    = 0;
	$.chaosModalImagesLoaded  = false;
	$.chaosModalIframesLoaded = false;
	
	$.fn.openModal = function( options ) {
		//If modal already open, return
		if($.chaosModalCurrent != null){
			return;
		}
		//Default options
		var defaults = { maxWidth: 960, closeLink: true, printLink: false, alwaysAtTop: false, preprocessing: false };
		    options  = $.extend({}, defaults, options);

		//Lazy Load iFrame content
		function iframeDataSrc() {
			var thisElement = $(this),
				iframeDataSrc = thisElement.data('src');
			if( iframeDataSrc )
				thisElement.attr('src', iframeDataSrc).attr('data-src', '');
		}
		this.find('iframe[src=""]').each(iframeDataSrc);

		//Clone modal content
		var clone           = this.clone(true),
			  bodyElement     = $('body'),
			  htmlElement     = $('html'),
			  documentElement = $(document),
			  windowElement   = $(window),
			  closeLink       = options['closeLink'],
			  printLink       = options['printLink'],
			  alwaysAtTop     = options['alwaysAtTop'];
		//Update $.chaosModalMaxWidth
		$.chaosModalMaxWidth = options['maxWidth'];
		
		//Update $.chaosModalCurrent
		$.chaosModalCurrent = clone;
		clone.attr({id: 'chaos-current-modal'});
		
		//Write print link if none exist
		if(clone.find('.print-link').length == 0 && printLink) {
			clone.prepend('<a class="print-link">Print</a>');
			clone.children('.print-link').css({'float': 'right', 'margin': '5px'});
		}
		
		//Write close link if none exist
		if(clone.find('.close-link').length == 0 && closeLink) {
			clone.prepend('<a class="close-link">Close</a>');
			clone.children('.close-link').css({'float': 'right', 'margin': '5px'});
		}
               
    //Set the popup window css
    clone.css({'display': 'block', 'position': 'absolute', 'background': '#fff', 'z-index': '9002', 'left': '-10000px', 'margin': '0', 'padding': '0'});
    clone.prependTo(bodyElement);
     
    var showModal = function() {
			//Lock popup window width
	    if(clone.width() > $.chaosModalMaxWidth){
	      clone.width($.chaosModalMaxWidth);
	    } else {
	      clone.width(clone.width());
	    }
	       	
	    //Fix content widths
	    clone.find('img').css('max-width', '100%'); 
	       	
	    clone.hide();
	       	
			//Calculate the modal mask size and popup window position
			clone.resizeModal( alwaysAtTop );
	     	
	    //transition effect
			$.modalMask.stop();
	    clone.fadeIn(2000, function() {
	      //Bind the window resize event
				clone.resizeModal( alwaysAtTop );
	      windowElement.bind('resize', {'alwaysAtTop': alwaysAtTop}, resizeCurrentModal);
				$.fn.closeLoading();
	    });
	        
	    //Bind the print link events if any close links exist
	    if(clone.find('.print-link').length > 0) {
	      clone.find('.print-link').bind('click', printCurrentModal);
	    }
	        
	    //Bind the close link events if any close links exist
	    if(clone.find('.close-link').length > 0) {
	      clone.find('.close-link').bind('click', closeCurrentModal);
	      }
	        
    };
        
		var isImageNotLoaded = function( index, img ) {
			if (!isVisible(img))
				return false;
			if (img.complete)
				return false;
			if (typeof img.naturalWidth == "undefined" || img.naturalWidth != 0)
				return false;
			return true;
		};
		
		var isIframeNotLoaded = function( index, iframe ) {
			if( IEVersion ) //Ignore Iframes in IE due to security restrictions.
				return false;
			if (!isVisible(iframe))
		    	return false;
			var iframeDocument = iframe.contentDocument || iframe.contentWindow.document
			if ('complete' == iframeDocument.readyState)
		    return false;
			return true;
		};

    //Show modal after all images and iframes have loaded
    var images  = clone.find('img').filter(isImageNotLoaded),
        iframes = clone.find('iframe').filter(isIframeNotLoaded);
				$.imagesToLoad  = images.length;
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
		$(window).unbind('resize', resizeCurrentModal);
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
			  windowElement   = $(window),
			  htmlElement     = $('html'),
			  maskHeight      = documentElement.height(), //Get the screen height and width
			  maskWidth       = htmlElement.width(),
			  winH            = windowElement.height(), //Get the window height and width
        winW            = windowElement.width();
        
        //Check for invalid mask dimensions
        if(maskHeight < this.height()) { maskHeight = this.height(); }
        if(maskWidth < winW) { maskWidth = winW; }
        
        //Set height and width to mask to fill up the whole screen
        $('#chaos-modal-mask').css({'width':maskWidth,'height':maskHeight});
                
        //Calculate popup window position
        var modalTop  = winH/2-this.height()/2,
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
		window.print();
	};
	
	function resizeCurrentModal(e) {
		var alwaysAtTop = false;
		if( e.data.alwaysAtTop ) { alwaysAtTop = e.data.alwaysAtTop; }
		$.chaosModalCurrent.resizeModal( alwaysAtTop );
	}
	
	function closeCurrentModal(e) {
		e.preventDefault(); //Prevents browser from following links
		//Velocity control
		if(Date.now() - $.openTime < 500){
			return false;
		}
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
		var bodyElement   = $('body'),
		    windowElement = $(window),
		    winH          = windowElement.height(), //Get the window height and width
		    winW          = windowElement.width();
			  maskClose     = true;
		//Create mask div
		$.modalMask = $('<div id="chaos-modal-mask" class="chaos-modal-mask"></div>');
		$.modalMask.css({'position': 'absolute', 'z-index': '9000', 'background-color': '#000', 'display': 'none', 'top': '0', 'left': '0'});
		
		$.modalMask.prependTo(bodyElement);

		//Mask transition effect    
	   $.modalMask.fadeIn(500);   
	   $.modalMask.fadeTo("fast",0.8);

		var documentElement = $(document),
			  windowElement   = $(window),
			  htmlElement     = $('html'),
			  maskHeight      = documentElement.height(), //Get the screen height and width
			  maskWidth       = htmlElement.width();
		
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
			  windowElement   = $(window),
			  htmlElement     = $('html'),
			  maskHeight      = documentElement.height(), //Get the screen height and width
			  maskWidth       = htmlElement.width(),
			  winH            = windowElement.height(), //Get the window height and width
        winW            = windowElement.width();

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
	$('a.chaos-modal-link').on('click', processModalLink);
	
	//Lazy Load iFrame content
	function iframeDataSrc() {
		var thisElement = $(this),
			iframeSrc = thisElement.attr('src');
		thisElement.attr('data-src', iframeSrc).attr('src', '');
	}
	$('.chaos-modal-box:hidden iframe').each(iframeDataSrc);
	$('.chaos-modal-link').each(function() {
		var modalContentId = $(this).data('chaos-modal-box-id');
		if( modalContentId )
			$('#'+modalContentId+':hidden iframe').each(iframeDataSrc);
	});
	
	function processModalLink(e) {
		var thisElement = $(this);
	
		e.preventDefault(); //Prevents browser from following links
		thisElement.off('click', processModalLink); //Remove content processing event. It should only be run once per link.
		
		var modalContentId    = thisElement.data('chaos-modal-box-id'),
				modalContent      = false,
				modalContentClone = false,
				imageRegex        = /\.(jpeg|jpg|gif|png|bmp|wbmp)$/i,
				imageUrl          = false;
		
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
			} else {
				//Check for single image inside of modal link
				var modalImage = thisElement.find('img');
				if( modalImage.length == 1 ) {
					if( imageRegex.test(modalImage.attr('src')) )
						imageUrl = modalImage.attr('src');
				}
			}
			
			if( imageUrl ) {
				//Send HEAD request to validate image url
				testRequest = $.ajax(imageUrl, {type: 'HEAD', async: false});
				if( testRequest.status == 200 ) {
					modalContentClone = $('<div></div>').css({'padding': '20px'});
					$('<img src="'+imageUrl+'" />').css({'display': 'block'}).appendTo(modalContentClone);
					modalContentClone = $('<div></div>').css({'background': '#fff'}).append(modalContentClone);
				}
			}
		}
		//Setup openModal event if content is available
		if( modalContentClone ) {
			//Remove original content element to avoid id conflicts
			modalContent.remove();
			//Assign unique ids to each modal link and content
			thisElement.attr({
				href: '#',
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
				preprocess = thisElement.attr('data-preprocess');
				var thisId = $(this).attr('id'),
					indexRegex = /chaos-modal-link-(\d+)/i,
					chaosModalIndex = thisId.match(indexRegex);
				if( chaosModalIndex[1] ) {
					var modalBox = $('#chaos-modal-box-'+chaosModalIndex[1]);
					if( modalBox.length == 1 && preprocess != 'true' ) {
						modalBox.openModal();
					} else if (modalBox.length == 1 && preprocess == 'true'){
						thisElement.trigger("chaos-modal-preprocess", modalBox);
					}
				}
				return false;
			});
			thisElement.click();
			
			$.chaosModalIndex++;
		}
		return false;
	}
	//Polyfill for Date.now()
	if(!Date.now){
			Date.now = function now(){
				return new Date().getTime();
			};
	}
});