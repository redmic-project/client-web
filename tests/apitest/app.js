var express = require("express"),
	app = express(),
	http = require("http"),
	server = http.createServer(app);


app.configure(function () {
	app.use(express.logger('dev'));
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(app.router);
});


function find (json, id) {
	for (var j in json) {
		if (json[j].id == id) {
			return j;
		}
	}
	return -1;
}

function checkHeader (header, method, total) {
	var check = true;

	if (method == "getAll") {
		if (!header.range || !header['x-range']) {
			check = false;
		}
	}

	if (method == "post" || method == "put") {
		if (header['content-type'].indexOf("application/json") == -1) {
			check = false;
		}
	}

	if ((header.accept.indexOf("application/json") == -1) && (header.accept.indexOf("application/javascript") == -1)) {
		check = false;
	}

	return check;
}

function checkBody (body, method) {
	var check = true,
		bodyLength = JSON.stringify(body).length;

	if (bodyLength < 3) {
		check = false;
	}

	/*if (method == "post")
		for (var key in body) {
			if (key == "id")
				check = false;
		}*/

	return check;
}

function appGet (req, res) {
	var service = req.params[0],
		response;

	if (!services[service]) {
		var error = service[service.length-2]+service[service.length-1];

		switch(error) {
			case "03":
				response = {
					success: false,
					error: {
						code: "2003",
						description: "No tiene permiso."
					}
				};
				break;
			default:
				res.status(404);
		}
	} else {
		var data = services[service],
			total = data.length;

		if (checkHeader(req.headers, "getAll", total)) {
			var minRange, maxRange, max,
				resObj = [];

			minRange = req.headers.range.split("=")[1].split("-")[0];
			max = req.headers.range.split("=")[1].split("-")[1];
			maxRange = max > total ? total : max;
			res.setHeader("content-range", "items "+minRange+"-"+maxRange+"/"+total);

			for (var i = minRange-1; i < maxRange; i++) {
				resObj.push(data[i]);
			}
			response = {
				success: true,
				body: resObj
			};
		} else {
			response = {
				success: false,
				error: {
					code: "2005",
					description: "Error en la cabecera."
				}
			};
		}
	}

	res.send(response);
}

function appGetWithId (req, res) {
	var service = req.params[0],
		response;

	if (services[service]) {
		var data = services[service],
			total = data.length;

		if (!checkHeader(req.headers, "get", total)) {
			response = {
				success: false,
				error: {
					code: "2005",
					description: "Error en la cabecera."
				}
			};
		} else {
			switch(req.params.id) {
				case "03":
					response = {
						success: false,
						error: {
							code: "2003",
							description: "No tiene permiso."
						}
					};
					break;
				default:
					var index = find(data, req.params.id);

					if (index >= 0) {
						response = {
							success: true,
							body: data[index]
						};
					} else {
						response = {
							success: false,
							error: {
								code: "2002",
								description: "El objeto no existe."
							}
						};
					}
			}
		}
	} else {
		res.status(404);
	}

	res.send(response);
}

function appPost (req, res) {
	var service = req.params[0],
		response;

	if (!services[service]) {
		var error = service[service.length-2]+service[service.length-1];

		switch(error) {
			case "01":
				response = {
					success: false,
					error: {
						code: "1001",
						description: "Ya existe un valor igual en un campo 'unique'."
					}
				};
				break;
			case "03":
				response = {
					success: false,
					error: {
						code: "1003",
						description: "No tiene permiso."
					}
				};
				break;
			default:
				res.status(404);
		}
	} else {
		var data = services[service],
			total = data.length;

		if (!checkHeader(req.headers, "post", total)) {
			response = {
				success: false,
				error: {
					code: "1005",
					description: "Error en la cabecera."
				}
			};
		} else {
			if (!checkBody(req.body, "post")) {
				response = {
					success: false,
					error: {
						code: "1006",
						description: "Error en el cuerpo."
					}
				};
			} else {
				var resObj = req.body;
				resObj.id = total + 1;
				response = {
					success: true,
					body: resObj
				};
			}
		}
	}

	res.send(response);
}

function appPut (req, res) {
	var service = req.params[0],
		response;

	if (services[service]) {
		var data = services[service],
			total = data.length;

		if (!checkHeader(req.headers, "put", total)) {
			response = {
				success: false,
				error: {
					code: "3005",
					description: "Error en la cabecera."
				}
			};
		} else {
			if (!checkBody(req.body, "put")) {
				response = {
					success: false,
					error: {
						code: "3006",
						description: "Error en el cuerpo."
					}
				};
			} else {
				switch(req.params.id) {
					case "01":
						response = {
							success: false,
							error: {
								code: "3001",
								description: "Ya existe un valor igual en un campo 'unique'."
							}
						};
						break;
					case "03":
						response = {
							success: false,
							error: {
								code: "3003",
								description: "No tiene permiso."
							}
						};
						break;
					default:
						var index = find(data, req.params.id);

						if (index >= 0) {
							var resObj = req.body;
							resObj.id = req.params.id;
							response = {
								success: true,
								body: resObj
							};
						} else {
							response = {
								success: false,
								error: {
									code: "3002",
									description: "El objeto no existe."
								}
							};
						}
				}
			}
		}
	} else {
		res.status(404);
	}

	res.send(response);
}

function appDelete (req, res) {
	var service = req.params[0],
		response;

	if (services[service]) {
		var data = services[service],
			total = data.length;

		if (!checkHeader(req.headers, "delete", total)) {
			response = {
				success: false,
				error: {
					code: "4005",
					description: "Error en la cabecera."
				}
			};
		} else {
			switch(req.params.id) {
				case "03":
					response = {
						success: false,
						error: {
							code: "4003",
							description: "No tiene permiso."
						}
					};
					break;
				case "04":
					response = {
						success: false,
						error: {
							code: "4004",
							description: "No se puede borrar, es una FK."
						}
					};
					break;
				default:
					var index = find(data, req.params.id);

					if (index >= 0) {
						response = {
							success: true
						};
					} else {
						response = {
							success: false,
							error: {
								code: "4002",
								description: "El objeto no existe."
							}
						};
					}
			}
		}
	} else {
		res.status(404);
	}

	res.send(response);
}

var services = {},
	serviceNames = [
		"programs",
		"contacts",
		"scopes",
		"organisations"
	],
	pathRoot = '/test';

for (var key in serviceNames) {

	services[serviceNames[key]] = require("./data/inputs/" + serviceNames[key] + ".json");

	// Rutas para el método GET
	app.get(pathRoot + '/:' + key + '/', appGet);
	app.get(pathRoot + '/:' + key + '/:id', appGetWithId);

	// Ruta para el metodo POST
	app.post(pathRoot + '/:' + key + '/', appPost);

	// Ruta para el método PUT
	app.put(pathRoot + '/:' + key + '/:id', appPut);

	// Ruta para el método DELETE
	app['delete'](pathRoot + '/:' + key + '/:id', appDelete);
}

var port = 3005;
server.listen(port, function() {
	console.log("Node server running on http://localhost:" + port);
});
