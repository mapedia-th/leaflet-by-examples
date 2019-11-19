var mymap = L.map('mapid').setView([13.082371, 100.795168], 6);

var BlackAndWhite = L.tileLayer('http://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(mymap);


function getColor(d) {
    return d > 5000000 ? '#0d1a26' :
        d > 3000000 ? '#19334d' :
        d > 1000000 ? '#2d5986' :
        d > 500000 ? '#3973ac' :
        d > 100000 ? '#538cc6' :
        '#8cb3d9';
}

function style(feature) {
    return {
        weight: 1,
        opacity: 1,
        color: '#ecf2f9',
        dashArray: '3',
        fillOpacity: 1,
        fillColor: getColor(feature.properties.pop_mf)
    };
}



var info = L.control();
info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info');
    this.update();
    return this._div;
};
info.update = function (props) {
    this._div.innerHTML = '<h4>Thailand Population Density</h4>' + (props ?
        '<b>' + props.name_area + '</b><br />' + props.pop_mf + ' people ' :
        'Hover over a area');
};
info.addTo(mymap);




var parcel = L.layerGroup();
parcel.addTo(mymap);

function highlightFeature(e) {
    var layer = e.target;
    info.update(layer.feature.properties);
}


function zoomToFeature(e) {
    mymap.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        click: zoomToFeature
    });
}


$.getJSON("api_province", function (data) {
    var geojson = L.geoJson(data, {
        style: style,
        onEachFeature: onEachFeature
    })
    geojson.addTo(parcel);
    mymap.fitBounds(geojson.getBounds());
})


var legend = L.control({
    position: 'bottomright'
});

legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
        grades = [0, 100000, 500000, 1000000, 3000000, 5000000],
        labels = [],
        from, to;

    for (var i = 0; i < grades.length; i++) {
        from = grades[i];
        to = grades[i + 1] - 1;

        labels.push(
            '<i style="background:' + getColor(from + 1) + '"></i> ' +
            from + (to ? '&ndash;' + to : '+') + ' คน');
    }

    div.innerHTML = labels.join('<br>');
    return div;
};

legend.addTo(mymap);




$.getJSON("/api_chart", function (data) {

    var categories = [];
    for (var i = 0; i < data.rows.length; i++) {
        categories.push(data.rows[i].year_pop);
    }
    var data_vale = [];
    for (var i = 0; i < data.rows.length; i++) {
        data_vale.push(Number(data.rows[i].pop_mf));
    }

    Highcharts.chart('container', {
        chart: {
            type: 'area'
        },
        title: {
            text: 'Population Rate 2011 - 2016'
        },
        legend: {
            layout: 'vertical',
            align: 'left',
            verticalAlign: 'top',
            x: 100,
            y: 70,
            floating: true,
            borderWidth: 1,
            backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF'
        },
        xAxis: {
            categories: categories
        },
        yAxis: {
            title: {
                text: 'Year'
            }
        },
        plotOptions: {
            area: {
                fillOpacity: 0.5
            }
        },
        credits: {
            enabled: false
        },
        series: [{
            name: 'Population',
            data: data_vale,
            color: '#19334d'
        }]
    });

    Highcharts.chart('container2', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'pie'
        },
        title: {
            text: 'Male and female rates  2016'
        },
        tooltip: {
            pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: false
                },
                showInLegend: true
            }
        },
        credits: {
            enabled: false
        },
        series: [{
            name: 'value',
            colorByPoint: true,
            data: [{
                name: 'Male',
                y: Number(data.rows[4].pop_m),
                color: '#2d5986'
            }, {
                name: 'Female',
                y: Number(data.rows[4].pop_f),
                color: '#8cb3d9'
            }]
        }]
    });

})





