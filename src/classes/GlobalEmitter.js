// This component is responsible for firing events using $on and $emit methods, available on any instance that extends from NodeEmitter (for example, Component.js does)

import EventEmitter from 'events';

class GlobalEmitter extends EventEmitter {}

export const globalEmitter = new GlobalEmitter();
