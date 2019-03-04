sap.ui.define(["sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"./QualiDialog",
	"./utilities",
	"sap/ui/core/routing/History",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator"
], function (BaseController, MessageBox, QualiDialog, Utilities, History, Filter, FilterOperator) {
	"use strict";

	return BaseController.extend("com.sap.build.zeitconsulting.prototypePlaceholderName.controller.QualifikationHinzufugen", {
		handleRouteMatched: function (oEvent) {
			var sAppId = "App5c627a341ab5167ccc108c81";

			var oParams = {};

			if (oEvent.mParameters.data.context) {
				this.sContext = oEvent.mParameters.data.context;

			} else {
				if (this.getOwnerComponent().getComponentData()) {
					var patternConvert = function (oParam) {
						if (Object.keys(oParam).length !== 0) {
							for (var prop in oParam) {
								if (prop !== "sourcePrototype") {
									return prop + "(" + oParam[prop][0] + ")";
								}
							}
						}
					};

					this.sContext = patternConvert(this.getOwnerComponent().getComponentData().startupParameters);

				}
			}
			
			//Instance zum ueberschreiben.. 
			//this.sContext = "MitarbeiterSet('928828')";
			
			//this.Context ist der ausgewählte Mitarbeiter

			var oPath;

			if (this.sContext) {
				oPath = {
					path: "/" + this.sContext,
					parameters: oParams
				};
				this.getView().bindObject(oPath);
			}
			this.aRadioButtonGroupIds = ["sap_Responsive_Page_0-content-sap_m_HBox-1550568095056-items-sap_m_RadioButtonGroup-1551080418612"];
			this.handleRadioButtonGroupsSelectedIndex();
			
		},
		handleRadioButtonGroupsSelectedIndex: function () {
			var that = this;
			
			
			
			this.aRadioButtonGroupIds.forEach(function (sRadioButtonGroupId) {
				var oRadioButtonGroup = that.byId(sRadioButtonGroupId);
				var oButtonsBinding = oRadioButtonGroup ? oRadioButtonGroup.getBinding("buttons") : undefined;
				if (oButtonsBinding) {
					var oSelectedIndexBinding = oRadioButtonGroup.getBinding("selectedIndex");
					var iSelectedIndex = oRadioButtonGroup.getSelectedIndex();
					oButtonsBinding.attachEventOnce("change", function () {
						if (oSelectedIndexBinding) {
							oSelectedIndexBinding.refresh(true);
						} else {
							oRadioButtonGroup.setSelectedIndex(iSelectedIndex);
						}
					});
				}
			});
		},
		
		_onPageNavButtonPress: function (oEvent) {

			oEvent = jQuery.extend(true, {}, oEvent);
			return new Promise(function (fnResolve) {
					fnResolve(true);
				})
				.then(function (result) {
					var oHistory = History.getInstance();
					var sPreviousHash = oHistory.getPreviousHash();
					var oQueryParams = this.getQueryParameters(window.location);

					if (sPreviousHash !== undefined || oQueryParams.navBackToLaunchpad) {
						window.history.go(-1);
					} else {
						var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
						oRouter.navTo("default", true);
					}

				}.bind(this))
				.then(function (result) {
					if (result === false) {
						return false;
					} else {
						return new Promise(function (fnResolve) {
							var aChangedEntitiesPath, oChangedBindingContext;
							var oModel = this.oModel;
							if (oModel && oModel.hasPendingChanges()) {
								aChangedEntitiesPath = Object.keys(oModel.mChangedEntities);

								for (var j = 0; j < aChangedEntitiesPath.length; j++) {
									oChangedBindingContext = oModel.getContext("/" + aChangedEntitiesPath[j]);
									if (oChangedBindingContext && oChangedBindingContext.bCreated) {
										oModel.deleteCreatedEntry(oChangedBindingContext);
									}
								}
								oModel.resetChanges();
							}
							fnResolve();
						}.bind(this));

					}
				}.bind(this)).catch(function (err) {
					if (err !== undefined) {
						MessageBox.error(err.message);
					}
				});
		},
		getQueryParameters: function (oLocation) {
			var oQuery = {};
			var aParams = oLocation.search.substring(1).split("&");
			for (var i = 0; i < aParams.length; i++) {
				var aPair = aParams[i].split("=");
				oQuery[aPair[0]] = decodeURIComponent(aPair[1]);
			}
			return oQuery;

		},
		convertTextToIndexFormatter: function (sTextValue) {
			var oRadioButtonGroup = this.byId(
				"sap_Responsive_Page_0-content-sap_m_HBox-1550568095056-items-sap_m_RadioButtonGroup-1551080418612");
			var oButtonsBindingInfo = oRadioButtonGroup.getBindingInfo("buttons");
			if (oButtonsBindingInfo && oButtonsBindingInfo.binding) {
				// look up index in bound context
				var sTextBindingPath = oButtonsBindingInfo.template.getBindingPath("text");
				return oButtonsBindingInfo.binding.getContexts(oButtonsBindingInfo.startIndex, oButtonsBindingInfo.length).findIndex(function (
					oButtonContext) {
					return oButtonContext.getProperty(sTextBindingPath) === sTextValue;
				});
			} else {
				// look up index in static items
				return oRadioButtonGroup.getButtons().findIndex(function (oButton) {
					return oButton.getText() === sTextValue;
				});
			}
		},
		_onRadioButtonGroupSelect: function (oEvent) {
			
			var index = oEvent.getParameters().selectedIndex;
			var oList = this.byId("sap_Responsive_Page_0-content-sap_m_ObjectList-1551080890299");
			var oBinding = oList.getBinding("items");
			
			var aFilter = [];
			
			
			switch(index){
				case 0:
					aFilter.push(new Filter("InEx",FilterOperator.Contains, "Intern"));
					oBinding.filter(aFilter);
					break;
				case 1:
					aFilter.push(new Filter("InEx",FilterOperator.Contains, "Extern"));
					oBinding.filter(aFilter);
					break;
				case 2:
					aFilter.push(new Filter("InEx",FilterOperator.Contains, "Intern/Extern"));
					oBinding.filter(aFilter);
					break;
				case 3:
					oBinding.filter(aFilter);
					break;
			}
			
		},
		_onObjectListItemPress: function () {

			var sDialogName = "QualiDialog";
			this.mDialogs = this.mDialogs || {};
			var oDialog = this.mDialogs[sDialogName];

			if (!oDialog) {
				oDialog = new QualiDialog(this.getView());
				this.mDialogs[sDialogName] = oDialog;

				// For navigation.
				oDialog.setRouter(this.oRouter);
			}
			oDialog.open();

		},
		_onSearchFieldLiveChange: function (oEvent) {
			var sControlId = "sap_Responsive_Page_0-content-sap_m_ObjectList-1551080890299";
			var oControl = this.getView().byId(sControlId);

			// Get the search query, regardless of the triggered event ('query' for the search event, 'newValue' for the liveChange one, 'value' for the liveChange of SelectDialogs).
			var sQuery = oEvent.getParameter("query") || oEvent.getParameter("newValue") || oEvent.getParameter("value");
			var sSourceId = oEvent.getSource().getId();
			
			

			return new Promise(function (fnResolve) {
				
		
				var aFinalFilters = [];

				var aFilters = [];
				// 1) Search filters (with OR)
				if (sQuery && sQuery.length > 0) {

					aFilters.push(new sap.ui.model.Filter("ID", sap.ui.model.FilterOperator.Contains, sQuery));

					var iQuery = parseFloat(sQuery);
					if (!isNaN(iQuery)) {
						aFilters.push(new sap.ui.model.Filter("Haltbarkeit", sap.ui.model.FilterOperator.EQ, sQuery));
						
					}

					aFilters.push(new sap.ui.model.Filter("InEx", sap.ui.model.FilterOperator.Contains, sQuery));

				}
				
		
				var aFinalFilters = aFilters.length > 0 ? [new sap.ui.model.Filter(aFilters, false)] : [];
				var oBindingOptions = this.updateBindingOptions(sControlId, {
					filters: aFinalFilters
				}, sSourceId);
				var oBindingInfo = oControl.getBindingInfo("items");
				if (oBindingInfo) {
					oControl.bindAggregation("items", {
						model: oBindingInfo.model,
						path: oBindingInfo.path,
						parameters: oBindingInfo.parameters,
						template: oBindingInfo.template,
						templateShareable: true,
						sorter: oBindingOptions.sorters,
						filters: oBindingOptions.filters
					});
				}
			}.bind(this)).catch(function (err) {
				if (err !== undefined) {
					MessageBox.error(err.message);
				}
			});
		},
		updateBindingOptions: function (sCollectionId, oBindingData, sSourceId) {
			this.mBindingOptions = this.mBindingOptions || {};
			this.mBindingOptions[sCollectionId] = this.mBindingOptions[sCollectionId] || {};

			var aSorters = this.mBindingOptions[sCollectionId].sorters;
			var aGroupby = this.mBindingOptions[sCollectionId].groupby;

			// If there is no oBindingData parameter, we just need the processed filters and sorters from this function
			if (oBindingData) {
				if (oBindingData.sorters) {
					aSorters = oBindingData.sorters;
				}
				if (oBindingData.groupby || oBindingData.groupby === null) {
					aGroupby = oBindingData.groupby;
				}
				// 1) Update the filters map for the given collection and source
				this.mBindingOptions[sCollectionId].sorters = aSorters;
				this.mBindingOptions[sCollectionId].groupby = aGroupby;
				this.mBindingOptions[sCollectionId].filters = this.mBindingOptions[sCollectionId].filters || {};
				this.mBindingOptions[sCollectionId].filters[sSourceId] = oBindingData.filters || [];
			}

			// 2) Reapply all the filters and sorters
			var aFilters = [];
			for (var key in this.mBindingOptions[sCollectionId].filters) {
				aFilters = aFilters.concat(this.mBindingOptions[sCollectionId].filters[key]);
			}

			// Add the groupby first in the sorters array
			if (aGroupby) {
				aSorters = aSorters ? aGroupby.concat(aSorters) : aGroupby;
			}

			var aFinalFilters = aFilters.length > 0 ? [new sap.ui.model.Filter(aFilters, true)] : undefined;
			return {
				filters: aFinalFilters,
				sorters: aSorters
			};

		},
		createFiltersAndSorters: function () {
			this.mBindingOptions = {};
			var oBindingData, aPropertyFilters;
			oBindingData = {};
			oBindingData.sorters = [];

			oBindingData.sorters.push(new sap.ui.model.Sorter("ID", false, false));
			oBindingData.groupby = [new sap.ui.model.Sorter("InEx", false, true)];

			this.updateBindingOptions("sap_Responsive_Page_0-content-sap_m_ObjectList-1551080890299", oBindingData);

		},
		applyFiltersAndSorters: function (sControlId, sAggregationName, chartBindingInfo) {
			if (chartBindingInfo) {
				var oBindingInfo = chartBindingInfo;
			} else {
				var oBindingInfo = this.getView().byId(sControlId).getBindingInfo(sAggregationName);
			}
			var oBindingOptions = this.updateBindingOptions(sControlId);
			this.getView().byId(sControlId).bindAggregation(sAggregationName, {
				model: oBindingInfo.model,
				path: oBindingInfo.path,
				parameters: oBindingInfo.parameters,
				template: oBindingInfo.template,
				templateShareable: true,
				sorter: oBindingOptions.sorters,
				filters: oBindingOptions.filters
			});

		},
		onInit: function () {
			this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
			this.oRouter.getTarget("QualifikationHinzufugen").attachDisplay(jQuery.proxy(this.handleRouteMatched, this));
			var oView = this.getView();
			oView.addEventDelegate({
				onBeforeShow: function () {
					if (sap.ui.Device.system.phone) {
						var oPage = oView.getContent()[0];
						if (oPage.getShowNavButton && !oPage.getShowNavButton()) {
							oPage.setShowNavButton(true);
							oPage.attachNavButtonPress(function () {
								this.oRouter.navTo("MitarbeiterDetail", {}, true);
							}.bind(this));
						}
					}
				}.bind(this)
			});

			this.oModel = this.getOwnerComponent().getModel();

			this.mAggregationBindingOptions = {};
			this.createFiltersAndSorters();

			this.applyFiltersAndSorters("sap_Responsive_Page_0-content-sap_m_ObjectList-1551080890299", "items");

		},
		onExit: function () {

			// to destroy templates for bound aggregations when templateShareable is true on exit to prevent duplicateId issue
			var aControls = [{
				"controlId": "sap_Responsive_Page_0-content-sap_m_ObjectList-1551080890299",
				"groups": ["items"]
			}];
			for (var i = 0; i < aControls.length; i++) {
				var oControl = this.getView().byId(aControls[i].controlId);
				if (oControl) {
					for (var j = 0; j < aControls[i].groups.length; j++) {
						var sAggregationName = aControls[i].groups[j];
						var oBindingInfo = oControl.getBindingInfo(sAggregationName);
						if (oBindingInfo) {
							var oTemplate = oBindingInfo.template;
							oTemplate.destroy();
						}
					}
				}
			}

		}
	});
}, /* bExport= */ true);