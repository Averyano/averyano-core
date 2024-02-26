import EventEmitter from 'events';
import { globalEmitter } from './GlobalEmitter';
export default class NodeEmitter extends EventEmitter {
	constructor() {
		super();
	}
	$on(event, callback) {
		this.on(event, callback);
		globalEmitter.on(event, callback);
	}
	$emit(event, ...args) {
		globalEmitter.emit(event, ...args);
	}
}
