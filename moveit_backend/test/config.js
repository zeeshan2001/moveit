var config = require('../src/config');

config.jwt_token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1YzQ0NGQ3NDEzOGM1ZTA4YzAwMjNhODgiLCJlbWFpbCI6InRlc2xhQGxkYXAuZm9ydW1zeXMuY29tIiwibGFzdG5hbWUiOiJOaWtvbGEgVGVzbGEiLCJsZGFwX3VpZCI6InRlc2xhIiwiY3JlYXRlZEF0IjoiMjAxOS0wMS0yMFQxMDoyOTowOC42MDFaIiwidXBkYXRlZEF0IjoiMjAxOS0wMS0yMFQxMDoyOTowOC42MDFaIiwiX192IjowLCJpYXQiOjE1NDgwMDg5MDZ9.NA_EbBMPTBH2mp3DAE_I17T2q6L1OjG29mEc4TXfK8JjT2UttIJeZWfANKmV2aZ2AKbOFiej5WpCdjfRHCJq4ezsttnLkZS7q8emmflGSkehJlpNaImUiPflj3O0jwwYWF4zlXgh7rl3qfKMhQMNqv5PPYaiAw1n_IGPrRC_HSE";
config.database_address = "mongodb://127.0.0.1/moveit_test";
config.port = "3001";
config.url_base = "/api/v1";
config.log_dir = "logs/tests/";

module.exports = config;