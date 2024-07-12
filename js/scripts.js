/*!
* Start Bootstrap - New Age v6.0.7 (https://startbootstrap.com/theme/new-age)
* Copyright 2013-2023 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-new-age/blob/master/LICENSE)
*/
//
// Scripts
// 

window.addEventListener('DOMContentLoaded', event => {

    // Activate Bootstrap scrollspy on the main nav element
    const mainNav = document.body.querySelector('#mainNav');
    if (mainNav) {
        new bootstrap.ScrollSpy(document.body, {
            target: '#mainNav',
            offset: 74,
        });
    };

    // Collapse responsive navbar when toggler is visible
    const navbarToggler = document.body.querySelector('.navbar-toggler');
    const responsiveNavItems = [].slice.call(
        document.querySelectorAll('#navbarResponsive .nav-link')
    );
    responsiveNavItems.map(function (responsiveNavItem) {
        responsiveNavItem.addEventListener('click', () => {
            if (window.getComputedStyle(navbarToggler).display !== 'none') {
                navbarToggler.click();
            }
        });
    });
    // JavaScript function to add dollar sign to input value
    function addDollarSign(input) {
        // Remove any existing dollar signs and non-numeric characters
        input.value = input.value.replace(/[^\d.]/g, '');

        // Add dollar sign at the beginning of the input value
        if (input.value !== '' && !input.value.startsWith('$')) {
            input.value = '$' + input.value;
        }
    }
    function toggleDetails(element) {
        const details = element.querySelector('.details');
        details.style.display = details.style.display === 'block' ? 'none' : 'block';
    }

});
