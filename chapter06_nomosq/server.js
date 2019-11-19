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

app.listen(3000, () => {
    console.log('running on port 3000..')
});
app.use(express.static(__dirname + '/www'));

const api = require('./service/app');
app.use(api);