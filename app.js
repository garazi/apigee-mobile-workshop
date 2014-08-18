var express = require('express');
var async = require('async');
var usergrid = require('usergrid');
var nodemailerConnector = require('volos-mailer');
var avault = require('avault').createVault(__dirname);

var nodemailerConnectorObject;

var app = express();

app.all('/:dest', function(req, res, next) {
    if (req.params.dest === "mail") {
        nodemailerConnectorObject.dispatchRequest(req, res);
    } else {
        next();
    }
});

app.get('/restaurants', function(req, res, next) {
    var client = new usergrid.client({
        URI: "http://localhost:8080",
        orgName: "workshop",
        appName: "sandbox"
    });
    var restaurants = new usergrid.collection({
        client: client,
        type: "restaurants"
    });
    restaurants.fetch(function(err, data) {
        if (err) {
            console.log('error occured', data)
        } else {
            console.log('success');
            res.send(data)
        }
    });
});

app.get('/restaurants/:id', function(req, res, next) {
    var client = new usergrid.client({
        URI: "http://localhost:8080",
        orgName: "workshop",
        appName: "sandbox"
    });
    async.parallel({
            restaurants: function(callback) {
                var restaurants = new usergrid.collection({
                    client: client,
                    type: "restaurants",
                    "qs": {
                        "ql": "uuid =" + req.params.id
                    }
                });
                restaurants.fetch(function(err, data) {
                    if (err) {
                        console.log('error occured', data)
                    } else {
                        console.log('success 1');
                        callback(null, data);
                    }
                });
            },
            details: function(callback) {
                async.waterfall([
                    function(callback) {
                        var reviews = new usergrid.collection({
                            client: client,
                            type: "reviews",
                            "qs": {
                                "ql": "restID=" + req.params.id
                            }
                        });
                        reviews.fetch(function(err, data) {
                            if (err) {
                                console.log('error occured', data)
                            } else {
                                console.log('success 2');
                                callback(null, data);
                            }
                        });
                    },
                    function(data, callback) {
                        var l = data.entities.length;
                        var aggregate = 0;
                        var i;
                        for (i = 0; i<l; i++) {
                            aggregate += data.entities[i].rating;
                        }
                        aggregate = +(aggregate/i).toFixed(2);
                        callback(null, data, aggregate);
                    }
                ], callback);
            }
        },
        function(err, results) {
            res.send(results)
        });
});

app.get('/hello', function(req, res) {
    res.send('Hello from Express');
});

app.use("/", express.static(__dirname));

app.listen('8888', function(req, res) {
    avault.get('garbageVault', function(profileString) {
        if (!profileString) {
            console.log('Error: required vault not found.');
        } else {
            var profile = JSON.parse(profileString);
            nodemailerConnectorObject = new nodemailerConnector.NodemailerConnector({
                "profile": profile,
                "configuration": undefined
            });
            nodemailerConnectorObject.initializePaths(nodemailerConnectorObject.configuration.restMap);
        }
    });
    console.log("Server started on :8888");
});