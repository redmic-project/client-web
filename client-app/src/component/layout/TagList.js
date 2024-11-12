define([
	'dojo/_base/declare'
	, 'dojo/_base/lang'
	, 'put-selector'
	, 'src/component/base/_Module'
	, 'src/component/base/_Show'
], function(
	declare
	, lang
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

				_tagsContainerClass: 'tagListContainer',
				_tagsClass: 'tagListItem'
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
				tagNodeContent = this.getTagLabel ? this.getTagLabel(tagValue) : tagValue,
				tagNode = put(this.domNode, tagNodeDefinition, tagNodeContent);

			tagNode.onclick = lang.hitch(this, this._onTagClick, {
				value: tagValue,
				label: tagNodeContent,
				index: tagIndex
			});
		},

		_onTagClick: function(args) {

			this._emitEvt('TAG_CLICKED', args);
		}
	});
});
