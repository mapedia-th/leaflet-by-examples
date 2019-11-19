const express = require('express');

const request = require('request');
const csv = require('csvtojson');
const turf = require('@turf/turf');

const app = express.Router();

const json = require('./th_geojson');
const poly_th = turf.polygon(json.th.features[0].geometry.coordinates[0]);

app.get('/api/hotspot/', (req, res) => {
    csv().fromStream(request.get('https://firms.modaps.eosdis.nasa.gov/data/active_fire/viirs/csv/VNP14IMGTDL_NRT_SouthEast_Asia_24h.csv'))
        .then(async (data) => {
            let jsonFeatures = [];
            let cnt = 0;
            data.forEach(function (point) {
                let lat = Number(point.latitude);
                let lon = Number(point.longitude);
                let pt = turf.point([lon, lat]);

                if (turf.booleanPointInPolygon(pt, poly_th) == true) cnt += 1;
                if (turf.booleanPointInPolygon(pt, poly_th) == true) {
                    let feature = {
                        type: 'Feature',
                        properties: point,
                        geometry: {
                            type: 'Point',
                            coordinates: [lon, lat]
                        }
                    };
                    jsonFeatures.push(feature);
                }
            });
            let geoJson = {
                type: 'FeatureCollection',
                features: jsonFeatures
            };
            res.status(200).json({
                status: 'success',
                count: cnt,
                data: geoJson,
                message: 'retrived survey data'
            });
        }).catch((error) => {
            return next(error)
        });
});

app.get('/api/aqi', (req, res) => {
    request(
        { url: 'http://air4thai.pcd.go.th/services/getNewAQI_JSON.php' },
        (error, response, body) => {
            if (error || response.statusCode !== 200) {
                return res.status(500).json({ type: 'error', message: err.message });
            }
            res.status(200).json({
                status: 'success',
                message: 'aqi data',
                data: JSON.parse(body)
            });
        }
    )
})

module.exports = app;


