var express = require('express');
var async = require('async');
var request = require('request');
var usergrid = require('usergrid');
var nodemailerConnector = require('volos-mailer');
var avault = require('avault').createVault(__dirname);
var routes = require('./routes');

var nodemailerConnectorObject;

var app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.use(express.bodyParser());

app.all('/:dest', function(req, res, next) {
    if (req.params.dest === "mail") {
        nodemailerConnectorObject.dispatchRequest(req, res);
    } else {
        next();
    }
});

// app.get('/restaurants', function(req, res, next) {
//     var client = new usergrid.client({
//         URI: "http://localhost:8080",
//         orgName: "workshop",
//         appName: "sandbox"
//     });
//     var restaurants = new usergrid.collection({
//         client: client,
//         type: "restaurants"
//     });
//     restaurants.fetch(function(err, data) {
//         if (err) {
//             console.log('error occured', data)
//         } else {
//             console.log('success');
//             res.send(data)
//         }
//     });
// });

app.get('/restaurants', function(req, res, next) {
    request('http://localhost:8080/workshop/sandbox/restaurants', function(error, response, body) {
        if (error) {
            res.send(error);
        } else {
            res.send(body);
        }
    });
});

app.get('/restaurants/:id', function(req, res, next) {
    // var client = new usergrid.client({
    //     URI: "http://localhost:8080",
    //     orgName: "workshop",
    //     appName: "sandbox"
    // });
    async.parallel({
            restaurant: function(callback) {
                request("http://localhost:8080/workshop/sandbox/restaurants/?ql=restID=" + req.params.id, function(error, response, body) {
                    if (error) {
                        res.send(error);
                    } else {
                        var result = JSON.parse(body);
                        callback(null, result);
                    }
                });
                // var restaurants = new usergrid.collection({
                //     client: client,
                //     type: "restaurants",
                //     "qs": {
                //         "ql": "restID =" + req.params.id
                //     }
                // });
                // restaurants.fetch(function(err, data) {
                //     if (err) {
                //         console.log('error occured', data)
                //     } else {
                //         console.log('success 1');
                //         callback(null, data);
                //     }
                // });
            },
            reviews: function(callback) {
                async.waterfall([
                    function(callback) {
                        request("http://localhost:8080/workshop/sandbox/reviews/?ql=restID=" + req.params.id, function(error, response, body) {
                            if (error) {
                                res.send(error);
                            } else {
                                data = JSON.parse(body);
                                callback(null, data);
                            }
                        });
                        // var reviews = new usergrid.collection({
                        //     client: client,
                        //     type: "reviews",
                        //     "qs": {
                        //         "ql": "restID=" + req.params.id
                        //     }
                        // });
                        // reviews.fetch(function(err, data) {
                        //     if (err) {
                        //         console.log('error occured', data)
                        //     } else {
                        //         console.log('success 2');
                        //         callback(null, data);
                        //     }
                        // });
                    },
                    function(data, callback) {
                        var l = data.entities.length;
                        var aggregate = 0;
                        var i;
                        for (i = 0; i < l; i++) {
                            aggregate += data.entities[i].rating;
                        }
                        aggregate = {
                            aggregate: +(aggregate / i).toFixed(2)
                        }
                        callback(null, data, aggregate);
                    }
                ], callback);
            }
        },
        function(err, results) {
            res.send(results);
        });
});

app.post('/reviews', function(req, res) {
        console.log(req.body)
        // res.send(req.body)
    // var payload = {
    //     title: req.body.,
    //     reviewer: $('#form-email').val(),
    //     rating: Number($('#form-rating').val()),
    //     body: $('#form-desc').val(),
    //     restID: Number($('#form-uuid').val())
    // }

    request.post('http://localhost:8080/workshop/sandbox/reviews', {
        form: JSON.stringify(req.body)
    }, function(error, response, body) {
        res.send(body);
    });
})

app.get('/addReview/:id', routes.addreview)
app.get('/details/:id', routes.details);
app.get('/', routes.index);

// app.use("/", express.static(__dirname));
app.use(express.static(__dirname + '/public'));


app.get('/hello', function(req, res) {
    res.send('Hello from Express');
});

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