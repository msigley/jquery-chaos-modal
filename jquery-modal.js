/*
 * jQuery Chaos Modal
 * By Matthew Sigley
 * Based on concept work by Kevin Liew - http://www.queness.com/post/77/simple-jquery-modal-window-tutorial
 * Version 1.1.0
 * Recent changes:
 * - Added maxWidth parameter to openModal function (1.1.0)
 * - Added automatic modal binding to .chaos-modal-link elements (1.1.0)
 * - Added option to close the modal when the mask is clicked or the ESC key is pressed (1.1.0)
 * - Reworked references to optimize javascript caching (1.1.0)
 * - Added option to openModal to close the modal on mask click
 * - Clones content container and appends to body for absolute positioning relative to body
 * - Added max width variable so you can keep modal content inside your wrapper div's width
 * Things left to do:
 * -Jquery animation queue integration
 * -Function parameters for changing the default CSS styles
 * -Change namespacing of functions to work similar to $('#example').modal("open")
 * -Add position parameter to openModal function
 * -Update and test resizeModal function
 */

(function( $ ) {
	//Property to store the modal current being displayed
	var currentModal,
		maxWidth;
	
	$.fn.openModal = function( options ) {
		//Default options
		var defaults = { maskClose: true, maxWidth: 960 };
		options = $.extend({}, defaults, options);
		
		//Clone modal content
		var clone = this.clone(),
			bodyElement = $('body'),
			documentElement = $(document),
			windowElement = $(window),
			maskClose = options['maskClose'];
			
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
		if(clone.find('.print-link').length == 0) {
			clone.prepend('<a class="print-link">Print</a>');
			clone.children('.print-link').css({'float': 'right', 'padding': '0 0 10px 10px'});
			}
		
		//Write close link if none exist
		if(clone.find('.close-link').length == 0) {
			clone.prepend('<a class="close-link">Close</a>');
			clone.children('.close-link').css({'float': 'right', 'padding': '0 0 10px 10px'});
			}
		
		//Get the screen height and width
		var maskHeight = documentElement.height();
		var maskWidth = windowElement.width();
		
		//Check for invalid mask dimensions
        if(maskHeight < clone.height()) { maskHeight = clone.height(); }
		
		//Set height and width to mask to fill up the whole screen
        modalMask.css({'width': maskWidth,'height': maskHeight});
        
        //Mask transition effect    
        modalMask.fadeIn(1000);   
        modalMask.fadeTo("slow",0.8); 
     
        //Get the window height and width
        var winH = windowElement.height();
        var winW = windowElement.width();
               
        //Set the popup window css
        clone.css({'display': 'block', 'position': 'absolute', 'background': '#fff', 'z-index': '9001', 'left': '-10000px'});
        clone.appendTo(bodyElement);
        clone.show();
        
       	//Lock popup window width
       	if(clone.width() > maxWidth){
       		clone.width(maxWidth);
       		} else {
       		clone.width(clone.width());
       		}
       	//Calculate popup window position
        var modalTop = winH/2-clone.height()/2;
        var modalLeft = winW/2-clone.width()/2;
        
        //Check for invalid window positions
        if (modalTop < 0) { modalTop = 0; }
        if (modalLeft < 0) { modalLeft = 0; }
        
        //Set the popup window to center
        clone.hide();
        clone.css({'top': modalTop, 'left': modalLeft});
     	
        //transition effect
        clone.fadeIn(2000);
        
        //Bind the window resize event
        windowElement.bind('resize', resizeCurrentModal);
        
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
		
		//Hide the popup window
		this.hide().remove();
		
		//Remove the mask div
		$('body').children('.chaos-modal-mask').hide().remove();
		
		return this;
	};
	
	$.fn.resizeModal = function() {
		//Get the screen height and width
        var maskHeight = $(document).height();
        var maskWidth = $(window).width();
               
        //Get the window height and width
        var winH = $(window).height();
        var winW = $(window).width();
        
        //Check for invalid mask dimensions
        if(maskHeight < this.height()) { maskHeight = this.height(); }
        
        //Set height and width to mask to fill up the whole screen
        $('body').children('.modal-mask').css({'width':maskWidth,'height':maskHeight});
                
        //Calculate popup window position
        var modalTop = winH/2-this.height()/2;
        var modalLeft = winW/2-this.width()/2;
        
        //Check for invalid window positions
        if (modalTop < 0) { modalTop = 0; }
        if (modalLeft < 0) { modalLeft = 0; }
        
        //Set the popup window to center
        this.css('top', modalTop);
        this.css('left', modalLeft);
        
        return this;
	};
	
	$.fn.printModal = function() {
		window.print();
	};
	
	function resizeCurrentModal() {
		currentModal.resizeModal();
	}
	
	function closeCurrentModal() {
		currentModal.closeModal();
	}
	
	function printCurrentModal() {
		currentModal.printModal();
	}
	function closeOnESC(e) {
		if( e.which == 27 ) {
			$(this).off('keyup', closeOnESC);
			closeCurrentModal();
		}
	}
})( jQuery );

/* Create modal box clones and click events */
jQuery(document).ready(function(){
	$('.chaos-modal-link').each(function(index) {
		var thisElement = $(this),
			modalContent = thisElement.parent().find('.modal-box').first(),
			modalContentClone = false;
		//Check for pre-defined modal content
		if( modalContent.length ) {
			modalContentClone = modalContent.clone();
			modalContent.remove();
		} else {
			//Check for single image inside of modal link
			modalImage = thisElement.find('img');
			if( modalImage.length == 1 )
				modalContentClone = modalImage.clone();
		}
		//Setup event if content is available
		if( modalContentClone ) {
			//Assign unique ids to each modal link and content
			thisElement.attr({
				href: '#',
				id: 'chaos-modal-link-'+index
			});
			modalContentClone.attr({
				id: 'chaos-modal-box-'+index
			});
			modalContentClone.hide();
			//Append hidden modal content to body
			modalContentClone.appendTo('body');
			thisElement.click(function() {
				modalContentClone.openModal();
			});
		}
	});
});