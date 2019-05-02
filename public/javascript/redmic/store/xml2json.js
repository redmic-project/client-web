define([
	"dojo/_base/declare",
	"dojo/_base/lang",
	"dojo/Deferred",
	"dojo/dom-attr",
	"dojo/request"
], function(
	declare,
	lang,
	Deferred,
	domAttr,
	request
){
	return declare(null, {
		// summary:
		// 	Widget de Dojo para consultar un XML, transformarlo y devolverlo como JSON.
		// description:
		// 	Widget de Dojo para consultar un XML, transformarlo y devolverlo como JSON.

		// url: String
		// 	Dirección o ruta donde se encuentra el XML de entrada.
		url: "",

		// timeout: int
		// 	Tiempo en milisegundos de espera por la respuesta antes de dar error.
		timeout: 10000,

		// overflow: Boolean
		// 	Informa si ha habido desbordamiento.
		overflow: false,


		constructor: function(/*Object*/ args) {

			lang.mixin(this, args);
		},

		isOverflowed: function() {
			// summary:
			//		Comprueba si hay más resultados pendientes.
			// returns:
			//		Booleano según se detecte si hay más resultados pendientes.

			return this.overflow;	// return Boolean
		},

		find: function(/*Object*/ params) {
			// summary:
			//		Busca en el servicio y espera a tener respuesta.
			// params:
			//		Atributos de búsqueda.

			// Creamos un Deferred para esperar a que termine la consulta.
			this.deferred = new Deferred();

			// Reseteamos el detector de desbordamiento
			this.overflow = false;

			// Lanzamos la petición
			request(this._generateUrl(params), {
				handleAs: "xml",
				timeout: this.timeout
			}).then(
				lang.hitch(this, this._parse),
				lang.hitch(this, this._error)
			);

			// Devolvemos el promise del Deferred para tratarlo fuera
			return this.deferred;
		},

		_parse: function(/*Object*/ data) {
			// summary:
			//		Transforma los datos del XML a JSON.
			// tags:
			//		private
			// data:
			//		Información de entrada para transformar.

			var outJson = {},
				root = data.childNodes[0],	// Nodo raíz extraído
				urlnext = domAttr.get(root, "urlnext"),	// Siguiente página de resultados
				total = domAttr.get(root, "total"),
				children = root.childNodes,	// Topónimos
				element = {};

			if (urlnext) {
				this.overflow = true;
			}

			for (var i = 0; i < children.length; i++) {
				var attributes = children[i].childNodes;

				element = {};
				for (var j = 0; j < attributes.length; j++) {
					var attribute = attributes[j].childNodes[0],
						value = attribute ? attribute.data : null,
						name = attributes[j].nodeName;
					element[name] = value;
				}
				outJson[i] = element;
			}

			// Resolvemos el Deferred
			this.deferred.resolve({
				data: outJson,
				total: parseInt(total, 10)
			});
		},

		_error: function(/*Object*/ err) {
			// summary:
			//		Informa de un error en la petición.
			// tags:
			//		private
			// err:
			//		Información del error.

			// Resolvemos el Deferred
			this.deferred.cancel(err);
		},

		_generateUrl: function(/*Object*/ params) {
			// summary:
			//		Preparamos la url con el proxy y los parámetros.
			// tags:
			//		private
			// params:
			//		Atributos de búsqueda.

			var query = "";
			for (var key in params) {
				var hasSeveralQuestionMarks = this.url.indexOf("?") !== -1;
				query += hasSeveralQuestionMarks ? "&" : "?";
				query += key + "=" + params[key];
			}

			return this.url + query;
		}
	});
});
