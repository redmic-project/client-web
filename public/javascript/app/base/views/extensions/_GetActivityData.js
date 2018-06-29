define([
	"app/redmicConfig"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "./_GetActivityDataItfc"
], function(
	redmicConfig
	, declare
	, lang
	, aspect
	, _Itfc
){
	return declare(_Itfc, {
		//	summary:
		//		Extensión para las vistas que necesitan datos de una actividad
		//	description:
		//

		constructor: function(args) {

			this.config = {
				activityTarget: redmicConfig.services.activity
			};

			lang.mixin(this, this.config);

			aspect.after(this, "_initialize", lang.hitch(this, this._initializeGetActivityData));
			aspect.before(this, "_itemAvailable", lang.hitch(this, this._itemGetActivityDataAvailable));
		},

		_initializeGetActivityData: function() {

			if (this.target) {
				if (this.target instanceof Array) {
					this.target.push(this.activityTarget);
				} else {
					this.target = [this.target, this.activityTarget];
				}
			} else {
				this.target = [this.activityTarget];
			}

			this._emitGetActivity();
		},

		_emitGetActivity: function() {

			this._emitEvt('GET', {
				target: this.activityTarget,
				requesterId: this.getOwnChannel(),
				id: this._gotActivityId()
			});
		},

		_itemGetActivityDataAvailable: function(res) {

			var target = res.target,
				data = res.data;

			if (this.activityTarget === target) {
				this._gotActivityData(data);
			}
		},

		_gotActivityId: function() {

			return this.pathVariableId;
		}
	});
});
