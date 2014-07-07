/*
 * jQuery Chaos Modal
 * By Matthew Sigley
 * Based on concept work by Kevin Liew - http://www.queness.com/post/77/simple-jquery-modal-window-tutorial
 * Version 1.3.1
 * Recent changes:
 * - Fixed closeOnESC not passing its event to closeCurrentModal (1.3.1)
 * - Fixed container styles on custom html (1.3.1)
 * - Fixed improper class name on custom html containers (1.3.1)
 * - Added alwaysAtTop parameter to openModal and resizeModal function (1.3.0)
 * - Implemented vertical positioning from current scroll position (1.3.0)
 * - Fixed browser following the href of print and close links (1.3.0)
 * - Added image prerendering in modal content (1.2.0)
 * - Updated and fixed resizeModal function to work based off of the html element's width (1.2.0)
 * - Added image in link href support (1.2.0)
 * - Reworked automatic modal binding to clone content on-the-fly (1.2.0)
 * - Added maxWidth parameter to openModal function (1.1.0)
 * - Added automatic modal binding to .chaos-modal-link elements (1.1.0)
 * - Added option to close the modal when the mask is clicked or the ESC key is pressed (1.1.0)
 * - Reworked references to optimize javascript caching (1.1.0)
 * - Clones content container and appends to body for absolute positioning relative to body
 * - Added max width variable so you can keep modal content inside your wrapper div's width
 * Things left to do:
 * -Add padding option to openModal
 * -Jquery animation queue integration
 * -Function parameters for changing the default CSS styles
 * -Change namespacing of functions to work similar to $('#example').modal("open")
 * -Add position parameter to openModal function
 */

(function( $ ) {
	//Property to store the modal current being displayed
	var currentModal,
		maxWidth;
	
	//Global variable for generating modal box clones
	$.chaosModalIndex = 0;
	
	$.fn.openModal = function( options ) {
		//Default options
		var defaults = { maskClose: true, maxWidth: 960, closeLink: true, printLink: false, alwaysAtTop: false };
		options = $.extend({}, defaults, options);
		
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
			
		//Update maxWidth
		maxWidth = options['maxWidth'];
		
		//Update currentModal
		currentModal = clone;
		clone.attr({id: 'chaos-current-modal'});
		
		//Write the mask div
		var modalMask = $('<div id="chaos-modal-mask" class="chaos-modal-mask"></div>');
		modalMask.css({'position': 'absolute', 'z-index': '9000', 'background-color': '#000', 'display': 'none', 'top': '0', 'left': '0'});
		modalMask.appendTo(bodyElement);
		
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
        clone.appendTo(bodyElement);
        
        var showModal = function() {
        	//Lock popup window width
	       	if(clone.width() > maxWidth){
	       		clone.width(maxWidth);
	       	} else {
	       		clone.width(clone.width());
	       	}
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
        
        //Show modal after all images have loaded
        var lastImage = clone.find('img').last();
        if(lastImage.length) { lastImage.on('load', showModal); }
        else { showModal(); }
        
        clone.show();
        
        return this;
	};
	
	$.fn.closeModal = function() {
		//Clear currentModal
		currentModal = null;
		
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
		currentModal.resizeModal( alwaysAtTop );
	}
	
	function closeCurrentModal(e) {
		e.preventDefault(); //Prevents browser from following links
		currentModal.closeModal();
	}
	
	function printCurrentModal(e) {
		e.preventDefault(); //Prevents browser from following links
		currentModal.printModal();
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
	$('.chaos-modal-link').one('click', processModalLink);
	
	function processModalLink(e) {
		var thisElement = $(this);
		
		e.preventDefault(); //Prevents browser from following links
		thisElement.off('click', processModalLink); //Remove content processing event. It should only be run once per link.
		
		var modalContent = thisElement.parent().find('.chaos-modal-box').first(),
			modalContentClone = false,
			imageRegex = /\.(jpeg|jpg|gif|png|bmp|wbmp)$/i,
			imageUrl = false;
		
		//Check for pre-defined modal content
		if( modalContent.length ) {
			modalContentClone = $('<div></div>').css({'padding': '20px'});
			modalContent.clone().appendTo(modalContentClone);
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