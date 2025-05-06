//DEBUT code GEOJSON
const floorLayers = {};  // Objet pour stocker les couches d'étages
const floorRefLabels = {};      // Stockage des labels "ref" par étage

// Étages disponibles (ajouter plus d'étages si nécessaire)
const floors = [-1, 0.5, 0, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7];  // Liste des étages

// Charger chaque étage via GeoJSON
floors.forEach(floor => {
    fetch(`/tiles/etage_${floor}.geojson`)
        .then(response => response.json())
        .then(data => {
	    const refLabelGroup = L.layerGroup(); // Groupe pour les étiquettes ref
            const layer = L.geoJSON(data, {
                style: {
                    color: '#0074D9',
                    weight: 2,
                    fillOpacity: 0.4
                },
//SECTION Affichage des REF de chaque piece //                
		onEachFeature: function (feature, layer) {
			if (feature.properties.ref || feature.properties.name) {
			    const center = layer.getBounds().getCenter();
			    const labelText = [
			        feature.properties.ref || '',
			        feature.properties.name || ''
			    ].filter(Boolean).join("<br>");  // Affiche "ref – name"
			
			    const tooltip = L.tooltip({
			        permanent: true,
			        direction: 'center',
			        className: 'ref-label'
			    })
			    .setContent(labelText)
			    .setLatLng(center);
			    refLabelGroup.addLayer(tooltip);
			}
                }
// SECTION Affichage des Ref de chaque piece //
            });

            // Stocker la couche de l'étage dans l'objet floorLayers
            floorLayers[floor] = layer;
            floorRefLabels[floor] = refLabelGroup;

            // Par défaut, afficher l'étage 0 (ou un autre étage si tu veux)
            if (floor === 0) {
                layer.addTo(leaflet);
		leaflet.fire('zoomend'); // déclenche la logique d'affichage en fonction du zoom
            }
        })
        .catch(err => console.error(`Erreur lors du chargement de l'étage ${floor}:`, err));
});

// Créer un sélecteur d'étage
const selector = document.createElement('select');
selector.id = 'floorSelect';
selector.style.padding = '5px';
selector.style.backgroundColor = 'white';
selector.style.fontSize = '16px';  // Agrandir la taille de la police ici
selector.style.fontWeight = 'bold';  // Optionnel : rendre la police en gras

// Créer une option pour chaque étage
floors.forEach(floor => {
    const option = document.createElement('option');
    option.value = floor;
    option.textContent = `Étage ${floor}`;
    if (floor === 0) {
        option.selected = true;
    }
    selector.appendChild(option);
});

// Créer un contrôle pour ajouter le sélecteur sur la carte
const floorControl = L.control({ position: 'topleft' });
floorControl.onAdd = function () {
    const div = L.DomUtil.create('div', 'leaflet-control');
    div.appendChild(selector);
    return div;
};

// Ajouter le contrôle à la carte
floorControl.addTo(leaflet);

// Gérer le changement d'étage
selector.addEventListener('change', function () {
    const selected = this.value;

    // Supprimer toutes les couches d’étages et les labels
    Object.keys(floorLayers).forEach(f => {
        leaflet.removeLayer(floorLayers[f]);
        if (floorRefLabels[f]) {
            leaflet.removeLayer(floorRefLabels[f]);
        }
    });

    // Ajouter la couche sélectionnée
    if (floorLayers[selected]) {
        floorLayers[selected].addTo(leaflet);
    }

});

// Affiche ou masque dynamiquement les labels "ref" selon le niveau de zoom
leaflet.on('zoomend', function () {
    const zoom = leaflet.getZoom();
    const selectedFloor = selector.value;

    Object.keys(floorRefLabels).forEach(floor => {
        const refLayer = floorRefLabels[floor];

        if (floor === selectedFloor) {
            if (zoom >= 20) {
                if (!leaflet.hasLayer(refLayer)) {
                    refLayer.addTo(leaflet);
                }
            } else {
                if (leaflet.hasLayer(refLayer)) {
                    leaflet.removeLayer(refLayer);
                }
            }
        } else {
            // Ne jamais afficher les refs des autres étages
            if (leaflet.hasLayer(refLayer)) {
                leaflet.removeLayer(refLayer);
            }
        }
    });
});

//FIN code GEOJSON
