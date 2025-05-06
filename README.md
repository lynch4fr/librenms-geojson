# librenms-geojson
Show Librenms map with floor view

https://community.librenms.org/t/can-i-create-a-custom-floormap-floorplan-and-plot-devices-on-it/22963/18?u=lynch4fr

I’ve developed a piece of code to display the Librenms map with a floor selector like https://indoorequal.org.
We’re lucky to have GeoJSON data for our buildings / floors / Ref / name / imported into Leaflet.
Here’s the result if you’re interested. This add-on is not in the form of a plugin, so you’ll have to modify the files manually each time you update (./daily.sh).

The steps :
- Check that your buildings have a floor view on: https://indoorequal.org | [UR2](https://indoorequal.org/#map=17.24/48.119363/-1.702712&level=0).
- Export your building geojson files to https://overpass-turbo.eu/
- Copy your geojson files to /librenms/html/tiles
- Modify the code /librenms/html/js/librenms.js
- Modify the code /librenms/html/css/styles.css

Thanks to Adrien: panieravide@riseup.net

The steps in detail:
- On https://overpass-turbo.eu/ | [UR2](https://overpass-turbo.eu/?Q=%5Bout%3Ajson%5D%3B%0Away%28110270764%29%3Bmap_to_area%20-%3E%20.searchArea%3B%0A%0A%28%0A%20%20%09nwr%5B%22building%22%5D%28area.searchArea%29%3B%0A%09nwr%5B%22indoor%22%5D%28area.searchArea%29%3B%0A%09nwr%5B%22highway%22%5D%28area.searchArea%29%3B%0A%29%3B%0A%0Aout%20body%3B%0A%3E%3B%0Aout%20skel%20qt%3B&C=48.119369%3B-1.700518%3B17&R=#).
  -  Run this example for le floor 1 and each floors
  -     ...
        [out:json][timeout:25];
        // On utilise un identifiant de relation ou way spécifique
        way(110270764)->.searchWay;
        way(pivot.searchWay)->.searchArea;
        // Récupère les objets indoor ou building avec level=1
        (
        nwr["indoor"]["level"="1"](area.searchArea);
        nwr["building"]["level"="1"](area.searchArea);
        );
        out body;
        >;
        out skel qt;
        ...
  - Export each data in geojson format
  - Copy your geojson files to /librenms/html/tiles
- vi /librenms/html/js/librenms.js
  - Add line 277
  -           ...
            leaflet = L.map(id, {
                preferCanvas: true,
                zoom: config.zoom !== undefined ? config.zoom : 3,
                center: (config.lat !== undefined && config.lng !== undefined) ? [config.lat, config.lng] : [40,-20],
            });
            [CODE ICI GEOJSON]
            window.maps[id] = leaflet;
            let baseMaps = {};
            ...
- vi /librenms/html/js/librenms.js
  - Modify line 384
  -          ...
        leaflet.setMaxZoom(24); // 20 in 24
            ...
- vi /librenms/html/css/style.css
  - Add
  -           ...
        .ref-label {
         font-size: 18px !important; 
        color: black !important;
        background: none !important;
        border: none !important;
        box-shadow: none !important;
        text-align: center;
        line-height: 1;
        }
        ....
    -
