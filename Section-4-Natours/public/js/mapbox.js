/* eslint-disable */

export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoicmljZXBvbzEyMyIsImEiOiJja2c1MzFxNWMwcWtpMnFxbnl0bXJ0b3JoIn0.tTwmHIKnlS1NEEqBNtFecA';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ricepoo123/ckg534ywa1xnu19obr98hzn88',
    scrollZoom: false,
    // center: [-118.137908, 34.156172],
    // zoom: 4,
    // interactive: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    // Create and add marker (class)
    const el = document.createElement('div');
    el.className = 'marker';

    // Add Marker to mapbox
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 30,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
