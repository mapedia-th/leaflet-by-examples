$(document).ready(function () {
    loadMap();
    getPoi();
})

var map = L.map('map').setView([17.020783, 100.563101], 9);
var r;

function loadMap() {
    const Mapnik = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    const pro = L.tileLayer.wms('http://www.cgi.uru.ac.th/geoserver/ows?', {
        layers: 'th:province_4326',
        format: 'image/png',
        transparent: true,
        zIndex: 5,
        CQL_FILTER: 'pro_code=65'
    });
    const amp = L.tileLayer.wms('http://www.cgi.uru.ac.th/geoserver/ows?', {
        layers: 'th:amphoe_4326',
        format: 'image/png',
        transparent: true,
        zIndex: 5,
        CQL_FILTER: 'pro_code=65'
    });

    var baseMap = {
        "OSM": Mapnik.addTo(map)
    }
    var overlayMap = {
        "ขอบเขตจังหวัด": pro.addTo(map),
        "ขอบเขตอำเภอ": amp.addTo(map),
    }
    L.control.layers(baseMap, overlayMap).addTo(map);

    r = L.Routing.control({
        waypoints: [L.latLng(57.74, 11.94), L.latLng(57.6792, 11.949)],
        routeWhileDragging: true,
        showAlternatives: true,
        fitSelectedRoutes: true
    }).on('routesfound', function (e) {
        var routes = e.routes[0];
        var km = (routes.summary.totalDistance / 1000).toFixed(2);
        var d = Number(routes.summary.totalTime);
        var h = Math.floor(d / 3600);
        var m = Math.floor(d % 3600 / 60);
        var hDisplay = h > 0 ? h + (h == 1 ? " ชั่วโมง, " : " ชั่วโมง, ") : "";
        var mDisplay = m > 0 ? m + (m == 1 ? " นาที " : " นาที ") : "";
        $("#distance").empty().text(" ระยะทางรวม " + km + " กิโลเมตร");
        $("#time").empty().text(hDisplay + mDisplay);
    }).addTo(map);
    r.hide();
    var itineraryShown = false;
    var controlContainer = r.getContainer();
    var legendClickArea = document.createElement("DIV");
    legendClickArea.classList.add('legendClickArea');
    controlContainer.appendChild(legendClickArea);
    legendClickArea.onclick = function () {
        if (itineraryShown)
            r.hide();
        else {
            r.show();
        }
        itineraryShown = !itineraryShown;
    };
}

function getPoi() {
    $.get('http://localhost:3000/api/getpoi', (res) => {
        $.each(res.features, (key, val) => {
            $('#start').append(`<option data-value='{"lat":${val.properties.lat},"lon":${val.properties.lon}}'>${val.properties.t_name}</option>`);
            $('#end').append(`<option data-value='{"lat":${val.properties.lat},"lon":${val.properties.lon}}'> ${val.properties.t_name} </option>`);
        });
    })
    var start, end;
    $("#start").change(function () {
        start = L.latLng($('#start').find(":selected").data("value").lat, $('#start').find(":selected").data("value").lon);
        console.log(start, end)
        r.setWaypoints([
            start,
            end
        ]);
    });
    $("#end").change(function () {
        end = L.latLng($('#end').find(":selected").data("value").lat, $('#end').find(":selected").data("value").lon);
        console.log(start, end)
        r.setWaypoints([
            start,
            end
        ]);
        r.show();
    });
}

// function secondsToHms(s) {
//     d = Number(s);
//     var h = Math.floor(d / 3600);
//     var m = Math.floor(d % 3600 / 60);
//     var s = Math.floor(d % 3600 % 60);

//     var hDisplay = h > 0 ? h + (h == 1 ? " hour, " : " hours, ") : "";
//     var mDisplay = m > 0 ? m + (m == 1 ? " minute, " : " minutes, ") : "";
//     var sDisplay = s > 0 ? s + (s == 1 ? " second" : " seconds") : "";
//     return hDisplay + mDisplay + sDisplay;
// }

// function toKM(d) {
//     var km = d / 1000;
//     return km;
// }