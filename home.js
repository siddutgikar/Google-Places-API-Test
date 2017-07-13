var map;
var infowindow;
var placesService;
var locationCoordinates;

var txt_modalSearch;
var txt_modalLocation;
var dd_modalDistance;
var txt_Search;
var txt_Location;
var dd_Distance;
var mapDiv;
var modalDiv;

var detailIcon;
var detailNameDiv;
var detailAddressDiv;
var detailOpenNowDiv;
var detailRatingDiv;
var detailImagesUl;
var detailContainer;
var reviewUl;

var placesList;
var bounds;
var DEFAULT_LOCATION_SFO;
var markerArray = [];
var infoWindowArray = [];
var resultArray = [];




/*************************User Interface Handlers *********************/



window.onload = function() {
    initUI();
    $('#myModal').modal('show');
    var width = mapDiv.width();
    var height = $(window).height();
    $("#map").css("width", width + "px");
    $("#map").css("height", height + "px");
    $("#lstColumn").css("height", height + "px");
    google.maps.event.trigger(map, "resize");
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(GetReverseGeocodingData);
    }
}

window.onresize = function(event) {
    google.maps.event.trigger(map, "resize");
};


function initUI() {
    txt_modalSearch = $('#modalsearch');
    txt_modalLocation = $('#modallocation');
    dd_modalDistance = $('#modaldistance');
    txt_Search = $('#search');
    txt_Location = $('#location');
    dd_Distance = $('#distance');
    mapDiv = $("#map");
    modalDiv = $('#myModal');
    placesList = $('#placeslist');
    detailContainer = $('#detailContainer');
    detailNameDiv = $('#detailName');
    detailAddressDiv = $('#detailAddress');
    detailOpenNowDiv = $('#detailOpenNow');
    detailRatingDiv = $('#detailRating');
    detailImagesUl = $('#detailImages');
    detailIcon = $('#detailIcon');
    reviewUl = $('#reviewUl');

}



function initMap() {
    DEFAULT_LOCATION_SFO = new google.maps.LatLng(37.7749, -122.4194);
    map = new google.maps.Map(document.getElementById('map'), {
        center: DEFAULT_LOCATION_SFO,
        zoom: 8
    });
    infowindow = new google.maps.InfoWindow();
    placesService = new google.maps.places.PlacesService(map);
    bounds = new google.maps.LatLngBounds();
}

function GetElementData(element) {
    return element.val();
}

function SetElementData(element, data) {
    element.val(data);
}


// Add Place as a  List Item 
function AddPlaceToList(place, pos) {
    placesList.append("<li onClick='ListClick(" + pos + ")'><div><div class='placesListName'><span class='lstName'>" + place.name + "</span><span class='stars'>" + place.rating + "</span></div><div class='placesListIcon'><img src='" + place.icon + "' class='lstIcon'></img></div></div><p>" + place.formatted_address + "</p></li>");

}


function CreateMarker(place, position) {

    var placeLoc = place.geometry.location;
    var icon = {
        url: place.icon, // url
        scaledSize: new google.maps.Size(30, 30), // scaled size
        origin: new google.maps.Point(0, 0), // origin
        anchor: new google.maps.Point(0, 0) // anchor
    };

    var marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        icon: icon,

    });

    google.maps.event.addListener(marker, 'click', function() {

        infowindow.setContent('<div class="infoWindowContainer"><img class="infoWindowImage" src="' + place.photos[0].getUrl({
            maxWidth: 120
        }) + '"></img></div><div class="infoWindowText"><b>' + place.name + '</b><div>' + place.formatted_address + '</div><div> Rating: ' + place.rating + '</div></div>');
        infowindow.open(map, this);
        ItemClick(position);
    });
    infoWindowArray.push(infowindow);
    markerArray.push(marker);
    bounds.extend(place.geometry.location);

}
/*************************Service Handlers **************************/

function PlacesServiceCallback(results, status) {
    map = new google.maps.Map(document.getElementById('map'), {
        center: locationCoordinates,
        zoom: 8
    });
    marker = new google.maps.Marker({
        map: map,
        position: locationCoordinates,
        icon: 'https://png.icons8.com/office/50/marker' // null = default icon
    });
    placesList.empty();
    markerArray = [];
    infoWindowArray = [];
    bounds = new google.maps.LatLngBounds();
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        resultArray = results;
        for (var i = 0; i < results.length; i++) {
            CreateMarker(results[i], i);
            AddPlaceToList(results[i], i);
        }
        $('span.stars').stars();
        map.fitBounds(bounds);
        google.maps.event.trigger(map, "resize");

    }
}

function PlacesServiceDetailsCallBack(place, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        FillPlaceDetails(place);
    }
}




function GetReverseGeocodingData(position) {
    locationCoordinates = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    map.setZoom(8);
    map.panTo(locationCoordinates);
    marker = new google.maps.Marker({
        map: map,
        position: locationCoordinates,
        icon: 'https://png.icons8.com/office/50/marker' // null = default icon
    });
    var geocoder = new google.maps.Geocoder();
    var locality = "";
    var state = "";
    var postalcode = "";
    geocoder.geocode({
        'latLng': locationCoordinates
    }, function(results, status) {
        if (status !== google.maps.GeocoderStatus.OK) {

        }
        // This is checking to see if the Geoeode Status is OK before proceeding
        if (status == google.maps.GeocoderStatus.OK) {

            var arrAddress = results[0].address_components;
            // iterate through address_component array
            $.each(arrAddress, function(i, address_component) {
                //alert(address_component.types[0]);
                if (address_component.types[0] == "administrative_area_level_2") { // locality type
                    //return false; // break the loop
                    locality = address_component.long_name + ", ";
                } else if (address_component.types[0] == "administrative_area_level_1") {
                    state = address_component.long_name + ", ";
                } else if (address_component.types[0] == "postal_code") {
                    postalcode = address_component.long_name + ".";;
                }
            });
            SetElementData(txt_Location, locality + state + postalcode);
            SetElementData(txt_modalLocation, locality + state + postalcode);
        }
    });
}

