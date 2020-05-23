import ConnectionManager from './connection-manager';
import * as Peer from './peer';
import AudioPlayer from './audio-player';
import SocketHandler from './ws-handler';
import EventEmitter from 'events';

console.log(Peer)
window.peer = Peer;
window.SocketHandler = SocketHandler;
window.events = new EventEmitter();