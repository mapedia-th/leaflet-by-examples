const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')
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
    password: '1234'
});

app.use(express.static(__dirname + '/www'));

app.listen(3000, () => {
    console.log('run on port 3000..')
})

// get 
app.get('/api_province', (req, res) => {

    const sql = 'select  pro_name as name_area,pro_code , year_pop ,sum(p_m_total) as pop_m , sum(p_f_total) as pop_f , sum(p_mf_total) as pop_mf, ST_AsGeoJSON(geom) AS geojson\
    from pop_rate a \
    inner join province b on a.pro_code = b.pv_code\
    where year_pop = 2559\
    group by pro_name,pro_code , year_pop ,geom\
    ';
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

app.get('/api_chart', async (req, res) => {
    const query_chart_line = await {
        text: "select   year_pop ,sum(p_m_total) as pop_m , sum(p_f_total) as pop_f , sum(p_mf_total) as pop_mf\
        from pop_rate\
        group by year_pop order by year_pop asc;"
    }
    db.query(query_chart_line).then((data) => {
        res.status(200).json(data);
    });
})


// get 
app.post('/api_province_search', (req, res) => {
    const {
        province,
        amphoe,
        tambon
    } = req.body;
    if (province != '%' && amphoe == '%') {
        const sql = {
            text: 'select  pro_name as name_area,pro_code , year_pop ,sum(p_m_total) as pop_m , sum(p_f_total) as pop_f , sum(p_mf_total) as pop_mf, ST_AsGeoJSON(geom) AS geojson\
            from pop_rate a \
            inner join province b on a.pro_code = b.pv_code\
            where year_pop = 2559 and pro_code like $1 \
            group by pro_name,pro_code , year_pop ,geom;',
            values: [`%${province}%`],
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
    } else if (province != '%' && amphoe != '%' && tambon == '%') {
        const sql = {
            text: 'select  amp_name as name_area,amp_code , year_pop ,sum(p_m_total) as pop_m , sum(p_f_total) as pop_f , sum(p_mf_total) as pop_mf, ST_AsGeoJSON(geom) AS geojson\
            from pop_rate a \
            inner join amphoe b on a.amp_code = b.ap_code\
            where year_pop = 2559 and amp_code like $1 \
            group by amp_name,amp_code , year_pop ,geom;',
            values: [`%${amphoe}%`],
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
    } else if (province != '%' && amphoe != '%' && tambon != '%') {
        const sql = {
            text: 'select  tam_name as name_area,tam_code ,year_pop ,sum(p_m_total) as pop_m , sum(p_f_total) as pop_f , sum(p_mf_total) as pop_mf, ST_AsGeoJSON(geom) AS geojson\
            from pop_rate a \
            inner join tambon b on a.tam_code = b.tb_code\
            where year_pop = 2559 and tam_code like $1 \
            group by tam_name,tam_code , year_pop ,geom;',
            values: [`%${tambon}%`],
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
    } else {
        const sql = {
            text: 'select  pro_name,pro_code , year_pop ,sum(p_m_total) as pop_m , sum(p_f_total) as pop_f , sum(p_mf_total) as pop_mf, ST_AsGeoJSON(geom) AS geojson\
            from pop_rate a \
            inner join province b on a.pro_code = b.pv_code\
            where year_pop = 2559 and pro_code like $1 \
            group by pro_name,pro_code , year_pop ,geom;',
            values: [`%${province}%`],
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
    }


});




app.post('/api_chart_search', async (req, res) => {
    const {
        province,
        amphoe,
        tambon
    } = req.body;

    const sql = {
        text: 'select   year_pop ,sum(p_m_total) as pop_m , sum(p_f_total) as pop_f , sum(p_mf_total) as pop_mf\
        from pop_rate\
        where pro_code like $1 and amp_code like $2 and tam_code like $3\
        group by year_pop order by year_pop asc;',
        values: [`%${province}%`, `%${amphoe}%`, `%${tambon}%`],
    }

    db.query(sql).then((data) => {
        res.status(200).json(data);
    });
})