$("#form_query").submit(function (event) {
    event.preventDefault();
    parcel.clearLayers();
    var province = event.target.province.value
    var amphoe = event.target.amphoe.value
    var tambon = event.target.tambon.value

    $.ajax({
        url: '/api_province_search',
        method: 'post',
        data: ({
            province: province,
            amphoe: amphoe,
            tambon: tambon
        }),
        success: function (data) {
            var geojson = L.geoJson(data, {
                style: style,
                onEachFeature: onEachFeature
            })
            geojson.addTo(parcel);
            mymap.fitBounds(geojson.getBounds());
        },
        error: function () {
            console.log('error  data!');
        }
    })


    $.ajax({
        url: '/api_chart_search',
        method: 'post',
        data: ({
            province: province,
            amphoe: amphoe,
            tambon: tambon
        }),
        success: function (data) {
            var categories = [];
            for (var i = 0; i < data.rows.length; i++) {
                categories.push(data.rows[i].year_pop);
            }
            var data_vale = [];
            for (var i = 0; i < data.rows.length; i++) {
                data_vale.push(Number(data.rows[i].pop_mf));
            }

            Highcharts.chart('container', {
                chart: {
                    type: 'area'
                },
                title: {
                    text: 'Population Rate 2011 - 2016'
                },
                legend: {
                    layout: 'vertical',
                    align: 'left',
                    verticalAlign: 'top',
                    x: 100,
                    y: 70,
                    floating: true,
                    borderWidth: 1,
                    backgroundColor: Highcharts.defaultOptions.legend.backgroundColor || '#FFFFFF'
                },
                xAxis: {
                    categories: categories
                },
                yAxis: {
                    title: {
                        text: 'Year'
                    }
                },
                plotOptions: {
                    area: {
                        fillOpacity: 0.5
                    }
                },
                credits: {
                    enabled: false
                },
                series: [{
                    name: 'Population',
                    data: data_vale,
                    color: '#19334d'
                }]
            });

            Highcharts.chart('container2', {
                chart: {
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                    type: 'pie'
                },
                title: {
                    text: 'Male and female rates  2016'
                },
                tooltip: {
                    pointFormat: '{series.name}: <b>{point.percentage:.1f}%</b>'
                },
                plotOptions: {
                    pie: {
                        allowPointSelect: true,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false
                        },
                        showInLegend: true
                    }
                },
                credits: {
                    enabled: false
                },
                series: [{
                    name: 'value',
                    colorByPoint: true,
                    data: [{
                        name: 'Male',
                        y: Number(data.rows[4].pop_m),
                        color: '#2d5986'
                    }, {
                        name: 'Female',
                        y: Number(data.rows[4].pop_f),
                        color: '#8cb3d9'
                    }]
                }]
            });
        },
        error: function () {
            console.log('error  data!');
        }
    })

});




$(document).ready(function () {

    load_json_data('จังหวัด');


    function load_json_data(id, parent_id) {
        var html_code = '';
        var list = [];
        var list = list_province.province_list.concat(list_province.amphoe_list).concat(list_province.tambon_list);
        console.log(list)

        html_code += '<option value="%">-- Select --</option>';
        $.each(list, function (key, value) {

            if (id == 'จังหวัด') {
                if (value.parent_id == '0') {
                    html_code += '<option value="' + value.id + '">' + value.name +
                        '</option>';
                }
            } else {
                if (value.parent_id == parent_id) {
                    html_code += '<option value="' + value.id + '">' + value.name +
                        '</option>';
                }
            }
        });
        $('#' + id).html(html_code);
    }

    $(document).on('change', '#จังหวัด', function () {
        var amphoe_id = $(this).val();
        if (amphoe_id != '') {
            load_json_data('อำเภอ', amphoe_id);
        } else {
            $('#อำเภอ').html('<option value="%">-- Select --</option>');
        }
        $('#ตำบล').html('<option value="%">-- Select --</option>');
    });
    $(document).on('change', '#อำเภอ', function () {
        var tambon_id = $(this).val();
        if (tambon_id != '') {
            load_json_data('ตำบล', tambon_id);
        } else {
            $('#ตำบล').html('<option value="%">-- Select --</option>');
        }
    });
});