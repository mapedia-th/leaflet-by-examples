const express = require('express');
const app = express.Router();
const Pool = require('pg').Pool

const db = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'geodb',
    password: '1234',
    port: 5432,
});

// TODO
app.get('/api/getpoi', (req, res) => {
    const sql = 'SELECT gid, t_name, st_x(geom) as lon, st_y(geom) as lat FROM pl_tour_4326';
    let jsonFeatures = [];
    db.query(sql).then((data) => {
        var rows = data.rows;
        rows.forEach((e) => {
            let feature = {
                type: 'Feature',
                properties: e,
                geometry: {
                    type: 'Point',
                    coordinates: [e.lon, e.lat]
                }
            };
            jsonFeatures.push(feature);
        });
        let geoJson = {
            type: 'FeatureCollection',
            features: jsonFeatures
        };
        res.status(200).json(geoJson);
    });
});

module.exports = app;

