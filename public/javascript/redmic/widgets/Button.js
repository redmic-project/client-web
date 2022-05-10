define([
	"dojo/_base/declare"
	, "dijit/_WidgetBase"
	, "dojo/_base/lang"
	, "dojo/Evented"
	, "put-selector/put"
], function(
	declare
	, _WidgetBase
	, lang
	, Evented
	, put
) {
	return declare([_WidgetBase, Evented], {

		//	summary:
		//		Widget
		//
		// description:
		//

		constructor: function(args) {

			this.config = {
				iconClass: null,
				label: null,
				classDefault: ".button.dijitButton",
				href: null,
				title: null,
				onClick: null,
				events: {
					DISABLE: "disable",
					ENABLE: "enable"
				}
			};

			lang.mixin(this, this.config, args);

			this.on(this.events.DISABLE, lang.hitch(this, this._disable));
			this.on(this.events.ENABLE, lang.hitch(this, this._enable));
		},

		postCreate: function() {

			this.domNode.removeAttribute('widgetId');

			this.inherited(arguments);

			put(this.domNode, this.classDefault);

			this._initialize();
		},

		_initialize: function() {

			this.buttonNode = put(this.domNode, "a.dijitButtonNode");

			if (this.iconClass || this.label || this.href || this.onClick) {
				this._createButton();
			}
		},

		reset: function() {

			put(this.buttonNode, "!");

			delete this.iconClass;
			delete this.label;
			delete this.href;
			delete this.onClick;

			this._initialize();
		},

		_createButton: function() {

			if (this.title) {
				this.buttonNode.setAttribute('title', this.title);
			}

			if (this.iconClass) {
				this.iconNode = put(this.buttonNode, 'i');
				this.iconNode.setAttribute('class', this.iconClass);
			}

			if (this.label) {
				this.spanNode = put(this.buttonNode, 'span', this.label);
			}

			if (this.href) {
				this.buttonNode.setAttribute('href', this.href);
				this.buttonNode.setAttribute('d-state-url', true);
			} else if (this.onClick)
				this.buttonNode.onclick = this.onClick;

			if (this.disable) {
				this._disable();
			}
		},

		createButton: function(item) {

			if (item.title)
				this.title = item.title;

			if (item.iconClass)
				this.iconClass = item.iconClass;

			if (item.label)
				this.label = item.label;

			if (item.href)
				this.href = item.href;
			else if (item.onClick)
				this.onClick = item.onClick;

			this._createButton();
		},

		updateLabel: function(label) {

			this.label = label;

			if (!this.spanNode) {
				this.spanNode = put(this.buttonNode, 'span', this.label);
			}

			this.spanNode.innerHTML = this.label;
		},

		updateIcon: function(iconClass) {

			this.iconClass = iconClass;

			this.iconNode.setAttribute('class', this.iconClass);
		},

		updateOnClick: function(onClick) {

			this.onClick = onClick;

			this.buttonNode.onclick = onClick;
		},

		updateHref: function(href) {

			this.href = href;

			this.buttonNode.setAttribute('href', this.href);
		},

		_disable: function() {

			if (this.onClick) {
				this.buttonNode.onclick = null;
			} else {
				this.buttonNode.href = null;
			}

			put(this.buttonNode, ".disable");
		},

		_enable: function() {

			if (this.onClick) {
				this.buttonNode.onclick = this.onClick;
			} else {
				this.buttonNode.href = this.href;
			}

			put(this.buttonNode, "!disable");
		},

		hide: function() {

			put(this.domNode, ".hidden");
		},

		show: function() {

			put(this.domNode, "!hidden");
		}
	});
});
