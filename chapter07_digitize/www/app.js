var map = L.map('map').setView([16.738428, 100.212832], 16);

var google = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 18,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
}).addTo(map);

var options = {
    position: 'topleft', // toolbar position, options are 'topleft', 'topright', 'bottomleft', 'bottomright'
    useFontAwesome: true, // use fontawesome instead of geomanIcons (you need to include fontawesome yourself)
    drawMarker: true, // adds button to draw markers
    drawPolyline: true, // adds button to draw a polyline
    drawRectangle: true, // adds button to draw a rectangle
    drawPolygon: true, // adds button to draw a polygon
    drawCircle: true, // adds button to draw a cricle
    cutPolygon: false, // adds button to cut a hole in a polygon
    editMode: true, // adds button to toggle edit mode for all layers
    removalMode: true, // adds a button to remove layers
};

map.pm.addControls(options);




var parcel = new L.GeoJSON.AJAX("/get_parcel", {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map)


function style(feature) {
    return {
        fillColor: '#29a329',
        weight: 2,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

map.on('pm:create', function (e) {
    var lyr = e.layer;
    var geom = (JSON.stringify(lyr.toGeoJSON().geometry));

    $.ajax({
        url: '/api_insert',
        method: 'POST',
        data: ({
            geom: geom,
            mapsheet: "504232850-00",
            land_no: "",
            survey: "",
            scale: "4000",
            land_type: "โฉนดที่ดิน",
            budget: 0
        }),
        success: function (data) {
            console.log('Success insert data ^^');
        },
        error: function () {
            console.log('error insert data!');
        }
    })
});


function onEachFeature(feature, layer) {

    layer.on('pm:edit', function (e) {
        let lyr = e.target;
        let land_id = e.target.feature.properties.id;
        var geom = (JSON.stringify(lyr.toGeoJSON().geometry));
        console.log(land_id);
        console.log(geom);

        $.ajax({
            url: '/api_update',
            method: 'POST',
            data: ({
                geom: geom,
                land_id: land_id
            }),
            success: function (data) {
                console.log('Success update data ^^');
            },
            error: function () {
                console.log('error update data!');
            }
        })
    });

}

map.on('pm:remove', function (e) {
    var land_id = e.layer.feature.properties.id
    $.ajax({
        url: '/api_delete',
        method: 'POST',
        data: ({
            land_id: land_id
        }),
        success: function (data) {
            console.log('Success delete data ^^');
            //parcel.refresh();
        },
        error: function () {
            console.log('error delete data!');
        }
    })
});