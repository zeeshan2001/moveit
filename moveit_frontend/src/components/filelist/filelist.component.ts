import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FileModel } from '../../models/FileModel';


@Component({
  selector: 'file-list',
  templateUrl: './filelist.view.html',
  styleUrls: ['./filelist.style.scss']
})


export class FileListComponent {
    @Input() files: FileModel[] = [];
    @Output() clickFileEvent: EventEmitter<any> = new EventEmitter<any>();


    public constructor() {
        
    };


    /**
     *  Clicking an item on the UI. Catching event.
     *  @param indexFile index of the file
     *  @param indexSheet index of the sheet within the file
     *  @return Through eventEmitter to parent component.
     */
    public clickItem(indexFile, indexSheet) {
        this.clickFileEvent.emit({
            indexFile: indexFile,
            indexSheet: indexSheet
        });
    };
};