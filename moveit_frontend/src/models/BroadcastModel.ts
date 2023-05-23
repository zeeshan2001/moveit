import { UserModel } from './UserModel';


export class BraodcastModel {
    public user: UserModel;
    public type: string;
    public object: {name: string, action: string};


    public constructor(response: any) {
        this.user = new UserModel(response.user || {});
        this.type = response.type || "";
        this.object = response.object || {name:"", action:""};
    };
};