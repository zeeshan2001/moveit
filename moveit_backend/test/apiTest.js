const request         = require('supertest');
const should          = require('should');
const express         = require('express');
const cookieParser    = require('cookie-parser');
const app             = require('./main');
const config          = require('./config');
const mongoose        = require('mongoose');


describe('APPLICATIONS', () => {
    require('./src/application')(app);
});
