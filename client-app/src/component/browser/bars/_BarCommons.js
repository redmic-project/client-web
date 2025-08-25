define([
	'dojo/_base/declare'
], function(
	declare
) {

	return declare(null, {
		//	summary:
		//		Lógica común a componentes de barra.

		_getTotalValueFromResponse: function(response) {

			const resData = response.data,
				resPage = resData.page;

			let total = resPage?.totalElements ?? resData?.total ?? response.total;

			if (total === undefined || total === null) {
				total = resData?.content?.length ?? resData?.data?.total ?? resData.length;
			}

			return total;
		}
	});
});
