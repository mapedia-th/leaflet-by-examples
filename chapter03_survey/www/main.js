$(document).ready(function () {
    loadMap();
    getData();
});

var map = L.map('map', {
    center: [16.820378, 100.265787],
    zoom: 13
});
var marker, gps;

function loadMap() {
    var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    });
    var pro = L.tileLayer.wms("http://cgi.uru.ac.th/geoserver/wms?", {
        layers: 'th:province_4326',
        format: 'image/png',
        transparent: true,
        attribution: "http://cgi.uru.ac.th"
    });
    var baseMap = {
        "OSM": osm.addTo(map)
    }
    var overlayMap = {
        "ขอบจังหวัด": pro.addTo(map)
    }
    L.control.layers(baseMap, overlayMap).addTo(map);
}

function onLocationFound(e) {
    gps = L.marker(e.latlng, { draggable: true });
    gps.addTo(map).bindPopup("คุณอยู่ที่นี่").openPopup();
    gps.on('dragend', (e) => {
        console.log(e)
    })
}

function onLocationError(e) {
    console.log(e.message);
}

map.on('locationfound', onLocationFound);
map.on('locationerror', onLocationError);
map.locate({ setView: true, maxZoom: 16 });

$('#fieldForm').submit(function (e) {
    e.preventDefault();
    $("#status").empty().text("File is uploading...");
    const obj = {
        sname: $('#splace').val(),
        stype: $('#stype').val(),
        sdesc: $('#sdesc').val(),
        geom: JSON.stringify(gps.toGeoJSON().geometry)
    }
    $(this).ajaxSubmit({
        data: obj,
        contentType: 'application/json',
        success: function (res) {
            getData()
            $('form :input').val('');
            $("#status").empty().text("");
        }
    });
    return false;
});

function getData() {
    console.log(marker)
    if (marker) {
        map.removeLayer(marker);
    }
    $.get('http://localhost:3000/api/getdata', (res) => {
        // var fs = res.features;
        marker = L.geoJSON(res, {
            pointToLayer: (feature, latlng) => {
                return L.marker(latlng, { draggable: true });
            },
            onEachFeature: (feature, layer) => {
                if (feature.properties) {
                    layer.bindPopup(
                        'ชื่อสถานที่: ' + feature.properties.sname + '</br>' +
                        'ประเภท: ' + feature.properties.stype + '</br>' +
                        'คำอธิบาย: ' + feature.properties.sdesc + '</br>' +
                        '<img src="/upload/' + feature.properties.simg + '" width="250px">'
                    );
                }
            }
        }).on('click', selectMarker);
        marker.addTo(map);
    })
}

$("#edit").attr("disabled", true);
$("#remove").attr("disabled", true);

var pos;
function selectMarker(e) {
    // console.log(e);
    $('#splace').val(e.layer.feature.properties.sname);
    $('#stype').val(e.layer.feature.properties.stype);
    $('#sdesc').val(e.layer.feature.properties.sdesc);
    $("#edit").attr("disabled", false);
    $("#remove").attr("disabled", false);
    pos = {
        geom: '{"type":"Point","coordinates":[' + e.latlng.lng + ',' + e.latlng.lat + ']}',
        id: e.layer.feature.properties.id
    }
    $("#status").empty().text("กำลังแก้ใขข้อมูล..");
}

map.on('click', () => {
    $('form :input').val('');
    $("#edit").attr("disabled", true);
    $("#remove").attr("disabled", true);
    $("#status").empty().text("");
});

function editData() {
    var data = {
        sname: $('#splace').val(),
        stype: $('#stype').val(),
        sdesc: $('#sdesc').val(),
        geom: pos.geom,
        id: pos.id
    }
    $.post('http://localhost:3000/api/update', data, (res) => {
        getData();
        $('form :input').val('');
        $("#status").empty().text("");
    })
}

function deleteData() {
    var data = {
        id: pos.id
    }
    $.post('http://localhost:3000/api/delete', data, (res) => {
        getData();
        $('form :input').val('');
        $("#status").empty().text("");
    })
}

function refreshPage() {
    location.reload(true);
}









