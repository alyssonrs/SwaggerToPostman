'use strict';
var express = require('express');
var https = require("https");
var router = express.Router();

var employees = [
    {
        Id: 1,
        FirstName: "Jalpesh",
        LastName: "Vadgama",
        Designation: "Technical Architect"
    }
];

/* GET home page. */
router.post('/', function (req, mainRes) {

    const options = {
        "method": "GET",
        "path": [
            req.body.swaggerUrl
        ]
    };

    let swagger = {};

    var req = https.get(req.body.swaggerUrl, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            swagger = JSON.parse(body.toString());

            var postmanCollection = swaggerToPostman(swagger);

            mainRes.json(postmanCollection);
        });
    });

    req.end();

});

function swaggerToPostman(swagger) {

    let pm = {
        collection: {
            info: {
                name: swagger.info.title,
                description: "Collection convertida do swagger ",
                schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
            },
            item: []
        }
    };

    for (let path in swagger.paths) {

        let folderName = /\/(\w*)\/*/g.exec(path)[1];

        let folder = pm.collection.item.find(function (ele) { return ele.name == folderName });

        if (!folder) {

            folder = {
                name: folderName
            }

            folder.item = getSwaggerItensFromPath(swagger, path);

            pm.collection.item.push(folder);

        } else {

            var newItens = getSwaggerItensFromPath(swagger, path);

            for (var i = 0; i < newItens.length; i++) {
                folder.item.push(newItens[i]);
            }

        }
    }

    return pm;

}

function getSwaggerItensFromPath(swagger, pathName) {

    let items = [];

    const path = swagger.paths[pathName];

    for (let method in path) {

        let swaggerRequest = path[method];

        let item = {
            name: swaggerRequest.summary,
            request: {
                url: "{{server}}" + pathName,
                method: method.toUpperCase()
            }
        };

        if (swaggerRequest.parameters) {

            //let bodyParam = swaggerRequest.parameters.find(function (ele) { return ele.in == "body" })

            //if (bodyParam) {

            //    let schemaPath = bodyParam.schema["$ref"];
            //    schemaPath = schemaPath.replace("#/definitions/", "");

            //    let schema = swagger.definitions[schemaPath];

            //    let jsonObj = schemaParser.fromSchema(schema);

            //    item.request.body = {
            //        mode: "raw",
            //        raw: JSON.stringify(jsonObj)
            //    }
            //}

        }

        items.push(item);
    }

    return items;
}

module.exports = router;
