const fs = require("fs");
const express = require("express");
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const models = JSON.parse(fs.readFileSync(__dirname + "/models.json"));

const app = express();

app.all('/*', function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
  next();
});

app.use('/model', express.static(__dirname + '/data'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json({limit: '50mb', extended: true}));

app.get('/models', (req, res, next) => {
  return res.status(200).json(models);
});

app.post('/savemodel', (req, res, next) => {
  const geojsonStr = req.body.geojson;
  const fileName = uuidv4();

  models.push({
    name: req.body.name,
    uuid: fileName,
    timestamp: (new Date()).toJSON()
  });

  fs.writeFileSync(__dirname + "/models.json", JSON.stringify(models), "utf8");
  fs.writeFileSync(__dirname + "/data/" + fileName + ".geojson", geojsonStr, "utf8");

  return res.status(200).json({ message: "Model saved."});
});

app.listen("7339", () => {
  console.log("Listening on 7339");
});
