import {Component, enableProdMode, Injectable,
    OnInit} from '@angular/core';
import {Http, Response, RequestOptions, Headers,
    Request, RequestMethod} from '@angular/http';
import 'rxjs/add/operator/map';
import { Config } from '../app/config';


/**
 *  This class is used to provide HTTP methods/calls
 *  to avoid different versions in the application.
 */
@Injectable()
export class HTTP {
    private headers = new Headers({
        'Content-Type': 'application/json'
    });
    public http: Http;


    /**
     *  Construcotr using Angular HTTP to modify
     *  @param http: Angular default HTTP class
     */
    public constructor(http: Http) {
        this.http = http;
    }


    /**
     *  Method getting current base URL of backend.
     *  @return base address of used backend/api.
     */
    public getAPI_URL = function(): string {
        return Config.api_url;
    };


    /**
     *  POST Method
     *  Used to insert/create a new ressource.
     *  @param address: url of endpoint
     *  @param data: JSON encoded body
     *  @param callback
     *  @return Through callback
     */
    public post = function(address, data, callback) {
        this.http.post(this.getAPI_URL() + address, data,
        {
            headers: this.headers,
            withCredentials: true
        })
        .map(
            res => callback(JSON.parse(JSON.stringify(res))),
        )
        .subscribe(
            dataParam => callback(dataParam),
            err => {
                callback(err);
            }
        );
    };


    /**
     *  GET Method
     *  Used to get a ressource or a list of.
     *  @param address: url of endpoint
     *  @param callback
     *  @return Through callback
     */
    public get = function(address, callback) {
        this.http.get(this.getAPI_URL() + address,
        {
            headers: this.headers,
            withCredentials: true
        })
        .map(
            res => callback(JSON.parse(JSON.stringify(res))),
        )
        .subscribe(
            dataParam => callback(dataParam),
            err => {
                callback(err);
            }
        );
    };


    /**
     *  PUT Method
     *  Used to update an existing ressource.
     *  @param address: url of endpoint
     *  @param data: JSON encoded body
     *  @param callback
     *  @return Through callback
     */
    public put = function(address, data, callback) {
        this.http.put(this.getAPI_URL() + address, data,
        {
            headers: this.headers,
            withCredentials: true
        })
        .map(
            res => callback(JSON.parse(JSON.stringify(res))),
        )
        .subscribe(
            dataParam => callback(dataParam),
            err => {
                callback(err);
            }
        );
    };


    /**
     *  DELETE Method
     *  Used to remove a ressource.
     *  @param address: url of endpoint
     *  @param callback
     *  @return Through callback
     */
    public delete = function(address, callback) {
        this.http.delete(this.getAPI_URL() + address,
        {
            headers: this.headers,
            withCredentials: true
        })
        .map(
            res => callback(JSON.parse(JSON.stringify(res))),
        )
        .subscribe(
            dataParam => callback(dataParam),
            err => {
                callback(err);
            }
        );
    };
};