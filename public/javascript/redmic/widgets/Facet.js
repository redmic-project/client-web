define([
	"dojo/_base/declare"
	, "dijit/TitlePane"
	, "dojo/_base/lang"
	, "dojo/Evented"
	, 'dojo/query'
	, "put-selector/put"
], function(
	declare
	, TitlePane
	, lang
	, Evented
	, query
	, put
) {

	return declare([TitlePane, Evented], {

		constructor: function(args) {

			this.config = {
				maxInitialEntries: 5,
				termsFieldFacet: null,
				termSelection: [],
				bucketsKeys: [],
				facetsEntriesContainerClass: 'dijitTitlePaneContentOuter',
				collapseEntriesClass: 'collapseEntries',
				collapseToggleClass: 'collapseToggle',
				hiddenClass: 'hidden',
				events: {
					TERMS_CHANGED: "termsChanged",
					UPDATE_QUERY: "updateQuery",
					SHOW_MORE: 'showMore',
					SHOW_LESS: 'showLess',
					OPEN: 'open',
					CLOSE: 'close'
				}
			};

			lang.mixin(this, this.config, args);

			this.on(this.events.TERMS_CHANGED, this._generateQuery);

			this._render();
		},

		postCreate: function() {

			this.domNode.removeAttribute('widgetId');

			this.inherited(arguments);

			if (this.maxInitialEntries > 0) {
				this._evaluateNumberOfBuckets();
			}
		},

		_onTitleClick: function() {

			this.inherited(arguments);

			this._evaluateOpenStatus();

			var evt = this.open ? 'OPEN' : 'CLOSE';
			this.emit(this.events[evt], this.label);
		},

		_evaluateNumberOfBuckets: function() {

			var buckets = this.config.buckets;
			if (buckets.length > this.maxInitialEntries) {
				this._outerNode = query('.' + this.facetsEntriesContainerClass, this.domNode)[0];

				var toggleText;
				if (this.expanded) {
					toggleText = this.i18n.showLess;
				} else {
					toggleText = this.i18n.showMore;
					put(this._outerNode, '.' + this.collapseEntriesClass);
				}

				this._toggleNode = put(this.domNode, 'span.' + this.collapseToggleClass);
				this._setToggleShowText(toggleText);
				this._toggleNode.onclick = lang.hitch(this, this._onToggleShowMore);

				this._evaluateOpenStatus();
			}
		},

		_evaluateOpenStatus: function() {

			put(this._toggleNode, (this.open ? '!' : '.') + this.hiddenClass);
		},

		_onToggleShowMore: function() {

			if (query('.' + this.collapseEntriesClass, this.domNode).length) {
				put(this._outerNode, '!' + this.collapseEntriesClass);
				this._setToggleShowText(this.i18n.showLess);
				this.emit(this.events.SHOW_MORE, this.label);
			} else {
				put(this._outerNode, '.' + this.collapseEntriesClass);
				this._setToggleShowText(this.i18n.showMore);
				this.emit(this.events.SHOW_LESS);
			}
		},

		_setToggleShowText: function(text) {

			var total = this.config.buckets.length,
				fullText = text + ' (' + total + ')';

			this._toggleNode.innerHTML = fullText;
		},

		_render: function() {

			this.containerBucketsNode = put("div[data-redmic-id=$].bucket", this.label);
			this.content = this.containerBucketsNode;

			var buckets = this.config.buckets;

			for (var key in buckets) {
				this._insertBucket(buckets[key]);
			}

			var copyTermSelection = this.termSelection;

			for (var i = 0; i < this.termSelection.length; i++) {
				if (this.bucketsKeys.indexOf(this.termSelection[i]) == -1) {
					copyTermSelection.splice(i, 1);
				}
			}

			this.termSelection = copyTermSelection;
		},

		_insertBucket: function(bucket) {

			var labelText,
				key = bucket.key;

			if (this.i18n && this.i18n[key]) {
				labelText = this.i18n[key];
			} else {
				labelText = key;
			}

			var id_random = this._generateIDRandom(),
				bucketNode = put(this.containerBucketsNode, "div.containerBucket"),
				labelNode = put(bucketNode, "label[for=$][title=$].inlineRow.labelBucket", id_random, labelText, labelText);

			put(bucketNode, "label[for=$].labelBucket", id_random, "(" + bucket.doc_count + ")");

			var checkBoxNode = put(labelNode, "-input[type='checkbox'][id=$][data-redmic-id=$]", id_random, key);

			checkBoxNode.onchange = lang.hitch(this, this._eventClickCheckBox, checkBoxNode.getAttribute('data-redmic-id'));

			this.bucketsKeys.push(key);

			var indexTermSelection = this.termSelection.indexOf(key);

			if (indexTermSelection != -1) {
				checkBoxNode.checked = true;
			}
		},

		_generateIDRandom: function() {

			return Math.random().toString(36).substring(7);
		},

		_eventClickCheckBox: function(dataRedmicID) {

			this._exist(dataRedmicID) ? this._remove(dataRedmicID) : this._add(dataRedmicID);
			this.emit(this.events.TERMS_CHANGED);
		},

		_exist: function(term) {

			return this.termSelection.indexOf(term) === -1 ? false : true;
		},

		_add: function(term) {

			this.termSelection.push(term);
		},

		_remove: function(term) {

			this.termSelection.splice(this.termSelection.indexOf(term), 1);
		},

		_generateQuery: function() {

			var queryTerm = {};

			if (this.termSelection == 0) {
				queryTerm = null;
			} else {
				queryTerm[this.termsFieldFacet] = this.termSelection;
			}

			this.emit(this.events.UPDATE_QUERY, queryTerm, this.label);
		}
	});
});
