define([
	"dojo/_base/lang"
], function(
	lang
){
	return {
		//	summary:
		//		Extensión del módulo Form para que haga públicos los cambios realizados.
		//	description:
		//		Permite la publicación de los cambios de valor de las propiedades del formulario.
		//		Puede publicar sobre todas o sólo sobre algunas (si se las especificamos).

		publicateChangesEvents: {
			VALUE_CHANGED: "changed"
		},

		propertiesToListen: null,

		callbacks: {},

		timeout: 200,

		_mixEventsAndActions: function () {

			this.inherited(arguments);

			lang.mixin(this.events, this.publicateChangesEvents);
			delete this.publicateChangesEvents;
		},

		_definePublications: function () {

			this.inherited(arguments);

			this.publicationsConfig.push({
				event: 'VALUE_CHANGED',
				channel: this.getChannel("VALUE_CHANGED"),
				callback: "_pubValueChanged"
			});

			this._deleteDuplicatedChannels(this.publicationsConfig);
		},

		_subValueChanged: function(channel, res) {

			this.inherited(arguments);

			if (res && res.name) {

				if (this.callbacks[res.name]) {
					clearTimeout(this.callbacks[res.name]);
				}

				this.callbacks[res.name] = setTimeout(lang.hitch(this, function() {
					this._emitEvt('VALUE_CHANGED', res);
				}), this.timeout);
			}
		},

		_propertyShouldBeListened: function(property) {

			if (!this.propertiesToListen || this.propertiesToListen.indexOf(property) >= 0) {
				return true;
			}

			return false;
		},

		_pubValueChanged: function(channel, evt) {

			var property = evt.name,
				value = evt.value;

			if (!this._propertyShouldBeListened(property)) {
				return;
			}

			var obj = {
				property: property,
				value: value
			};

			if (evt.isValid !== undefined) {
				obj.isValid = evt.isValid;
			}

			this._publish(channel, obj);
		}
	};
});