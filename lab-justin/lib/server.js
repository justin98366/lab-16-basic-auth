'use strict';

// npm mmodules
const cors = require('cors');
const morgan = require('morgan');
const express = require('express');
const mongoose = require('mongoose');

// module logic
//   config and connect to mongoose
mongoose.Promise = Promise;
mongoose.connect(process.env.MONGODB_URI);

// create app
const app = express();

// load middleware
app.use(morgan('dev'));
app.use(cors());

// load routes
app.use(require('../route/basic-auth-router.js'));

// add 404 routes
app.all('/api/*', (req, res, next) => res.sendStatus(404));

app.use(require('./error-middleware.js'));

// export start and stop
const server = module.exports = {};
server.isOn = false;
server.start = () => {
  return new Promise((resolve, reject) => {
    if(!server.isOn){
      server.http = app.listen(process.env.PORT, () => {
        server.isOn = true;
        console.log('server up', process.env.PORT);
        resolve();
      });
      return;
    }
    reject(new Error('server is already running'));
  });
};

server.stop = () => {
  return new Promise((resolve, reject) => {
    if(server.http && server.isOn){
      return server.http.close(() => {
        server.isOn = false;
        console.log('server down');
        resolve();
      });
    }
    reject(new Error('server is not running'));
  });
};
