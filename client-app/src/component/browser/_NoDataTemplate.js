define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, 'put-selector'
	, "templates/LoadingEmpty"
], function(
	declare
	, lang
	, aspect
	, put
	, NoDataTemplate
){
	return declare(null, {
		//	summary:
		//
		//	description:
		//

		constructor: function(args) {

			this.config = {
				noDataTemplateEvents: {
					NO_DATA_MSG_CLICKED: "noDataMsgClicked"
				},
				noDataTemplateActions: {
					UPDATE_NO_DATA_TEMPLATE: "updateNoDataTemplate",
					NO_DATA_MSG_CLICKED: "noDataMsgClicked"
				},
				noDataMessage: {
					definition: NoDataTemplate,
					props: {
						i18n: this.i18n
					}
				},

				contentListNoDataClass: 'contentListNoData'
			};

			lang.mixin(this, this.config, args);

			aspect.before(this, "_mixEventsAndActions", lang.hitch(this, this._mixNoDataTemplateEventsAndActions));
			aspect.after(this, "_defineSubscriptions", lang.hitch(this, this._defineNoDataTemplateSubscriptions));
			aspect.after(this, "_definePublications", lang.hitch(this, this._defineNoDataTemplatePublications));
			aspect.after(this, "_createBrowserContainer", lang.hitch(this, this._createNoDataTemplateBrowserContainer));

			aspect.before(this, "_dataAvailable", lang.hitch(this, this._clearNoDataFound));
			aspect.before(this, "_itemAvailable", lang.hitch(this, this._clearNoDataFound));

			aspect.after(this, "_dataAvailable", lang.hitch(this, this._checkNoDataFound));
			aspect.after(this, "_itemAvailable", lang.hitch(this, this._checkNoDataFound));
			aspect.after(this, "_clearData", lang.hitch(this, this._checkNoDataFound));
			aspect.after(this, "_removeItem", lang.hitch(this, this._checkNoDataFound));
		},

		_mixNoDataTemplateEventsAndActions: function () {

			lang.mixin(this.events, this.noDataTemplateEvents);
			lang.mixin(this.actions, this.noDataTemplateActions);

			delete this.noDataTemplateEvents;
			delete this.noDataTemplateActions;
		},

		_defineNoDataTemplateSubscriptions: function () {

			this.subscriptionsConfig.push({
				channel : this.getChannel("UPDATE_NO_DATA_TEMPLATE"),
				callback: "_subUpdateNoDataTemplate"
			});
		},

		_defineNoDataTemplatePublications: function() {

			this.publicationsConfig.push({
				event: 'NO_DATA_MSG_CLICKED',
				channel: this.getChannel("NO_DATA_MSG_CLICKED")
			});
		},

		_createNoDataTemplateBrowserContainer: function() {

			this._checkNoDataFound();
		},

		_subUpdateNoDataTemplate: function(obj) {

			this._updateNoDataTemplate(obj);
		},

		_updateNoDataTemplate: function(obj) {

			this.noDataMessage = obj.template;
		},

		_checkNoDataFound: function() {

			if (!this._rows) {
				return;
			}

			var exist = this._existsNoDataFound();

			if (Object.keys(this._rows).length === 0 ) {
				!exist && this._noDataFound();
			} else if (exist) {
				this._clearNoDataFound();
			}
		},

		_noDataFound: function() {

			var content = this.noDataMessage,
				props;

			if (this.noDataMessage) {

				if (typeof content === "object") {
					var tmplt = content.definition;

					props = content.props;

					if (tmplt) {
						content = tmplt(props);
					}
				}

				put(this.rowsContainerNode, '.hidden');

				this.noDataContainerNode = put(this.contentListNode, 'div.fWidth.fHeight');
				this.noDataContainerNode.innerHTML = content;

				if (props) {
					this._addClickInNoDataMessage(props);
				}
			}

			put(this.contentListNode, "." + this.contentListNoDataClass);
		},

		_addClickInNoDataMessage: function(props) {

			if (!props.clickable) {
				return;
			}

			put(this.noDataContainerNode, ".clickable");

			this.noDataContainerNode.onclick = lang.hitch(this, this._emitEvt, 'NO_DATA_MSG_CLICKED');
		},

		_clearNoDataFound: function() {

			if (this._existsNoDataFound()) {
				put(this.contentListNode, "!" + this.contentListNoDataClass);
				put(this.rowsContainerNode, '!hidden');
				this.noDataContainerNode && put(this.noDataContainerNode, "!");
			}
		},

		_existsNoDataFound: function() {

			if (this.contentListNode.getAttribute("class").includes(this.contentListNoDataClass)) {
				return true;
			}

			return false;
		}
	});
});
