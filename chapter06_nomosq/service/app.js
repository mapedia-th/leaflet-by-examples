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

app.get('/api/disease/:lat/:lon/:buff', (req, res) => {
    const lat = req.params.lat;
    const lon = req.params.lon;
    const buff = req.params.buff;
    const sql = `SELECT *, st_x(geom) as lon, st_y(geom) as lat  
    FROM dengue_case_4326
    WHERE ST_DWithin(ST_Transform(geom,3857), 
    ST_Transform(ST_GeomFromText('POINT(${lon} ${lat})',4326), 3857), ${buff}) = 'true'
    AND disease = 'dengue'`;
    db.query(sql)
        .then((data) => {
            res.status(200).json({
                status: 'success',
                message: 'get disease',
                data: data.rows
            });
        })
});

module.exports = app;



