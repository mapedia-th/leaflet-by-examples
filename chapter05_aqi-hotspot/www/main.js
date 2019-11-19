$(document).ready(function () {
    loadMap();
    getHotspot();
    getAqi();

})

var map = L.map('map').setView([14.114433, 101.079177], 6);
var layerControl;

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
}

function getHotspot() {
    var hotspot = L.layerGroup();
    const iconfire = './img/flame.png';
    const icon = L.icon({
        iconUrl: iconfire,
        iconSize: [32, 37],
        iconAnchor: [12, 37],
        popupAnchor: [5, -30]
    });
    $.get('http://localhost:3000/api/hotspot', (res) => {
        $('#sumhp').text('พบจุดความร้อนจำนวน ' + res.count + ' จุด');
        let marker = L.geoJSON(res.data, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {
                    icon: icon,
                    iconName: 'hp',
                    attribute: feature.properties
                });
            },
            onEachFeature: (feature, layer) => {
                if (feature.properties) {
                    layer.bindPopup(
                        'ชื่อ: ' + feature.properties.satellite + '</br>'
                    );
                }
            }
        });
        marker.addTo(hotspot);
        marker.on('click', (e) => {
            $('#desc').text('พิกัดจุดความร้อน lat:' + e.sourceTarget.options.attribute.latitude +
                ' lon:' + e.sourceTarget.options.attribute.latitude +
                'พบวันที่ ' + e.sourceTarget.options.attribute.acq_date)
        })
    })
    layerControl.addOverlay(hotspot.addTo(map), 'hotspot');
}

function getAqi() {
    var aqi = L.layerGroup();
    $.get('http://localhost:3000/api/aqi').done((res) => {
        var dat = res.data.stations;
        dat.forEach(e => {
            let aqiTxt;
            let ic;
            if (e.LastUpdate.AQI.aqi > 200) {
                aqiTxt = 'มีผบกระทบต่อสุขภาพ';
                ic = L.icon({
                    iconUrl: './img/aqi5.png',
                    iconSize: [32, 37],
                    iconAnchor: [12, 37],
                    popupAnchor: [5, -36]
                });
            } else if (e.LastUpdate.AQI.aqi > 101) {
                aqiTxt = 'เริ่มมีผลกระทบต่อสุขภาพ';
                ic = L.icon({
                    iconUrl: './img/aqi4.png',
                    iconSize: [32, 37],
                    iconAnchor: [12, 37],
                    popupAnchor: [5, -36]
                });
            } else if (e.LastUpdate.AQI.aqi > 51) {
                aqiTxt = 'ปานกลาง';
                ic = L.icon({
                    iconUrl: './img/aqi3.png',
                    iconSize: [32, 37],
                    iconAnchor: [12, 37],
                    popupAnchor: [5, -36]
                });
            } else if (e.LastUpdate.AQI.aqi > 26) {
                aqiTxt = 'ดี';
                ic = L.icon({
                    iconUrl: './img/aqi2.png',
                    iconSize: [32, 37],
                    iconAnchor: [12, 37],
                    popupAnchor: [5, -36]
                });
            } else {
                aqiTxt = 'ดีมาก';
                ic = L.icon({
                    iconUrl: './img/aqi1.png',
                    iconSize: [32, 37],
                    iconAnchor: [12, 37],
                    popupAnchor: [5, -36]
                });
            }

            let marker = L.marker([Number(e.lat), Number(e.long)], {
                icon: ic,
                attribute: e
            }).addTo(this.map).bindPopup('<h5>สถานี: ' + e.nameTH + '</h5>' +
                '<br/><span >สถานที่:</span>' + e.areaTH +
                '<br/><span >ค่า AQI:</span>' + e.LastUpdate.AQI.aqi +
                '<br/><span >ระดับคุณภาพอากาศ (AQI):</span>' + aqiTxt +
                '<br/><span >CO:</span>' + e.LastUpdate.CO.value +
                '<br/><span >NO2:</span>' + e.LastUpdate.NO2.value +
                ' <br/><span >O3:</span>' + e.LastUpdate.O3.value +
                '<br/><span >PM10:</span>' + e.LastUpdate.PM10.value +
                '<br/><span >PM25:</span>' + e.LastUpdate.PM25.value +
                '<br/><span >SO2:</span>' + e.LastUpdate.SO2.value +
                ' <br/>ที่มา: กรมควบคุมมลพิษ <br/>http://air4thai.pcd.go.th'
            );
            marker.addTo(aqi);
            marker.on('click', (e) => {
                $('#desc').text('สถานที่' + e.sourceTarget.options.attribute.nameTH +
                    ' พบ ค่า pm 2.5: ' + e.sourceTarget.options.attribute.LastUpdate.PM25.value + ' มคก./ลบ.ม.')
            })
        });
    })
    layerControl.addOverlay(aqi.addTo(map), 'AQI');
}


