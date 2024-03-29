        var map = L.map('map', {
          center: [40, -110],
          zoom: 4,
          minZoom: 4,
        });
        var tiles = L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base//MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
          });
        tiles.addTo(map);
        //
        // Spotlight circle
        //
        var radiusCircle = L.circle([0, 0], 500000, {
          fillColor: 'white',
          fillOpacity: .1,
          color: 'white',
          opacity: .3,
          stroke: false,
          weight: 1,
        }).addTo(map);
        //
        // Creates map layers
        //
        var layerInfo = {
          nuclearLayer: {
            source: "Nuclear",
            color: 'crimson'
          },
          hydroLayer: {
            source: "Hydro",
            color: '#00B1A6'
          },
          solarLayer: {
            source: "Solar",
            color: 'orange'
          }
        };
        //
        var geoJsonLayers = {};
        for (var layer in layerInfo) {
          geoJsonLayers[layer] = L.geoJson(plants, {
            pointToLayer: function (feature, latlng) {
              return L.circleMarker(latlng, layerInfo)
            },
            filter: function (feature) {
              if (feature.properties.fuel_source[layerInfo[layer].source]) {
                return feature;
              }
            },
            style: function (feature) {
              return {
                color: layerInfo[layer].color,
                weight: 1,
                fillColor: layerInfo[layer].color,
                radius: getRadius(feature.properties.fuel_source[layerInfo[layer].source])
              }
            }
          }).addTo(map);
        }
        //
        // Circle marker radius equation
        //
        function getRadius(val) {
          var radius = Math.sqrt(val / Math.PI);
          return radius * .5;
        }
        //
        // Legend
        //
        var sourcesLabels = {
          "<b style='color:#00B1A6'>Hydro</b>": geoJsonLayers.hydroLayer,
          "<b style='color:orange'>Solar</b>": geoJsonLayers.solarLayer,
          "<b style='color:crimson'>Nuclear</b>": geoJsonLayers.nuclearLayer
        }
        L.control.layers(null, sourcesLabels, {
          collapsed: false,
          position: 'bottomright'
        }).addTo(map);
        //
        // Sends nuclear layer to bottom when toggled on
        //
        map.on("overlayadd", function (e) {
          geoJsonLayers.nuclearLayer.bringToBack();
        });
        //
        // Sends solar layer to top when toggled on
        //
        map.on("overlayadd", function (e) {
          geoJsonLayers.solarLayer.bringToFront();
        });
        //
        // Creates distance display and popups
        //
        map.on('click', function (e) {
          radiusCircle.setLatLng(e.latlng);
          for (var l in layerInfo) {
            geoJsonLayers[l].eachLayer(function (layer) {
              var distance = e.latlng.distanceTo(layer.getLatLng()) / 1000;
              if (distance > 500) {
                layer.setStyle({
                  stroke: false,
                  fill: false
                });
              } else {
                layer.setStyle({
                  stroke: true,
                  fill: true
                });
                layer.bindPopup("Name: <b>" + layer.feature.properties.plant_name + "</b><br>" +
                  "Fuel Type: <b>" + layerInfo[l].source + "</b><br>" + "Output: <b>" +
                  layer.feature.properties.capacity_mw.toLocaleString() +
                  " MW</b><br><br>" + "This location is <b>" + distance.toLocaleString() +
                  " km</b><br> from the click point.");
              }
            });
          }
        });
        //
        // Title
        //
        var textLatLng = [55, -148];
        var myTextLabel = L.marker(textLatLng, {
          icon: L.divIcon({
            className: 'text-title',
            html: 'U.S. Nuclear, Hydroelectric and Solar Power Plants'
          }),
          zIndexOffset: 1000
        }).addTo(map);
        //
        // Main text
        //
        var textLatLng = [49.5, -148];
        var myTextLabel = L.marker(textLatLng, {
          icon: L.divIcon({
            className: 'text-main',
            html: 'This interactive bivariate web map displays nuclear, hydroelectric, and solar power plants within the United States, symbolized by fuel source and energy output. The proportional circle symbols indicate the amount of power produced from one fuel source. The user should first click any blank area on the map to visually filter power plants within 500 kilometers from the click location, then click on a power plant location circle to display its attributes and distance from the original click point. <br><br>Data Source: <a href="  https://www.eia.gov/electricity/data/eia923/" style="color: orange">U.S. Energy Information Administration</a>. Map authored by Lis Fano and created on 09/06/2016 for New Maps Plus MAP672.'
          }),
          zIndexOffset: 1000
        }).addTo(map);