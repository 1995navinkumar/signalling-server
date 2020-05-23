import ConnectionManager from './connection-manager';
import Peer from './peer';
import AudioPlayer from './audio-player';
import SocketHandler from './ws-handler';
import EventEmitter from 'events';

window.SocketHandler = SocketHandler;
window.events = new EventEmitter();