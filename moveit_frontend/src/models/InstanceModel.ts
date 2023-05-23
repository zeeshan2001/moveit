import {CommentModel} from './CommentModel';


export class InstanceModel {
    public _id: string = "";
    public name: string = "";
    public status: string = "";
    public type: string = "";
    public attributes: any = {};
    public applications: any[] = [];
    public components: any[] = [];
    public updatedAt: string = "";
    public createdAt: string = "";
    public attributes_length = 0;
    public comments: CommentModel[] = [];
    public workflow: any = {};
    public planned: boolean;
    public migrated: boolean;
    public inventory: boolean;


    public constructor(response: any) {
        this._id = response._id;
        this.name = response.name;
        this.status = response.status || "open";
        this.type = response.type || "server";
        this.attributes = response.attributes || {};
        this.applications = response.applications || [];
        this.components = response.components || [];
        this.updatedAt = response.updatedAt;
        this.createdAt = response.createdAt;
        this.attributes_length = response.attributes_length || 0;
        this.workflow = response.workflow || {} ;
        this.planned = response.planned || false;
        this.migrated = response.migrated || false;
        this.inventory = response.inventory || false;

        response.comments = response.comments || [];
        if (response.comments) {
            var comments = response.comments;
            for (var i = 0; i < comments.length; i++) {
                this.comments.push(new CommentModel(comments[i]));
            }
        }
    };
};