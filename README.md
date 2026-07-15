# librenms-geojson / Indoor Map
Show Librenms map with floor view / Indoor Map

https://community.librenms.org/t/can-i-create-a-custom-floormap-floorplan-and-plot-devices-on-it/22963/18?u=lynch4fr

I’ve developed a piece of code to display the Librenms map with a floor selector like https://indoorequal.org.
We’re lucky to have GeoJSON data for our buildings / floors / Ref / name / imported into Leaflet.
(If you want to map your own buildings, you can use JOSM. The fundamentals are briefly explained here: | [JOSM](https://2020.foss4g-oceania.org/hubs/perth/assets/presos/Nimalika%20Fernando%20-%20Let's%20map%20indoors:%20starting%20indoor%20mapping%20with%20OSM.pdf)

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
  - Another example to add a CUSTOM polygone. This polygone exists in [OpenstreetMap](https://www.openstreetmap.org/way/377446987) (right clic -> Query objets) and can be extract on https://overpass-turbo.eu/ and add the CUSTOM polygone to your etage_0.geojson
  -     ...
        [out:json];
        way(377446987);
        (._;>;);
        out body;
        ...
  - Export example just for this polynome CUSTOM
  -     ...
        "comment": "AJOUT 19/05/2026",
        "type": "Feature",
        "properties": {
        "@id": "way/377446987",
        "ref": "Gymnase Cossec",
        "building:levels": "2",
        "building:min_level": "1",
        "building:part": "yes"
        },
        "geometry": {
        "type": "Polygon",
        "coordinates": [[
        [-1.7007167,48.1198155],
        [-1.7006531,48.1198142],
        [-1.7006202,48.1198135],
        [-1.7005859,48.1198128],
        [-1.7005859,48.1198088],
        [-1.7005750,48.1198086],
        [-1.7005645,48.1198083],
        [-1.7004452,48.1198057],
        [-1.7001196,48.1197988],
        [-1.7001194,48.1198038],
        [-1.7001074,48.1200579],
        [-1.7007047,48.1200705],
        [-1.7007167,48.1198155]
        ]]
        }
        },
    
  - IF the polygone doesn't exist on Openstreetmap, you can create your CUSTOM polygone with the software [JOSM](https://josm.openstreetmap.de/)
       -   Add Greffon PicLayer pour avoir un fond de carte [TUTO]([https://josm.openstreetmap.de/](https://www.youtube.com/watch?v=LZ65oFR3cH8)
       - Tracer le batiment
            -  Menu Imagerie -> OpenstreetMap (pour voir les contours du batiment pour etre au plus juste)
            -  Avec outil Batiment : raccourci B ( Opacité 30% )
            -  Si besoin quelques Fusion de noeuds avec le chemin = N
       - Charger un fond de carte NCS/WLC du batiment
            - Menu Imagerie -> Nouveau calque image depuis un fichier
            - Clic droit sur le calque -> Charger l'etalonnage de l'image : file.cal (si non il faut le calibrer avec "oeil+outils" et enregistrer l'etalonnage
       - Tracer les pieces avec outil Tracer : raccourci A       
            - Accrocher 1 noeud à 1 chemin: Approcher le noeud + N
            - Fusionner 2 polys: Selectionner les 2 + MAJ J
            - Diviser 2 polys: Tracer la ligne de separation + ALT X
            - Couper un chemin: Selection le neoud + P
            - Fusionner 2 chemins: selectionner les 2 chemins + C
            - Fusionner les noeuds: selection les noeuds + C
  - TO CONTINUE : Export each data in geojson format  
  - Copy your geojson files to /librenms/html/tiles
- vi /librenms/html/js/librenms.js
  - Add line ~376 [CODE ICI GEOJSON]
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
  - Modify line ~666 Zoom tile.openstreetmap.org
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
  - OR Add your custom style.css
  -      View : lnms config:get webui.custom_css
         Add : lnms config:set webui.custom_css.+ css/custom/styles.css
         cp style.css to /opt/librenms/html/css/custom


TO BE CONTINUE ... here we manage a part of the marker display according to floor.
- vi /librenms/app/Http/Controllers/Maps/MapDataController.php  
  - To add le level floor, we use the librenms Tab "Notes": exemple "etage=0"
  - Add 1 line to 504 
  -           'notes' => $device->notes,
- vi /librenms/resources/views/map/fullscreen.blade.php
  - Insert this 2 lines after line ~123 in function refreshMap() {
  -     ...
        .done(function( data ) {
           //console.log(" Données des équipements reçues :", data);  // DEBUG 
           window.deviceData = data;  // Stockage des données globalement GEOJSON-MARKER
        $.each( data, function( device_id, device ) {
  - If needed :
  -      # chown -R librenms:librenms '/applis/librenms'
         # setfacl -d -m g::rwx /applis/librenms/bootstrap/cache /applis/librenms/storage /applis/librenms/logs /donnees/librenms/rrd
         # chmod -R ug=rwX /applis/librenms/bootstrap/cache /applis/librenms/storage /applis/librenms/logs /donnees/librenms/rrd

  - Insert Line 169 [GEOJSON-MARKER] and  the } // Fin de EACH (!!! NOT USE FOR THE MOMENT !!!)
  -      ...
         } else {
        // Debut GEOJSON-MARKER
                    $.each(data, function(device_id, device) {
                    //    console.log("Données complètes de l’équipement", device_id, device); // DEBUG
                        let etage = null;
                    
                        // Extraire l'étage depuis device.notes (ex: "etage=3")
                        if (device.notes) {
                            const match = device.notes.match(/etage[-= ]?(\S+)/i);
                            if (match) {
                                etage = match[1];
                                console.log("Étage détecté:", device.sname, etage);
                            }
                        }
          // Fin du GEOJSON-MARKER
                        var marker = L.marker(new L.LatLng(device["lat"],device["lng"]), {title: device["sname"], icon: icon, zIndexOffset: z_offset});
                        marker.bindPopup("<a href=\"" + device["url"] + "\"><img src=\"" + device["icon"] + "\" width=\"32\" height=\"32\" alt=\"\"> " + device["sname"] + "</a>");
                        device_marker_cluster.addLayer(marker);
                        device_markers[device_id] = marker;

                        $.each( device["parents"], function( parent_idx, parent_id ) {
                            if (parent_id in data && (data[parent_id]["lat"] != device["lat"] || data[parent_id]["lng"] != device["lng"])) {
                                var line_id = checkParentLink(device, data[parent_id]);
                                links[line_id] = true;
                            }
                        });
                     }); //fin de EACH
                    } // fin de ELSE
                    devices[device_id] = true;


