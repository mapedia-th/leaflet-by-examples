const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

app.use(cors());
app.options('*', cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const Pool = require('pg').Pool
const db = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'geodb',
    password: '1234',
});

app.use(express.static(__dirname + '/www'));

app.listen(3000, () => {
    console.log('run on port 3000..')
})


app.get('/get_parcel', (req, res) => {
    const sql = 'select *,a.land_no as land_id , ST_AsGeoJSON(geom) AS geojson \
    from parcel_tha a full join house_member b on a.land_no = b.land_no \
    where geom is not null order by id desc';
    let jsonFeatures = [];
    db.query(sql).then((data) => {
        var rows = data.rows;
        rows.forEach((e) => {
            let feature = {
                type: 'Feature',
                geometry: JSON.parse(e.geojson),
                properties: e
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

// insert 
app.post('/api_insert', (req, res) => {
    const {
        geom,
        mapsheet,
        land_no,
        survey,
        scale,
        land_type,
        budget
    } = req.body;
    const sql = {
        text: 'INSERT INTO parcel_tha(geom, mapsheet,land_no,survey,scale,land_type,budget) VALUES(ST_SetSRID(st_geomfromgeojson($1), 4326), $2, $3, $4, $5, $6, $7)',
        values: [geom, mapsheet, land_no, survey, scale, land_type, budget],
    }
    db.query(sql)
        .then(() => {
            res.status(200).json({
                status: 'success',
                message: 'insert'
            });
        })
});


// update 
app.post('/api_update', (req, res) => {
    const {
        geom,
        land_id
    } = req.body;
    const sql = {
        text: 'UPDATE parcel_tha  SET geom = ST_SetSRID(st_geomfromgeojson($1), 4326) WHERE id = $2',
        values: [geom, land_id],
    }
    db.query(sql)
        .then(() => {
            res.status(200).json({
                status: 'success',
                message: 'update'
            });
        })
});


// delete 
app.post('/api_delete', (req, res) => {
    const {
        land_id
    } = req.body;
    const sql = {
        text: 'DELETE from parcel_tha where id = $1',
        values: [land_id],
    }
    db.query(sql)
        .then(() => {
            res.status(200).json({
                status: 'success',
                message: 'delete'
            });
        })
});