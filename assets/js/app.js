var map;
var service;
var infowindow;



function initialize() {
    
    /**
     * BASIC MAP
     */
    let fei = {lat: 48.151854173169156, lng: 17.073254174433746};
    map = new google.maps.Map(document.getElementById('map'), {
        center: fei,
        zoom: 16
    });


    

    // Create the search box and link it to the UI element.
    const input = document.getElementById("pac-input");
    const searchBox = new google.maps.places.SearchBox(input);

    
    input.addEventListener('change', () => {
        console.log('validate')
        if( ! searchBox.getPlaces() ) {
            makeInvalid( input )
        } else {
            makeValid( input )
        }
    })
    searchBox.addListener('places_changed', () => {
        if( ! searchBox.getPlaces() ) {
            makeInvalid( input )
        } else {
            makeValid( input )
        }
    })



    const form = document.getElementById( 'findRouteForm' )

    // Bias the SearchBox results towards current map's viewport.
    map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds());
    });
    const panorama = new google.maps.StreetViewPanorama(
        document.getElementById("pano"),
        {
            position: fei,
            pov: {
            heading: -11,
            pitch: 10,
            },
        }
    );
    let markers = [];


    // THIS WE NEED FOR ROUTE FINDING
    var directionsService = new google.maps.DirectionsService();
    var directionsRenderer = new google.maps.DirectionsRenderer();

    // FORM TO FIND ROUTE SUBMIT -> CALCULATE ROUTE AND ALL THAT STUFF
    form.addEventListener("submit", (e) => {
        e.preventDefault()
        let vehicleName;
        const vehicleInputs = Array.from( document.querySelectorAll('input[name="vehicle"]') )
        
        
        vehicleInputs.forEach( vehicle => {
            if( vehicle.checked ) {
                vehicleName = vehicle.value
            }
        } )


        let places = searchBox.getPlaces();
        if( ! places ) {
            makeInvalid( input )
            
        } else {
            makeValid( input )
            calcRoute(places[0].geometry.location, fei, directionsService, directionsRenderer, vehicleName)
        }
    });
    directionsRenderer.setMap(map);


    // MARKER POINTING TO FEI
    const marker = new google.maps.Marker({
      position: fei,
      map: map,
      animation: google.maps.Animation.DROP,
      title: 'Fakulta elektrotechniky a informatiku STU'
    });

    // CREATING POPUP
    const infowindow = new google.maps.InfoWindow({
        content: `${fei.lat}, ${fei.lng}`
    })

    // EVENT LISTENER FOR MAIN MARKER POPUP
    marker.addListener("click", () => {
        infowindow.open(map, marker);
    });


    // REQUEST FOR BUS STOPS
    const request = {
        location: fei,
        radius: '500',
        type: ['transit_station']
    };
    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, callback);

   


}

function makeInvalid( input ) {
    input.classList.add( 'is-invalid' )
}

function makeValid( input ) {
    input.classList.remove( 'is-invalid' )
}


function showAlert( content, type ) {
    const alertHolder = document.getElementById('message')
    alertHolder.innerHTML = '<div class="alert alert-' + type + ' mt-2">' + content + '</div>'
    
}

function calcRoute(start, end, directionsService, directionsRenderer, vehicleName) {
   
    var request = {
        origin: start,
        destination: end,
        travelMode: vehicleName
    };
    directionsService.route(request, function(result, status) {
        if( ! result.routes ) {
            showAlert( 'Trasu nie je možné nájsť', 'warning' )
        }
        let routeInfo = result.routes[0].legs[0]
        console.log(routeInfo)
        // document.getElementById('message').innerHTML = '<div class="alert alert-info mt-2">' + routeInfo.distance.text + '<br>' + routeInfo.duration.text + '</div>'
        showAlert( routeInfo.distance.text + '<br>' + routeInfo.duration.text, 'info' )
        if (status == 'OK') {
            directionsRenderer.setDirections(result);
        } else {
          console.log('something went wrong')
        }
    });
}



function callback(results, status) {
  if (status == google.maps.places.PlacesServiceStatus.OK) {
    for (var i = 0; i < results.length; i++) {
      createMarker(results[i]);
    }
  }
}


function createMarker(place) {
    const marker = new google.maps.Marker({
        map,
        position: place.geometry.location,
        icon: {
            url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
        }
    });
    // google.maps.event.addListener(marker, "click", () => {
    // //   infowindow.setContent(place.name);
    // //   infowindow.open(map);
    // });
  }

