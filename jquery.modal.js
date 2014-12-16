/*
 * jQuery Chaos Modal
 * By Matthew Sigley
 * Based on concept work by Kevin Liew - http://www.queness.com/post/77/simple-jquery-modal-window-tutorial
 * Version 1.3.8
 */

(function( $ ) {
	//Global variables for generating modal box clones
	$.chaosModalCurrent = null;
	$.chaosModalMaxWidth = 0;
	$.chaosModalIndex = 0;
	$.chaosModalImagesLoaded = false;
	$.chaosModalIframesLoaded = false;
	
	$.fn.openModal = function( options ) {
		//Default options
		var defaults = { maskClose: true, maxWidth: 960, closeLink: true, printLink: false, alwaysAtTop: false };
		options = $.extend({}, defaults, options);
		
		//Lazy Load iFrame content
		function iframeDataSrc() {
			var thisElement = $(this),
				iframeDataSrc = thisElement.data('src');
			if( iframeDataSrc )
				thisElement.attr('src', iframeDataSrc);
		}
		this.find('iframe[src=""]').each(iframeDataSrc);
		
		//Clone modal content
		var clone = this.clone(),
			bodyElement = $('body'),
			htmlElement =  $('html'),
			documentElement = $(document),
			windowElement = $(window),
			maskClose = options['maskClose'],
			closeLink = options['closeLink'],
			printLink = options['printLink'],
			alwaysAtTop = options['alwaysAtTop'];
			
		//Update $.chaosModalMaxWidth
		$.chaosModalMaxWidth = options['maxWidth'];
		
		//Update $.chaosModalCurrent
		$.chaosModalCurrent = clone;
		clone.attr({id: 'chaos-current-modal'});
		
		//Write the mask div
		var modalMask = $('<div id="chaos-modal-mask" class="chaos-modal-mask"></div>');
		modalMask.css({'position': 'absolute', 'z-index': '9000', 'background-color': '#000', 'display': 'none', 'top': '0', 'left': '0'});
		modalMask.prependTo(bodyElement);
		
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
        clone.css({'display': 'block', 'position': 'absolute', 'background': '#fff', 'z-index': '9001', 'left': '-10000px', 'margin': '0', 'padding': '0'});
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
	     	
	     	//Mask transition effect    
	        modalMask.fadeIn(1000);   
	        modalMask.fadeTo("slow",0.8);
	     	
	        //transition effect
	        clone.fadeIn(2000);
	        
	        //Bind the window resize event
	        windowElement.bind('resize', {'alwaysAtTop': alwaysAtTop}, resizeCurrentModal);
	        
	        //Bind the print link events if any close links exist
	        if(clone.find('.print-link').length > 0) {
	        	clone.find('.print-link').bind('click', printCurrentModal);
	        }
	        
	        //Bind the close link events if any close links exist
	        if(clone.find('.close-link').length > 0) {
	        	clone.find('.close-link').bind('click', closeCurrentModal);
	         }
	        
	        //Bind close event to mask click and when the ESC key is pressed
			if(maskClose) {
				modalMask.on('click', closeCurrentModal);
				documentElement.on('keyup', closeOnESC);
			}
        };
        
        //Show modal after all images and iframes have loaded
        var lastImage = clone.find('img').last(),
        	lastIframe = clone.find('iframe').last();
        $.chaosModalImagesLoaded = (lastImage.length) ? false : true;
        $.chaosModalIframesLoaded = (lastIframe.length) ? false : true;
        
        if($.chaosModalImagesLoaded && $.chaosModalIframesLoaded)
        	showModal();
        else {
        	lastImage.on('load', function() {
        		$.chaosModalImagesLoaded = true;
        		if($.chaosModalImagesLoaded && $.chaosModalIframesLoaded)
        			showModal();
        	});
        	lastIframe.on('load', function() {
        		$.chaosModalIframesLoaded = true;
        		if($.chaosModalImagesLoaded && $.chaosModalIframesLoaded)
        			showModal();
        	});
        }
        
        clone.show();
        
        return this;
	};
	
	$.fn.closeModal = function() {
		//Clear $.chaosModalCurrent
		$.chaosModalCurrent = null;
		
		//Unbind the window resize event
		$(window).unbind('resize', resizeCurrentModal);
		
		//Unbind the close link events if any close links exist
        if(this.find('.close-link').length > 0) {
        	this.find('.close-link').unbind('click');
        }
		
		//Remove the popup window
		this.hide().remove();
		
		//Remove the mask div
		$('#chaos-modal-mask').hide().remove();
		
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
		window.print();
	};
	
	function resizeCurrentModal(e) {
		var alwaysAtTop = false;
		if( e.data.alwaysAtTop ) { alwaysAtTop = e.data.alwaysAtTop; }
		$.chaosModalCurrent.resizeModal( alwaysAtTop );
	}
	
	function closeCurrentModal(e) {
		e.preventDefault(); //Prevents browser from following links
		$.chaosModalCurrent.closeModal();
	}
	
	function printCurrentModal(e) {
		e.preventDefault(); //Prevents browser from following links
		$.chaosModalCurrent.printModal();
	}
	function closeOnESC(e) {
		if( e.which == 27 ) {
			$(this).off('keyup', closeOnESC);
			closeCurrentModal(e);
		}
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
	$('a.chaos-modal-link').one('click', processModalLink);
	
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
		
		var modalContentId = thisElement.data('chaos-modal-box-id'),
			modalContent = false,
			modalContentClone = false,
			imageRegex = /\.(jpeg|jpg|gif|png|bmp|wbmp)$/i,
			imageUrl = false;
		
		if( modalContentId )
			modalContent = $('#'+modalContentId).first();
		else
			modalContent = thisElement.parent().find('.chaos-modal-box').first();
		
		//Check for pre-defined modal content
		if( modalContent.length ) {
			modalContentClone = $('<div></div>').css({'padding': '20px'});
			modalContent.clone().show().appendTo(modalContentClone);
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
				var thisId = $(this).attr('id'),
					indexRegex = /chaos-modal-link-(\d+)/i,
					chaosModalIndex = thisId.match(indexRegex);
				if( chaosModalIndex[1] ) {
					var modalBox = $('#chaos-modal-box-'+chaosModalIndex[1]);
					if( modalBox.length == 1 ) {
						modalBox.openModal();
					}
				}
				return false;
			});
			thisElement.click();
			
			$.chaosModalIndex++;
		}
		return false;
	}
});