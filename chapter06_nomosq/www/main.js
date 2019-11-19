$(document).ready(function () {
    loadMap();

})

var map = L.map('map').setView([14.114433, 101.079177], 6);
var marker;

function loadMap() {
    const Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    const pro = L.tileLayer.wms('http://www.cgi.uru.ac.th/geoserver/ows?', {
        layers: 'th:province_4326',
        format: 'image/png',
        transparent: true,
        zIndex: 5
    });
    const amp = L.tileLayer.wms('http://www.cgi.uru.ac.th/geoserver/ows?', {
        layers: 'th:amphoe_4326',
        format: 'image/png',
        transparent: true,
        zIndex: 5
    });

    var baseMap = {
        "OSM": Mapnik.addTo(map)
    }
    layerControl = L.control.layers(baseMap).addTo(map);
    layerControl.addOverlay(pro.addTo(map), 'ขอบเขตจังหวัด');
    layerControl.addOverlay(amp.addTo(map), 'ขอบเขตอำเภอ');

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);
    map.locate({ setView: true, maxZoom: 16 });
}
var latlon;
function onLocationFound(e) {
    latlon = e.latlng;
    marker = L.marker(e.latlng, { draggable: true });
    marker.addTo(map).bindPopup("คุณอยู่ที่นี่").openPopup();
    getDisease(latlon.lat, latlon.lng);
    marker.on('dragend', (e) => {
        latlon = {
            lat: e.target._latlng.lat,
            lon: e.target._latlng.lng
        };
        getDisease(latlon.lat, latlon.lon);
    })
}

function onLocationError(e) {
    console.log(e.message);
}

function getDisease(lat, lon) {
    var disease = L.layerGroup();
    var buff = $("#radius").val();
    const icon = './img/cross.png';
    const iconMarker = L.icon({
        iconUrl: icon,
        iconSize: [32, 35],
        iconAnchor: [12, 37],
        popupAnchor: [5, -36]
    });
    map.eachLayer((lyr) => {
        console.log(lyr);
        if (lyr.options.iconName == 'dengue') {
            map.removeLayer(lyr);
        }
    });
    $.get('http://localhost:3000/api/disease/' + lat + '/' + lon + '/' + buff).done((res) => {
        var dat = res.data;
        var cnt = 0;
        dat.forEach(e => {
            marker = L.marker([Number(e.lat), Number(e.lon)], {
                icon: iconMarker,
                iconName: 'dengue'
            }).addTo(this.map).bindPopup(
                '<br/><span >สถานที่: ต.</span>' + e.tam_name +
                '<br/><span >ป่วย: </span>' + e.disease
            );
            cnt += 1;
            $("#count").text("พบผู้ป่วย " + cnt + " แห่ง");
        });
    })
    layerControl.addOverlay(disease.addTo(map), 'ผู้ป่วย');
}

$("#radius").change(() => {
    getDisease(latlon.lat, latlon.lon);
})


// function refresh() {
//     location.reload();
// }

