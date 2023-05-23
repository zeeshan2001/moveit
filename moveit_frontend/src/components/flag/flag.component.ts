import { Component, Input, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'status-flag',
  templateUrl: './flag.view.html',
  styleUrls: ['./flag.style.scss']
})


export class FlagComponent {
    @Output() eventFlagClicked: EventEmitter<any> = new EventEmitter<any>();
    @Input() status: string = "";
    @Input() migrated: boolean = false;
    @Input() inventory: boolean = false;
    @Input() width: number = 15;
    public styleProperties = {};


    public constructor() {
    };


    /**
     *  Clicking on a flag on the UI.
     *  @return notify parent component
     */
    public notifyFlagClick() {
        this.eventFlagClicked.emit();
    };


    public getColor() {
        if (this.migrated) {
            return this.getFlagColorMigrated();
        }
        return this.getFlagColorNotMigrated();
    };


    private getFlagColorMigrated() {
        return this.getFlagColorNotMigrated();
    };


    private getFlagColorNotMigrated() {
        switch (this.status) {
            case "open": {
                if (this.inventory) {
                    return "#3498db";
                }
                return "#7f8c8d";
            }
            case "error": {
                return "#e74c3c";
            }
            case "progress": {
                return "#f39c12";
            }
            case "done": {
                return "#2ecc71";
            }
        }
    };
};