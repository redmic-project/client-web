define([
	"dojo/_base/declare"
	, "dojo/_base/lang"
	, "put-selector/put"
	, 'RWidgets/ComboButton'
], function(
	declare
	, lang
	, put
	, RComboButton
){
	return declare(null, {
		//	summary:
		//
		//	description:
		//
		constructor: function(args) {

			this.config = {
				_groups: {}
			};

			lang.mixin(this, this.config, args);
		},

		_createButton: function(config) {

			if (!config.groupId) {
				return this.inherited(arguments);
			}

			this._addGroupIconsButtons(config);
		},

		_updateButton: function(item, config, node) {

			if (!config.groupId) {
				return this.inherited(arguments);
			}

			this._updateGroupIconsButtons(item, config, node);
		},

		_addGroupIconsButtons: function(config) {

			var cButton = new RComboButton();

			this._groups[config.groupId] = cButton;

			cButton.placeAt(this.domNode);
			cButton.startup();
		},

		_updateGroupIconsButtons: function(item, config, node) {

			var cButton = this._groups[config.groupId],
				defaultSet = false;

			cButton.reset();

			for (var i = 0; i < config.icons.length; i++) {

				this._totalButtons ++;

				var configIcon = config.icons[i],
					title = configIcon.title,
					href = configIcon.href,
					pathToItem = configIcon.pathToItem,
					obj = {
						title: this.i18n[title] ? this.i18n[title] : title,
						iconClass: "fa " + configIcon.icon
					},
					condition = configIcon.condition;

				if (!(condition !== undefined && !this._evaluateCondition(item, condition))) {
					if (href) {
						var itemReplace = pathToItem ? Utilities.getDeepProp(item, pathToItem) : item;
						obj.href = lang.replace(href, itemReplace);
					} else {
						obj.onClick = lang.hitch(this, this._eventClickButton, configIcon, item, node);
					}

					if ((configIcon.option && configIcon.option === "default" && !defaultSet) ||
						(!defaultSet && i === config.icons.length - 1)) {

						cButton.createButton(obj);
						defaultSet = true;
					} else {
						cButton.insertRowInDropDown(obj);
					}
				} else {
					this._buttonsOccult ++;
				}
			}
		}
	});
});
