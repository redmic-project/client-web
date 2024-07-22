define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector/put'
	, 'redmic/modules/base/_Module'
	, 'redmic/modules/base/_Show'
	, 'redmic/modules/base/_Store'
	, 'templates/LoadingEmpty'
], function(
	declare
	, lang
	, put
	, _Module
	, _Show
	, _Store
	, TemplateEmpty
) {

	return declare([_Module, _Show, _Store], {
		//	summary:
		//		Cargador de plantillas.
		//	description:
		//		Recibe una plantilla y la muestra. También puede actualizar sus datos.

		constructor: function(args) {

			this.config = {
				actions: {
					CLEAR: 'clear',
					CHANGE_TEMPLATE: 'changeTemplate',
					UPDATED: 'updated'
				},
				events: {
					UPDATE: 'update'
				},
				ownChannel: 'templateDisplayer',
				data: {},
				containerClass: 'templateDisplayer'
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			var obj = {
				i18n: this.i18n
			};

			if (this.classEmptyTemplate) {
				obj.classTemplate = this.classEmptyTemplate;
			}

			this._emptyTemplate = TemplateEmpty(obj);

			this._prepareNodes();
			this._setContent(this._loadedTemplate);
		},

		_defineSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel('CHANGE_TEMPLATE'),
				callback: '_subChangeTemplate'
			},{
				channel : this.getChannel('CLEAR'),
				callback: '_subClear'
			});
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'UPDATE',
				channel: this.getChannel('UPDATED')
			});
		},

		_prepareNodes: function() {

			var node = this._getNodeToShow(),
				customClass = this['class'];

			put(node, '.' + this.containerClass);

			if (customClass) {
				put(node, '.' + customClass);
			}

			if (this.template) {
				this._loadedTemplate = this._loadTemplate(this.template, this.data);
			} else {
				this._loadedTemplate = this._emptyTemplate;
			}
		},

		_loadTemplate: function(template, data) {

			if (!template) {
				return;
			}

			return template({
				data: data || {},
				shownOption: this.shownOption || {},
				i18n: this.i18n
			});
		},

		_subChangeTemplate: function(request) {

			this.template = request.template;

			this._loadedTemplate = this._loadTemplate(this.template, this.data);
			this._setContent(this._loadedTemplate);
		},

		_subClear: function(request) {

			this._setContent(this._emptyTemplate);
		},

		_beforeShow: function(request) {

			var data = request.data;

			if (data && this.template) {
				this.data = data;
				this._loadedTemplate = this._loadTemplate(this.template, this.data);
				this._setContent(this._loadedTemplate);
			}
		},

		_setContent: function(content) {

			var node = this._getNodeToShow();

			node.innerHTML = content;

			this._emitEvt('UPDATE', {
				data: this.data
			});
		},

		_dataAvailable: function(response) {

			var data = response.data[0] ? response.data[0] : response.data;
			this._updateData(data);
		},

		_itemAvailable: function(response) {

			var data = response.data;
			this._updateData(data);
		},

		_updateData: function(data) {

			this.data = data;
			this._loadedTemplate = this._loadTemplate(this.template, data);
			this._setContent(this._loadedTemplate);
		},

		_getNodeToShow: function() {

			return this.domNode;
		}
	});
});
