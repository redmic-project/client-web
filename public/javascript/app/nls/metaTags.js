define({
	root: {
		"default": {
			"title": "Repositorio de Datos Marinos Integrados de Canarias",
			"description": "REDMIC es una infraestructura de datos marinos de caracter "+
				"público que ofrece información sobre el medio biofísico marino de Canarias.",
			"keywords": "Especies marinas de Canarias, Biodiversidad marina en Canarias, Fauna marina de Canarias,"+
				" Especies marinas de la Macaronesia, Biodiversidad marina de la Macaronesia, "+
				"Fauna marina de la Macaronesia, Habitat marina de Canarias, Habitat marina de la Macaronesia, "+
				"Repositorio de dastos marinos de Canarias",
			"author": "Observatorio Ambiental Granadilla (OAG)",
			"og:title": "REDMIC, Repositorio de Datos Marinos Integrados de Canarias",
			"og:description": "REDMIC es una infraestructura de datos marinos de caracter "+
				"público que ofrece información sobre el medio biofísico marino de Canarias."
		},
		"/catalog/activities-catalog": {
			"title": "Catálogo de actividades",
			"description": "Listado de actividades que generan datos relacionados con el medio marino",
			"keywords": "Análisis de aguas de Canarias, Análisis de sedimentos de Canarias, "+
				"Avistamientos marinos de Canarias, Biometrías y desarrollo de Canarias, "+
				"Censos lineales de Canarias, Corología documentada de Canarias, Demarcación jurisdiccional de Canarias, "+
				"Dinámica marina de Canarias, Infraestructuras y usos en Canarias, Inventario de hábitats de Canarias, "+
				"Levantamientos batimétricos de Canarias, Muestreo biológico de Canarias, Radiotracking en Canarias, "+
				"Recuperación de animales en Canarias, Registros climáticos en Canarias, "+
				"Sondeos multiparamétricos en Canarias, Varamientos en Canarias"
		},
		"/catalog/activity-info/{id}": {
			"title": "{name}",
			"description": "Información sobre la actividad - {name}",
			"keywords": "{activityType.name}"
		},
		"/catalog/activity-infrastructure/{id}": {
			"title": "{name}",
			"description": "{description}",
			"keywords": "{activityType.name}"
		},
		"/catalog/project-catalog": {
			"title": "Catálogo de proyectos",
			"description": "Listado de proyectos en los que se subdividen los programas y a la vez aglutinan un conjunto de actividades",
			"keywords": "Bionomía béntica de Canarias, Demarcaciones administrativas de Canarias, "+
				"Distribución y migración de especies en Canarias, Inventario de infraestructuras marinas en Canarias, "+
				"Inventarios biológicos en Canarias, Levantamiento batimétrico en Canarias, "+
				"Monitorización oceánica de Canarias, Vigilancia ambiental de Canarias"
		},
		"/catalog/project-info/{id}": {
			"title": "{name}",
			"description": "Información sobre el proyecto - {name}",
			"keywords": "{projectGroup.name}, {name}"
		},
		"/catalog/program-catalog": {
			"title": "Catálogo de programas",
			"description": "Listado de programas en los que se agrupan los proyetos",
			"keywords": ""
		},
		"/catalog/program-info/{id}": {
			"title": "{name}",
			"description": "Información sobre el programa - {name}",
			"keywords": "{name}"
		},
		"/catalog/organisation-catalog": {
			"title": "Catálogo de organizaciones",
			"description": "Listado de organizaciones que han participado en alguna actividad",
			"keywords": ""
		},
		"/catalog/organisation-info/{id}": {
			"title": "{name}",
			"description": "Información de la organización - {name}",
			"keywords": "{organisationType.name}, {acronym}, {name}"
		},
		"/catalog/platform-catalog": {
			"title": "Catálogo de plataformas",
			"description": "Listado de plataformas que están relacionadas con alguna actividad",
			"keywords": ""
		},
		"/catalog/platform-info/{id}": {
			"title": "{name}",
			"description": "Información sobre la plataforma - {name}: {description}",
			"keywords": "{platformType.name} {name}"
		},
		"/catalog/species-catalog": {
			"title": "Catálogo de especies",
			"description": "Listado de especies marinas registradas dentro del ámbito geográfico de la Macaronesia",
			"keywords": "Especies Atlánticas, Especies Canarias, Especies de la Macaronesia, Especies bentónicas, "+
				"Especies demersales, Especies pelágicas, Especie peligrosa, Especies de interés pesquero, "+
				"Especies de uso industrial, Especies de uso ornamental, Especies en peligro de extinción, "+
				"Especies no catalogadas, Epecies vulnerables, "+
				"Especies de protección especial, Especies en Directiva Hábitat (Anexo II+IV), "+
				"Especies en Directiva Hábitat (Anexo IV)"
		},
		"/catalog/species-info/{id}": {
			"title": "{scientificName}, {authorship}",
			"description": "Información sobre la especie - {scientificName}, {authorship}",
			"keywords": "{scientificName}, {authorship}, Especie marina, Distribución geográfica"
		},
		"/bibliography": {
			"title": "Biblioteca marina de Canarias",
			"description": "Recopilación de documentos relacionados con el medio marino de Canarias de cualquier "+
				"tipo: informes, revistas, libros, manuales, estudios …",
			"keywords": "Biblioteca marina de Canarias, documentos medio marino de Canarias, estudios oceanográficos, " +
				"informes marinos, proyectos Canarias, tesinas mar"
		},
		"/bibliography/document-info/{id}": {
			"title": "{title}",
			"description": "{title}, autor: {author}, año: {year}, fuente: {source}",
			"keywords": "{documentType.name}, {keyword}"
		},
		"/home": {
			"title": "Bienvenido a REDMIC",
			"description": "Inicio de la plataforma REDMIC. Aquí podrá acceder a los módulos disponibles en la plataforma",
			"keywords": "Catálogo de especies marinas de Canarias, Biblioteca marina de Canarias, "+
				"Distribución geográfica de especies marinas en Canarias, Atlas marino de Canarias, Catálogo de servicios OGC"
		},
		"/service-ogc-catalog": {
			"title": "Servicios OGC",
			"description": "Listado de servicios de mapas siguiendo los estándares de la OGC, tanto para protocolos WMS o WMTS",
			"keywords": "batimetrías de Canarias, Consorcio de la Zona Especial Canaria, ZEC, "+
				"Zonas de Especial Protección para las Aves, ZEPA, reservas marinas de Canarias, Web Map Service, WMS, "+
				"Web Map Tile Service, WMTS, Tile Map Service, TMS"
		},
		"/service-ogc-catalog/service-ogc-info/{id}": {
			"title": "{title}",
			"description": "{abstractLayer}",
			"keywords": "{keyword}"
		},
		"/atlas": {
			"title": "Atlas",
			"description": "Selección de capas de datos marinos georeferenciados de interés público, agrupadas por temas",
			"keywords": "Atlas marino de Canarias, Mapa topográfico de Canarias, Batimetría costera de Canarias, "+
			"Batimetría de La Macaronesia, Batimetría del Archipiélago de Canarias, Atlas costero Canarias"
		},
		"/viewer/species-distribution": {
			"title": "Distribución de especies marinas",
			"description": "Módulo de análisis de la distribución de especies marinas que se encuentran en Canarias. "+
				"Cuenta con diferentes modos de visualizar los datos: presencia, nº de registros, nº de especies o "+
				"citas de especies. Los tres primeros tipos son combinables con los diferentes tamaños de cuadrículas.",
			"keywords": "Distribución geográfica de especies marinas en Canarias, Distribución geográfica, "+
				"Presencia de especies marinas en Canarias, Registro de especies marinas en Canarias, "+
				"Número de especies marinas en Canarias, Biota marino Canarias, Biota Canarias"
		},
		"/register": {
			"title": "Registro",
			"description": "Registrarse en REDMIC",
			"keywords": "Nueva cuenta en REDMIC, Registrarse en REDMIC, Acceso a REDMIC"
		},
		"/terms-and-conditions": {
			"title": "Términos y condiciones",
			"description": "Términos y condiciones de registro en REDMIC",
			"keywords": "Términos y condiciones de REDMIC, Aviso legal, Compromisos del usuario registrado"
		},
		"/what-is-redmic": {
			"title": "¿Qué es REDMIC?"
		},
		"/inner-terms-and-conditions": {
			"title": "Términos y condiciones",
			"description": "Términos y condiciones de registro en REDMIC",
			"keywords": "Términos y condiciones de REDMIC, Aviso legal, Compromisos del usuario registrado"
		},
		"/inner-what-is-redmic": {
			"title": "¿Qué es REDMIC?"
		},
		"/feedback": {
			"title": "Contacto",
			"description": "Formulario de contacto de REDMIC",
			"keywords": ""
		},
		"/viewer/charts": {
			"title": "Series temporales",
			"description": "Módulo para visualizar las series de datos temporales por estaciones de muestreo." +
				" Permite representar gráficamente datos meteorológicos, como presión atmosférica, pluviometría," +
				" velocidad del viento, etc., oceanográficos, como temperatura, salinidad, oxígeno disuelto, etc.," +
				" entre otros posibles.",
			"keywords": ""
		},
		"/viewer/trash-collection": {
			"title": "Inventario de basura",
			"description": "Módulo para visualizar los transectos y datos derivados de los inventarios de basura" +
				" realizados en playas. Permite representar los datos derivados en tablas y gráficamente",
			"keywords": ""
		},
		"/viewer/tracking": {
			"title": "Seguimiento de animales y objetos marinos",
			"description": "Módulo de rastreo de animales, como la tortuga boba, cetáceos, aves, etc., y objetos, como "+
				"barcos, boyas a la deriva, etc., presentes en el medio marino. Permite visualizar posiciones de manera "+
				"secuencial y por tiempo de medición, asi como consultar la información completa de cada punto.",
			"keywords": ""
		},
		"/catalog/species-location/{id}": {
			"title": "{scientificName}",
			"description": "Módulo para visualizar las citas de la especie - {scientificName}, {authorship}",
			"keywords": ""
		},
		"/catalog/activity-tracking/{id}": {
			"title": "{name}",
			"description": "Módulo de seguimiento del animal, como la tortuga boba, cetáceo, ave, etc., u objeto, como "+
				"barco, boya a la deriva, etc., presente en el medio marino. Permite visualizar posiciones de manera "+
				"secuencial y por tiempo de medición, asi como consultar la información completa de cada punto.",
			"keywords": "{activityType.name}"
		},
		"/catalog/activity-map/{id}": {
			"title": "{name}",
			"description": "Módulo para visualizar las especies presentes en la actividad - {name}",
			"keywords": "{activityType.name}"
		}
	}
	//, "es": true
});