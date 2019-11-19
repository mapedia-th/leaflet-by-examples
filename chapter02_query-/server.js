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

// get parcel
app.get('/api/get_parcel', (req, res) => {
    const sql = 'select *,a.land_no as land_id , ST_AsGeoJSON(geom) AS geojson from parcel_tha a full join house_member b on a.land_no = b.land_no  where budget is not null';
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

// get  values
app.post('/api/search_parcel', (req, res) => {
    const {
        parcel_id,
        price_1,
        price_2
    } = req.body;
    const sql = {
        text: 'select *,a.land_no as land_id , ST_AsGeoJSON(geom) AS geojson  \
        from parcel_tha a full join house_member b on a.land_no = b.land_no \
        where a.land_no like $1 and  budget between $2 and $3  and  a.land_no is not null;',
        values: [`%${parcel_id}%`, price_1, price_2],
    }
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