function CallGeoCodeService(queryString, locationString, radius) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({
        "address": locationString
    }, function(results) {
        radius = 1609.34 * radius;
        CallPlacesService(queryString, results[0].geometry.location, radius)
    });
}

// Function that calls the places service
function CallPlacesService(queryString, locCo, radius) {
    locationCoordinates = locCo;
    placesService.textSearch({
        location: locCo,
        radius: radius,
        query: queryString,
    }, PlacesServiceCallback);
}




/*************************Data Handlers ******************************/

// Check if Input string is not empty
function ValidateInput(inputString) {
    if (inputString == undefined || inputString == "" || inputString.trim() == "")
        return false;
    else
        return true;
}

// Function to fill the details of a place
function FillPlaceDetails(place) {
    detailNameDiv.html(place.name);
    if (place.hasOwnProperty('rating')) {
        detailRatingDiv.html(place.rating);
    }
    var addr;
    if (place.hasOwnProperty('formatted_address')) {
        addr = "<i class='fa fa-4x fa-map-marker' aria-hidden='true'></i>&emsp;&emsp;" + place.formatted_address;
    }
    if (place.hasOwnProperty('formatted_phone_number')) {
        detailAddressDiv.html("<div>" + addr + "<br><i class='fa fa-4x fa-phone' aria-hidden='true'></i>&emsp;&emsp;" + place.formatted_phone_number + "</div>");
    } else {
        detailAddressDiv.html("<div>" + addr + "</div>");
    }
    if (place.hasOwnProperty('opening_hours') && place.opening_hours.hasOwnProperty('open_now')) {
        if (place.opening_hours.open_now == "true") {

            detailOpenNowDiv.html("Open Now: &emsp;<i>Yes</i>");
        } else {
            detailOpenNowDiv.html("Open Now: &emsp;<i>No</i>");
        }

    }

    if (place.hasOwnProperty('icon')) {
        detailIcon.attr("src", place.icon);
    }
    if (place.hasOwnProperty('photos')) {
        if (place.photos.length > 0) {
            detailImagesUl.empty();
            for (var i = 0; i < place.photos.length; i++) {
                detailImagesUl.append("<li><img src='" + place.photos[i].getUrl({
                    maxHeight: 100
                }) + "'></img></li>");
            }
        }
    }
    if (place.hasOwnProperty('reviews')) {
        var reviewArray = place.reviews;
        var topReviews = Math.min(5, reviewArray.length);
        reviewUl.empty();
        for (var i = 0; i < topReviews; i++) {

            reviewUl.append('<li><div class="container-fluid innerContainer"><div class="row innerContainer"><div class="col-sm-3 innerContainer"><img class="reviewPic" src="' + reviewArray[i].profile_photo_url + '" alt="Image Not Found" title="Image Not Found"></img></div><div class="col-sm-9 innerContainer"><b>' + reviewArray[i].author_name + '</b>&emsp;<i>' + reviewArray[i].relative_time_description + '</i><br><span class="stars">' + reviewArray[i].rating + '</span></div></div></div></li>');

        }
    }
    $('#detailContainer span.stars').stars();
    detailContainer.css("display", "block");

    placesList.css("display", "none");
    detailContainer.animate({
        left: 0,

    }, 500, function() {
        // Animation complete.
    });

}

/*************************Click Handlers******************************/

// Function to Close the details Bar reposition the Map 
function CloseDesc() {
    detailContainer.animate({
        left: "-100%",
    }, 500, function() {
        detailContainer.css("display", "none");
    });
    placesList.css("display", "block");
    infoWindowArray[focusMarker].close();
    map.fitBounds(bounds);
    map.panTo(bounds);

}

// Map Marker click Handler
function ItemClick(position) {
    focusMarker = position;
    var request = {
        placeId: resultArray[position].place_id
    };
    placesService.getDetails(request, PlacesServiceDetailsCallBack);
    map.setZoom(14);
    map.panTo(markerArray[position].getPosition());
}

// List Item CLick handler
function ListClick(position) {
    google.maps.event.trigger(markerArray[position], 'click');
}

/// Modal Search Click
function ModalSearchClick() {
    var queryString = GetElementData(txt_modalSearch);
    var radius = GetElementData(dd_modalDistance);
    var locationString = GetElementData(txt_modalLocation);
    if (ValidateInput(queryString) && ValidateInput(locationString)) {
        SetElementData(txt_Search, queryString);
        SetElementData(txt_Location, locationString);
        CallGeoCodeService(queryString, locationString, radius);
        modalDiv.modal('hide');
    } else {
        alert("Please enter Search String and Location to continue");
    }

}
///  Search Click on the bar
function SearchClick() {
    var queryString = GetElementData(txt_Search);
    var radius = GetElementData(dd_Distance);
    var locationString = GetElementData(txt_Location);
    if (ValidateInput(queryString) && ValidateInput(locationString)) {
        CallGeoCodeService(queryString, locationString, radius);
    } else {
        alert("Please enter Search String and Location to continue");
    }
}



/// Function to display the Rating in form of Stars 
$.fn.stars = function() {
    return $(this).each(function() {
        // Get the value
        var val = parseFloat($(this).html());
        // Make sure that the value is in 0 - 5 range, multiply to get width
        var size = Math.max(0, (Math.min(5, val))) * 16;
        // Create stars holder
        var $span = $('<span />').width(size);
        // Replace the numerical value with stars
        $(this).html($span);
    });
}