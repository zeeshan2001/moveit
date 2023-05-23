import { Config } from '../../src/app/config';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import * as io from 'socket.io-client';


/**
 *  Define valid channels here to keep the
 *  usage identical in all components.
 */
export const SocketChannels = {
    broadcast: "broadcast"
};


export class SocketService {
    private url = Config.socket_url;  
    private socket;


    public constructor() {
        this.socket = io(
            this.url, {
                reconnect: true
            }
        );
    };


    /**
     *  Sending message to chosen backend channel.
     *  @param channel implemented in backend
     *  @param message to send to the backend.
     */
    public sendMessage(channel, message) {
        this.socket.emit(channel, message);
    };


    /**
     *  Listening for messages/broadcasts.
     *  @param channel we want to listen
     */
    public getMessages(channel) {
        let observable = new Observable(observer => {
            this.socket.on(channel, (data) => {
                observer.next(data);
            });
            return () => {
                this.socket.disconnect();
            };
        });
        return observable;
    };
};