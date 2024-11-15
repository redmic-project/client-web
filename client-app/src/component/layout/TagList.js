define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'dojo/dom-class'
	, 'put-selector'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
], function(
	declare
	, lang
	, domClass
	, put
	, _Module
	, _Show
) {

	return declare([_Module, _Show], {
		//	summary:
		//		Visualizador de listado de etiquetas, con eventos de interacción sobre las mismas.

		constructor: function(args) {

			this.config = {
				ownChannel: 'tagList',
				events: {
					TAG_CLICKED: 'tagClicked'
				},
				actions: {
					TAG_CLICKED: 'tagClicked'
				},

				tagsString: '',
				tagsDelimiter: ',',
				simpleSelection: false,

				_tagsContainerClass: 'tagListContainer',
				_tagsClass: 'tagListItem',
				_tagSelectedClass: 'selected',

				_tagPropsByValue: {}
			};

			lang.mixin(this, this.config, args);
		},

		_definePublications: function() {

			this.publicationsConfig.push({
				event: 'TAG_CLICKED',
				channel : this.getChannel('TAG_CLICKED')
			});
		},

		_initialize: function() {

			put(this.domNode, '.' + this._tagsContainerClass);

			if (!this.tagsString || !this.tagsString.length) {
				console.error('No tags available to show at "%s"', this.getChannel());
				return;
			}

			this.tagsString.split(this.tagsDelimiter).forEach(lang.hitch(this, this._addTag));
		},

		_addTag: function(tagValue, tagIndex) {

			var tagNodeDefinition = 'span.' + this._tagsClass + '[title=' + this.i18n.select + ']',
				tagNodeContent = this.getTagLabel ? this.getTagLabel(tagValue, tagIndex) : tagValue,
				tagNode = put(this.domNode, tagNodeDefinition, tagNodeContent);

			this._tagPropsByValue[tagValue] = {
				label: tagNodeContent,
				index: tagIndex,
				node: tagNode
			};

			tagNode.onclick = lang.hitch(this, this._onTagClick, tagValue);

			this._manageSelectionOnTagAdd(tagValue, tagIndex);
		},

		_onTagClick: function(tagValue) {

			var tagProps = this._tagPropsByValue[tagValue];

			this._emitEvt('TAG_CLICKED', {
				value: tagValue,
				label: tagProps.label,
				index: tagProps.index
			});

			this._manageSelectionOnTagClick(tagValue);
		},

		_manageSelectionOnTagAdd: function(tagValue, tagIndex) {

			var tagProps = this._tagPropsByValue[tagValue],
				isTagSelected = this.getSelectedTags ? this.getSelectedTags(tagValue, tagIndex) : false,
				tagNode = tagProps.node;

			if (!isTagSelected) {
				return;
			}

			if (this.simpleSelection) {
				if (this._firstTagSelected) {
					return;
				}
				this._firstTagSelected = true;
			}

			this._selectTagNode(tagNode);
		},

		_manageSelectionOnTagClick: function(tagValue) {

			var tagProps = this._tagPropsByValue[tagValue],
				tagNode = tagProps.node;

			if (this.simpleSelection) {
				this._clearSelectTagNode();
				this._selectTagNode(tagNode);
			} else {
				this._toggleSelectTagNode(tagNode);
			}
		},

		_selectTagNode: function(tagNode) {

			domClass.add(tagNode, this._tagSelectedClass);
		},

		_deselectTagNode: function(tagNode) {

			domClass.remove(tagNode, this._tagSelectedClass);
		},

		_toggleSelectTagNode: function(tagNode) {

			domClass.toggle(tagNode, this._tagSelectedClass);
		},

		_clearSelectTagNode: function() {

			Object.values(this._tagPropsByValue).forEach(lang.hitch(this, function(item) {

				this._deselectTagNode(item.node);
			}));
		}
	});
});
