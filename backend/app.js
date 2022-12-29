require('dotenv').config();
const axios = require('axios');
const express = require('express');

const app = express();
const port = process.env.PORT;

class StoreData {
    data = null;
    lastUpdated = null;
    updateInterval = null;

    update = async () => {};

    constructor(update, updateInterval) {
        this.update = update;
        this.updateInterval = updateInterval;
    }

    getData = async () => {
        if (this.lastUpdated === null || (new Date()).valueOf() - this.lastUpdated >= this.updateInterval) {
            this.lastUpdated = (new Date()).valueOf();
            this.data  = await this.update();
            console.log("Updated data.");
        }
        return this.data;
    }
}

class Store {
    routes = new StoreData(async () => {
        const options = {
            method: 'GET',
            url: 'https://transloc-api-1-2.p.rapidapi.com/routes.json',
            params: {agencies: '16'},
            headers: {
                'x-rapidapi-key': process.env.TRANSLOC_KEY,
                'x-rapidapi-host': process.env.TRANSLOC_HOST
            }
        }
        return (await axios.request(options)).data.data['16'];
    }, 10000);
    segments = new StoreData(async () => {
        const options = {
            method: 'GET',
            url: 'https://transloc-api-1-2.p.rapidapi.com/segments.json',
            params: {agencies: '16'},
            headers: {
                'x-rapidapi-key': process.env.TRANSLOC_KEY,
                'x-rapidapi-host': process.env.TRANSLOC_HOST
            }
        };
        return (await axios.request(options)).data.data;
    }, 10000);
    vehicles = new StoreData(async () => {
        const options = {
            method: 'GET',
            url: 'https://transloc-api-1-2.p.rapidapi.com/vehicles.json',
            params: {agencies: '16'},
            headers: {
                'x-rapidapi-key': process.env.TRANSLOC_KEY,
                'x-rapidapi-host': process.env.TRANSLOC_HOST
            }
        }
        return (await axios.request(options)).data.data['16'];
    }, 2000);
    stops = new StoreData(async () => {
        const options = {
            method: 'GET',
            url: 'https://transloc-api-1-2.p.rapidapi.com/stops.json',
            params: {agencies: '16'},
            headers: {
                'x-rapidapi-key': process.env.TRANSLOC_KEY,
                'x-rapidapi-host': process.env.TRANSLOC_HOST
            }
        };
        return (await axios.request(options)).data.data;
    }, 10000);
    arrivalEstimates = new StoreData(async () => {
        const options = {
            method: 'GET',
            url: 'https://transloc-api-1-2.p.rapidapi.com/arrival-estimates.json',
            params: {agencies: '16'},
            headers: {
                'x-rapidapi-key': process.env.TRANSLOC_KEY,
                'x-rapidapi-host': process.env.TRANSLOC_HOST
            }
        };
        return (await axios.request(options)).data.data;
    }, 2000);
}

const store = new Store();

app.get('/routeData', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    store.routes.getData().then(r => {
        res.send(r);
    });
});

app.get('/segmentData', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    store.segments.getData().then(r => {
        res.send(r);
    });
});

app.get('/vehicleData', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    store.vehicles.getData().then(r => {
        res.send(r);
    });
});

app.get('/stopData', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    store.stops.getData().then(r => {
        res.send(r);
    });
});

app.get('/arrivalEstimateData', (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");
    store.arrivalEstimates.getData().then(r => {
        res.send(r);
    });
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
});