/*
 * jQuery Chaos Modal
 * By Matthew Sigley
 * Based on work by Kevin Liew - http://www.queness.com/post/77/simple-jquery-modal-window-tutorial
 * Version 20120514
 * Recent changes:
 * - Clones content container and appends to body for absolute positioning relative to body
 * - Added max width variable so you can keep modal content inside your wrapper div's width
 * Things left to do:
 * -Jquery animation queue integration
 * -Function parameters for changing the default CSS styles
 * -Change namespacing of functions to work similar to $('#example').modal("open")
 * -Add maxWidth parameter to openModal function
 * -Add position parameter to openModal function
 * -Update and test resizeModal function
 */

(function( $ ) {
	//Property to store the modal current being displayed
	var currentModal;
	var maxWidth = 960;
	
	$.fn.openModal = function() {
		//Clone modal content
		var clone = this.clone();
		
		//Update currentModal
		currentModal = clone;
		
		//Write the mask div
		$('body').append('<div class="modal-mask"></div>');
		$('body').children('.modal-mask').css({'position': 'absolute', 'z-index': '9000', 'background-color': '#000', 'display': 'none', 'top': '0', 'left': '0'});
		$('body').append(clone);
		
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
		var maskHeight = $(document).height();
		var maskWidth = $(window).width();
		
		//Check for invalid mask dimensions
        if(maskHeight < clone.height()) { maskHeight = clone.height(); }
		
		//Set height and width to mask to fill up the whole screen
        $('body').children('.modal-mask').css({'width':maskWidth,'height':maskHeight});
        
        //transition effect    
        $('body').children('.modal-mask').fadeIn(1000);   
        $('body').children('.modal-mask').fadeTo("slow",0.8); 
     
        //Get the window height and width
        var winH = $(window).height();
        var winW = $(window).width();
               
        //Set the popup window css
        clone.css('position', 'absolute');
       	clone.css('background', '#fff');
       	clone.css('z-index', '9001');
       	
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
        clone.css('top', modalTop);
        clone.css('left', modalLeft);
     	
        //transition effect
        clone.fadeIn(2000);
        
        //Bind the window resize event
        $(window).bind('resize', resizeCurrentModal);
        
        //Bind the print link events if any close links exist
        if(clone.find('.print-link').length > 0) {
        	clone.find('.print-link').bind('click', printCurrentModal);
        	}
        
        //Bind the close link events if any close links exist
        if(clone.find('.close-link').length > 0) {
        	clone.find('.close-link').bind('click', closeCurrentModal);
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
		$('body').children('.modal-mask').hide().remove();
		
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
})( jQuery );