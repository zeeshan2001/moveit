export class HistoryModel {
    public username: string;
    public user_id: string;
    public type: string;
    public action_tag: string;
    public instance_name: string;
    public reference: string;
    public item: string;
    public createdAt: string;


    public constructor(response: any) {
        this.username = response.username || "";
        this.user_id = response.user_id || "";
        this.type = response.type || "";
        this.action_tag = response.action_tag || "";
        this.reference = response.reference || "";
        this.instance_name = response.name || response.servicename || "";
        this.item = response.item || {};
        this.createdAt = response.createdAt || null;
    };
};