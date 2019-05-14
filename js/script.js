const about_button_element = document.querySelector('#about-button'),
      about_element = document.querySelector('div#about');

function listenForMouseDown(event) {
  if (!about_button_element.contains(event.target) && !about_element.contains(event.target) && about_element.classList.contains('on')) {
    console.log('MouseDown outside of About Element was detected while About Element was on.');
    hideAboutElement();
  }
}

function hideAboutElement() {
  about_button_element.classList.remove('on');
  about_element.classList.remove('on');
  setTimeout( ()=>{ about_element.style.display = 'none'; }, 500);
  document.removeEventListener('mousedown', listenForMouseDown);
}

function showAboutElement() {
  about_button_element.classList.add('on');
  about_element.style.display = 'block';
  setTimeout( ()=>{ about_element.classList.add('on'); }, 1);
  document.addEventListener('mousedown', listenForMouseDown);
}

about_button_element.addEventListener('click', () => {
  if (!about_element.classList.contains('on')) {
    showAboutElement();
  } else {
    hideAboutElement();
  }
});

const options_button_element = document.querySelector('span options-button'),
      options_element = document.querySelector('div options');









// For watercolor tiles (from Stamen)
const TILE_URL = 'http://c.tile.stamen.com/watercolor/{z}/{x}/{y}.jpg';
let map, mapEl, layer, layerID = 'my-custom-layer';

function getCoordinateData() {
  return new Promise(function(resolve, reject) {
    Papa.parse("data/data-world-190128.csv", {
      download: true,
      // header: true,
      complete: function(results) {
        console.log("Finished parsing coordinates");
        // console.log(results);
        resolve(results.data);
      },
      error: function(error) {
        console.error(error);
        reject(error);
      }
    });
  });
}


async function initMap() {

  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 2,
    center: {lat: 0, lng: 0},
    minZoom: 2,
    mapTypeControl: false,
    fullscreenControl: false,
    styles: mapStyles
  });


  // Create the search box and link it to the UI element.
  var input = document.getElementById('search-bar');
  var searchBox = new google.maps.places.SearchBox(input);
  // map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }

      // Create a marker for each place.
      markers.push(new google.maps.Marker({
        map: map,
        icon: 'images/markers/single/search.svg',
        title: place.name,
        position: place.geometry.location,
        optimized: false,
        zIndex: 999999
      }));

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });




  // Add some markers to the map.
  try {
    const coordinates = await getCoordinateData();
    let markers = coordinates.map(function(coordinate, i) {
      return new google.maps.Marker({
        position: {lat: Number(coordinate[0]), lng: Number(coordinate[1])},
        // icon: 'images/markers/single/marker'+Math.floor(Math.random()*4)+'.svg'
        icon: 'images/markers/single/marker5.svg'
      });
    });
    let markerCluster = new MarkerClusterer(map, markers, {
      gridSize: 64,
      maxZoom: 12,
      zoomOnClick: false
    });
    document.getElementById('map').style.opacity = 1;
  } catch(error) {
    console.error(error);
  }

}