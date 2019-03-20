function initModel() {
	var sUrl = "/sap/opu/odata/sap/ZTR_MA_QUAL_ODATA_SRV/";
	var oModel = new sap.ui.model.odata.ODataModel(sUrl, true);
	sap.ui.getCore().setModel(oModel);
}