import {Component, enableProdMode, Injectable,
        OnInit} from '@angular/core';
import {Http, Response, RequestOptions, Headers,
       Request, RequestMethod} from '@angular/http';
import 'rxjs/add/operator/map';
import { ResponseContentType } from '@angular/http';
import { Config } from '../app/config';
import { HTTP } from './http.class';
import { LoginModel } from '../models';


@Injectable()
export class NetworkPackage extends HTTP {
    public constructor(http: Http) {
        super(http);
    };

    public userSessionPost(userData: LoginModel, callback) {
        this.post('user/session/', userData, function(response) { return callback(response); }.bind(this));
    };

    public userGet(callback) {
        this.get('user/self/', function(response) { return callback(response); }.bind(this));
    };

    public filePost(fileArray, callback) {
        this.post('file/', fileArray, function(response) { return callback(response); }.bind(this));
    };

    public filesGet(callback) {
        this.get('file/all/', function(response) { return callback(response); }.bind(this));
    };

    public serversGet(callback) {
        this.get('server/', function(response) { return callback(response); }.bind(this));
    };

    public serverGet(serverId, callback) {
        this.get('server/' + serverId + "/", function(response) { return callback(response); }.bind(this));
    };

    public serverPost(server, callback) {
        this.post('server/', server, function(response) { return callback(response); }.bind(this));
    };

    public serverMetaGet(callback) {
        this.get('server/meta/', function(response) { return callback(response); }.bind(this));
    };

    public serverDelete(serverId, callback) {
        this.delete('server/' + serverId + "/", function(response) { return callback(response); }.bind(this));
    };

    public serversSummaryGet(callback) {
        this.get('server/summary/', function(response) { return callback(response); }.bind(this));
    };

    public serversStatusGet(status, callback) {
        this.get('server/status/' + status + "/", function(response) { return callback(response); }.bind(this));
    };

    public fileGetSheet(fileId, sheetId, callback) {
        this.get('file/'+fileId+'/sheet/'+sheetId+'/', function(response) { return callback(response); }.bind(this));
    };

    public applicationsGet(callback) {
        this.get('application/', function(response) { return callback(response); }.bind(this));
    };

    public applicationsSummaryGet(callback) {
        this.get('application/summary/', function(response) { return callback(response); }.bind(this));
    };

    public applicationsMetaGet(callback) {
        this.get('application/meta/', function(response) { return callback(response); }.bind(this));
    };

    public applicationsPost(application, callback) {
        this.post('application/', application, function(response) { return callback(response); }.bind(this));
    };

    public serverApplicationPost(serverId, application, callback) {
        this.post('server/' + serverId + '/application/', application, function(response) { return callback(response); }.bind(this));
    };

    public applicationServersGet(appName, status, callback) {
        this.get('application/' + appName + "/server/" + status + "/", function(response) { return callback(response); }.bind(this));
    };

    public applicationsStatusGet(status, callback) {
        this.get('application/status/' + status + "/", function(response) { return callback(response); }.bind(this));
    };

    public historyGet(skip, count, callback) {
        this.get('history/' + skip + '/' + count + '/', function(response) { return callback(response); }.bind(this));
    };

    public commentPost(serverId, commentItem, callback) {
        this.post('server/' + serverId + '/comment/', commentItem, function(response) { return callback(response); }.bind(this));
    };

    public workflowGet(callback) {
        this.get('workflow/', function(response) { return callback(response); }.bind(this));
    };

    public workflowCategoryGet(category, callback) {
        this.get('workflow/' + category + '/', function(response) { return callback(response); }.bind(this));
    };

    public workflowMigratePost(body, callback) {
        this.post('workflow/migrate/', body, function(response) { return callback(response); }.bind(this));
    };

    public applicationWorkflowMigratePost(body, callback) {
        this.post('workflow/application/migrate/', body, function(response) { return callback(response); }.bind(this));
    };

    public serverWorkflowMigratePost(body, callback) {
        this.post('workflow/server/migrate/', body, function(response) { return callback(response); }.bind(this));
    };

    public applicationFieldGet(name, callback) {
        this.get('application/field/' + name + '/', function(response) { return callback(response); }.bind(this));
    };

    public serverFieldGet(name, callback) {
        this.get('server/field/' + name + '/', function(response) { return callback(response); }.bind(this));
    };

    public serversMigratedGet(callback) {
        this.get('server/migrated/', function(response) { return callback(response); }.bind(this));
    };

    public scheduleServer(year, month, callback) {
        this.get('schedule/server/'+year+'/'+month+'/', function(response) { return callback(response); }.bind(this));
    };

    public scheduleApp(year, month, callback) {
        this.get('schedule/app/'+year+'/'+month+'/', function(response) { return callback(response); }.bind(this));
    };

    public scheduleComponent(year, month, callback) {
        this.get('schedule/component/'+year+'/'+month+'/', function(response) { return callback(response); }.bind(this));
    };

    public componentsSummaryGet(callback) {
        this.get('component/summary/', function(response) { return callback(response); }.bind(this));
    };

    public componentsStatusGet(status, callback) {
        this.get('component/status/' + status + "/", function(response) { return callback(response); }.bind(this));
    };

    public componentGet(serverId, callback) {
        this.get('component/' + serverId + "/", function(response) { return callback(response); }.bind(this));
    };

    public componentCommentPost(serverId, commentItem, callback) {
        this.post('component/' + serverId + '/comment/', commentItem, function(response) { return callback(response); }.bind(this));
    };

    public componentWorkflowMigratePost(body, callback) {
        this.post('workflow/component/migrate/', body, function(response) { return callback(response); }.bind(this));
    };

    public componentsMigratedGet(callback) {
        this.get('component/migrated/', function(response) { return callback(response); }.bind(this));
    };

    public scheduleGetDay(type, year, month, day, callback) {
        this.get('schedule/'+type+'/'+year+'/'+month+'/'+day+'/', function(response) { return callback(response); }.bind(this));
    };

    public changeAttribute(attribute, serverId, value) {
      this.post(`server/change-${attribute}/${serverId}`, {value}, function (response) {

      });
    }
};
