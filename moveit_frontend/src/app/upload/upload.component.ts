import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '../../translate/translate.service';
import { Cookie } from 'ng2-cookies/ng2-cookies';
import { FileModel } from '../../models';
import { Http } from '@angular/http';
import { NetworkPackage } from '../../classes/network.class';
import { Config } from '../../app/config';


@Component({
  selector: 'app-upload',
  templateUrl: './upload.view.html',
  styleUrls: ['./upload.style.scss']
})


export class UploadComponent {
    public np: NetworkPackage = null;
    // Every item is base64 encoded file.
    public filesToUpload: {name: string, content: string}[] = [];
    public availableFiles: FileModel[] = [];
    public fileContent: any = [];
    public chosenFile: FileModel = null;
    public chosenFileIndex: {fileId: any, sheetId: any} = {
        fileId: -1,
        sheetId: -1
    };


    public constructor(private _translate: TranslateService,
            private router: Router, private http: Http) {
        
        this.np = new NetworkPackage(http);
        this.getFileMetaData();
    };


    /**
     *  Getting base64 format from files and pushing to an array.
     *  @param event catching from the view.
     */
    public getFilesAsBase64(event): void {
        const reader = new FileReader();
        const count = event.target.files.length;

        if (event.target.files && count > 0) {
            this.filesToUpload = [];

            for (let k = 0; k < count; k++) {
                try {
                    reader.readAsDataURL(event.target.files[k]);
                } catch (ex) {
                    console.log("Exception: " + ex)
                    return;
                }
                
                reader.onload = () => {
                    const result: any = reader.result;
                    const base64: string = result.split('base64,')[1];
                    this.filesToUpload.push({
                        name: event.target.files[k].name,
                        content: base64
                    });

                    if (count === k + 1) {
                        this.uploadFiles();
                    }
                };
            }
        }
    };


    /**
     *  Helper method. Just uploading files and handling response.
     */
    private uploadFiles(): void {
        this.np.filePost(this.filesToUpload, function(response) {
            if (!response) {
                return;
            }
            switch (response.status) {
                case 200: {
                    this.getFileMetaData();
                    break;
                }
                default: {
                    break;
                }
            }
        }.bind(this));
    };


    /**
     *  Helper method: Getting all available files. (meta info only)
     */
    private getFileMetaData(): void {
        this.np.filesGet(function(response) {
           if (!response || !response._body) {
               return;
           }
           this.availableFiles = [];
           var body = JSON.parse(response._body);
           body.forEach(fileMeta => {
              this.availableFiles.push(new FileModel(fileMeta));
           });
        }.bind(this));
    };


    /**
     *  Catching event here. Getting notification when choosing an item.
     *  @param item containing the index of file and sheet.
     */
    public chooseFileFromList(item) {
        this.chosenFileIndex.fileId
            = this.availableFiles[item.indexFile]._id;
        this.chosenFileIndex.sheetId
            = this.availableFiles[item.indexFile].sheets[item.indexSheet].id;

        this.np.fileGetSheet(this.chosenFileIndex.fileId, this.chosenFileIndex.sheetId, function(response) {
            if (!response || !response._body) {
                return;
            }
            this.chosenFile = new FileModel(this.availableFiles[item.indexFile]);
            this.fileContent = JSON.parse(response._body);
        }.bind(this));
    };


    /**
     *  Resetting fileContent
     */
    public resetFileContent() {
        this.fileContent = [];
        this.chosenFileIndex.fileId = 0;
        this.chosenFileIndex.sheetId = 0;
    };
};