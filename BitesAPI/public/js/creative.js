/*!
 * Start Bootstrap - Creative Bootstrap Theme (http://startbootstrap.com)
 * Code licensed under the Apache License v2.0.
 * For details, see http://www.apache.org/licenses/LICENSE-2.0.
 */

(function($) {
    "use strict"; // Start of use strict

    // jQuery for page scrolling feature - requires jQuery Easing plugin
    $('a.page-scroll').bind('click', function(event) {
        var $anchor = $(this);
        
        $('html, body').stop().animate({
            scrollTop: ($($anchor.attr('href')).offset().top - 50)
        }, 1250, 'easeInOutExpo');
        
        event.preventDefault();
    });

    // Highlight the top nav as scrolling occurs
    
    $('body').scrollspy({
        target: '.navbar-fixed-top',
        offset: 51
    })
    
    // Closes the Responsive Menu on Menu Item Click
    $('.navbar-collapse ul li a').click(function() {
        $('.navbar-toggle:visible').click();
    });

    // Fit Text Plugin for Main Header
    $("h1").fitText(
        1.2, {
            minFontSize: '35px',
            maxFontSize: '65px'
        }
    );
    
    $(window).scroll(function() {
        if(window.pageYOffset >= 0) {
            $(".logopic").attr("src", "img/portfolio/Logo.png");
        } else {
            $(".logopic").attr("src", "img/portfolio/Logo_white.png");
        }
    });
    
    

    // Offset for Main Navigation
    
    $('#mainNav').affix({
        offset: {
            top: -1
        }
    })

    // Initialize WOW.js Scrolling Animations
    new WOW().init();
    
    $(document).ready(function(){
    $('section[data-type="background"]').each(function(){
        var $bgobj = $(this); // assigning the object
    
        $(window).scroll(function() {
            var yPos = -($window.scrollTop() / $bgobj.data('speed')); 
            
            // Put together our final background position
            var coords = '50% '+ yPos + 'px';

            // Move the background
            $bgobj.css({ backgroundPosition: coords });
        }); 
    });
    
    $(document).ready(function() {
 
  $("#slideshow").owlCarousel({
 
      navigation : false, // Show next and prev buttons
      slideSpeed : 300,
      paginationSpeed : 400,
      singleItem:true,
      autoPlay: 2000,
      pagination: false
 
      // "singleItem:true" is a shortcut for:
      // items : 1, 
      // itemsDesktop : false,
      // itemsDesktopSmall : false,
      // itemsTablet: false,
      // itemsMobile : false
 
  });
 
});
});

})(jQuery); // End of use strict
