define([
	"cbtree/model/ForestStoreModel"
	, "cbtree/store/ObjectStore"
	, "cbtree/Tree"
	, "dojo/_base/declare"
	, "dojo/_base/lang"
	, "dojo/aspect"
	, "./Tree"
], function(
	Model
	, Store
	, Cbtree
	, declare
	, lang
	, aspect
	, Tree
){
	return declare(Tree, {
		//	summary:
		//		Implementación de cbtree.
		//	description:
		//		Proporciona la fachada para trabajar con cbtree.

		//	config: Object
		//		Opciones y asignaciones por defecto.


		constructor: function(args) {

			this.config = {
				target: null,

				store: null,
				data: null,
				idProperty: "path",
				parentProperty: "parent",

				model: null,
				checkedAttr: "checked",
				checkedState: false,
				labelAttr: "label",

				showRoot: false,
				openOnChecked: false
			};

			lang.mixin(this, this.config, args);
		},

		_initialize: function() {

			this._storeInitialize();

			this.model = new Model(this._getConfig());

			this.tree = new Cbtree({
				model: this.model,
				showRoot: this.showRoot,
				openOnChecked: this.openOnChecked
			});
		},

		_storeInitialize: function() {

			this.store = new Store({
				idProperty: this.idProperty,
				parentProperty: this.parentProperty
			});

			this._insertDataIntoStore(this.data);

			this.model && this.model.set("store", this.store);
		},

		_getConfig: function() {

			var initialQuery = {};
			initialQuery[this.parentProperty] = null;

			return {
				labelAttr: this.labelAttr,
				checkedAttr: this.checkedAttr,
				checkedState: this.checkedState,
				store: this.store,
				query: initialQuery
			};
		},

		_doEvtFacade: function() {

			this._doStoreEvtFacade();
			this._doModelEvtFacade();
			this._doTreeEvtFacade();
		},

		_doStoreEvtFacade: function() {

			this.store.on("new", lang.hitch(this, this._groupEventArgs, 'DATAADD'));
			this.store.on("change", lang.hitch(this, this._groupEventArgs, 'DATAUPDATE'));
			this.store.on("delete", lang.hitch(this, this._groupEventArgs, 'DATADELETE'));
		},

		_doModelEvtFacade: function() {

			this.model.on("childrenChange", lang.hitch(this, this._groupEventArgs, 'CHILDRENCHANGE'));
		},

		_doTreeEvtFacade: function() {

			this.tree.on("checkBoxClick", lang.hitch(this, this._groupEventArgs, 'CHECKBOXCLICK'));
		},

		getNodeToShow: function() {

			return this.tree.domNode;
		},

		_afterShow: function() {

			this.tree.startup();
		},

		getItem: function(id) {
			return this.store.get(id);
		},

		putItem: function(data) {
			this.store.put(data);
		},

		isItem: function(item) {
			return this.store.isItem(item);
		},

		query: function(query) {
			return this.store.query(query);
		},

		getIdentity: function(item) {
			return this.store.getIdentity(item);
		},

		close: function() {
			return this.store.close();
		},

		getChecked: function(item) {

			if (this.isItem(item))
				return this.model.getChecked(item);

			return null;
		},

		setChecked: function(item, value) {
			this.model.setChecked(item, value);
		},

		getModelChildren: function(parent, onComplete, onError) {
			this.model.getChildren(parent, onComplete, onError);
		},

		getDecendants: function(parentPath, onComplete, onError) {

			var reg = new RegExp("^"+parentPath.replace(".","\.") + ".*"),
				items = [],
				query = {};

			query[this.idProperty] = reg;

			this.store.query(query).forEach(lang.hitch(this, function(result) {
				if (result[this.idProperty] !== parentPath)
					items.push(result);
			}));

			onComplete(items);
		},

		getModelParents: function(item) {
			return this.model.getParents(item);
		}
	});
});
