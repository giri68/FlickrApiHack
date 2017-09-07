'use strict';

// Our store
const STORE = {
  api_url: 'https://api.flickr.com/services/rest/',
  api_key: 'b7201f356e3eee6525240d1e58bcee4e',
  userSearchTerm: '',
  searchResults: [],
  onPage: 1
};


// Event handlers

// Handler for when someone presses Enter or hits the search button 
// after typing in a search term.
function handleSearch() {
  $('.js-form').on('submit', function(event) {
    event.preventDefault();
    STORE.searchResults = [];
    $('.js-search-results').html('');
    let search = $('.js-input').val();
    STORE.userSearchTerm = `${search} wallpaper`;
    $('.js-input').val('');
    $('.form').addClass('form-shift');
    getDataFromApi(STORE.userSearchTerm, displayData);
    $('.js-more-results').removeClass('hidden');
    $('.js-more-results').addClass('block');
  });
}

// Handler for when someone starts typing into the search form input
// to search for what they've typed so far
function handleAutoSearch() {
  $('.js-form').on('keyup change', function(event) {
    event.preventDefault();
    STORE.searchResults = [];
    $('.js-search-results').html('');
    let search = $('.js-input').val();
    STORE.userSearchTerm = `${search} wallpaper`;
    $('.form').addClass('form-shift');
    getDataFromApi(STORE.userSearchTerm, displayData);
    $('.js-more-results').removeClass('hidden');
    $('.js-more-results').addClass('block');
  });
}

// Handler for when someone clicks the More Results button at the
// bottom of search results
function handleMoreResults() {
  $('.js-more-results').on('click', function(event) {
    getDataFromApi(STORE.userSearchTerm, displayData);
  });
}

// Handler for when someone clicks on one of the search results, in this
// case, an image
function handleImageClick() {
  $('.js-search-results').on('click', '.js-image', function(event) {
    $('.lightbox').removeClass('hidden');
    $('.selected-image').removeClass('hidden');
    const imgUrl = $(event.currentTarget).parent().find('img').attr('data-index');
    $('.js-selected-image').attr('src', imgUrl);
    const id = $(event.currentTarget).parent().find('img').attr('data-id');
    const secret = $(event.currentTarget).parent().find('img').attr('data-secret');
    getInfoFromApi(id, secret, (response) => {
      displayInfo(response);
      getSizeFromApi(id, (response) => {
        displaySize(response);
      });
    });
  });
}

// Handler for when someone clicks out of the lightbox that appeared for the
// search results they clicked
function handleRemoveLightbox() {
  $('body').on('click', '.lightbox', function(event) {
    $('.js-selected-image').attr('src', '');
    pageRender();
  });
  $(document).keydown(function(event) {
    if (event.keyCode == 27) {
      $('.js-selected-image').attr('src', '');
      pageRender();
    }
  });
}


// Functions for each separate type of data pulling from the Flickr API

// Pulls a set of photos from Flickr based on the search term
function getDataFromApi(searchTerm, callback) {
  const request = {
    method: 'flickr.photos.search',
    api_key: STORE.api_key,
    text: searchTerm,
    format: 'json',
    nojsoncallback: 1,
    per_page: 9,
    page: STORE.onPage,
    safe_search: 1
  };
  $.getJSON(STORE.api_url, request, callback); 
}

// Pulls additional information on a specific photo that the user clicked
// on from Flickr
function getInfoFromApi(photoIdInsert, secretInsert, callback) {
  const request = {
    method: 'flickr.photos.getInfo',
    api_key: STORE.api_key,
    format: 'json',
    nojsoncallback: 1,
    photo_id: photoIdInsert,
    secret: secretInsert,
  };
  $.getJSON(STORE.api_url, request, callback); 
}

// Pulls all the different possible sizes of the photo that the user clicked
// on from Flickr
function getSizeFromApi(photoIdInsert, callback) {
  const request = {
    method: 'flickr.photos.getSizes',
    api_key: STORE.api_key,
    format: 'json',
    nojsoncallback: 1,
    photo_id: photoIdInsert,
  };
  $.getJSON(STORE.api_url, request, callback); 
}


// Functions that determine how to display the data retrieved from the Flickr API

// Puts the search results into the Store and renders them to the HTML
// Increases the page number to indicate what page of the search results the 
// user is on
function displayData(data) {
  STORE.searchResults = data.photos.photo;
  renderImages(data.photos.photo);
  STORE.onPage ++;
}

// Injects the info pulled from Flickr about a photo into the description box
// underneath the lightbox for the focused image
function displayInfo(response) {
  $('.description').append(`
    <h2>${response.photo.title._content}</h2>
    <h4 class="download"></h4>
    `);
  
}

// Injects a download link into the description box underneath the lightbox that
// will open the largest possible size of the image in a new window
function displaySize(response) {
  $('.description').find('.download').html(`
  <a href="${response.sizes.size[response.sizes.size.length-1].source}" target="_blank">Download Here</a>`);
}


// Functions that render the page

// Puts the search result images into divs and injects them into the HTML
function renderImages(results) {
  results.forEach(function(result) {
    $('.js-search-results').append(`<div class="image-item col-4 box">
    <img src="https://farm${result.farm}.staticflickr.com/${result.server}/${result.id}_${result.secret}.jpg" data-index="https://farm${result.farm}.staticflickr.com/${result.server}/${result.id}_${result.secret}.jpg" data-id="${result.id}" data-secret="${result.secret}" class="js-image image">
      <div class="image-data">
      </div>
    </div>`);
  });

}

// Renders the default view of the web app, with no search results and no lightbox
function pageRender() {
  $('.lightbox').addClass('hidden');
  $('.selected-image').addClass('hidden');
  $('.description').html('');
}


// Function to run all of the event handlers
function eventHandlers() {
  handleSearch();
  handleMoreResults();
  handleImageClick();
  handleRemoveLightbox();
  handleAutoSearch();
}

// Runs all of the event handlers when the page loads
$(eventHandlers);