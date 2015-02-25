var EventEmitter = require('events').EventEmitter;

class Panels {

	constructor() {

		this.emitter = new EventEmitter();
		this.panels = [];

	}

	add(panel) {
		console.log('DEBUG: Add new panel');
		this.panels.push({});
		this.emitter.emit('new', this.panels);
	}

	on() {
		this.emitter.on.apply(this.emitter, arguments);
	}


}

module.exports = new Panels();
