define([
	"dijit/_WidgetBase"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/dom-class"
	, "dojo/Stateful"
	, 'put-selector'
	, "src/util/Mediator"
], function(
	_WidgetBase
	, declare
	, lang
	, domClass
	, Stateful
	, put
	, Mediator
){
	return declare([_WidgetBase, Stateful], {
		//	summary:
		//		Widget botón para incrustar en el mapa.
		//	description:
		//		Permite añadir un botón definiendo desde fuera sus callbacks y eventos que los disparan,
		//		así como su icono y demás.

		constructor: function(args) {

			this.config = {
				active: false,
				activeClass: "active",
				containerAttrs: "div.leaflet-control-layers.leaflet-control",
				buttonAttrs: "a.leaflet-control-layers-toggle",
				icon: "fa-question",
				title: "",
				activated: this._defaultCallback,
				deactivated: this._defaultCallback,
				activateEvent: "onclick",
				deactivateEvent: "onclick",
				addButtonChannel: "",
				timeout: 0
			};

			lang.mixin(this, this.config, args);

			this.watch("active", this._updateStatus);
		},

		postCreate: function() {

			this._drawButton();

			this.node[this.activateEvent] = lang.hitch(this, this.activate);
		},

		_defaultCallback: function(evt) {

			evt.stopPropagation && evt.stopPropagation();
		},

		_updateStatus: function(name, oldValue, value) {

			if (value) {
				domClass.toggle(this.node.firstChild, this.activeClass);
				this.activated();
				this._afterActivated();
			} else {
				domClass.toggle(this.node.firstChild, this.activeClass);
				this.deactivated();
				this._afterDeactivated();
			}
		},

		_drawButton: function() {

			this.node = put(this.containerAttrs);
			put(this.node, this.buttonAttrs + "." + this.icon + "[title=" + this.title + "]");

			Mediator.publish(this.addButtonChannel, {
				button: this.node
			});
		},

		activate: function(evt) {

			this.set("active", true);
			evt.stopPropagation && evt.stopPropagation();
		},

		deactivate: function(evt) {

			this.set("active", false);
			evt.stopPropagation && evt.stopPropagation();
		},

		_afterActivated: function() {

			this.node[this.activateEvent] = this._defaultCallback;
			this.node[this.deactivateEvent] = lang.hitch(this, this.deactivate);

			this.startTimeout();
		},

		_afterDeactivated: function() {

			this.node[this.deactivateEvent] = this._defaultCallback;
			this.node[this.activateEvent] = lang.hitch(this, this.activate);

			this.stopTimeout();
		},

		startTimeout: function() {

			if (!this._isValidTimeout()) {
				return;
			}

			this.stopTimeout();
			this.timeoutHandler = setTimeout(lang.hitch(this, this.deactivate), this.timeout);
		},

		stopTimeout: function() {

			if (!this._isValidTimeout()) {
				return;
			}

			clearTimeout(this.timeoutHandler);
		},

		_isValidTimeout: function() {

			return this.timeout && !isNaN(this.timeout);
		}
	});
});
