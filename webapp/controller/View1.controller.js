sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "sap/ui/model/type/String",
    "sap/m/Token",
    "sap/ui/table/Column"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, UIComponent, JSONModel, ODataModel, Filter, FilterOperator, MessageBox, Fragment, TypeString, Token, UIColumn) {
        "use strict";

        return Controller.extend("zproductionstopage.controller.View1", {
            onInit: function () {
                this.getView().setModel(new sap.ui.model.json.JSONModel(), "oFirstTableDataModel");
                this.getView().getModel("oFirstTableDataModel").setProperty("/aFirstTableData", []);

                this.getView().setModel(new sap.ui.model.json.JSONModel(), "oBatchData2")
                this.getView().getModel("oBatchData2").setProperty("/aData2", [])
                var oModel = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZPM_PROD_STOPAGE_BINDING");
                oModel.read("/ReasonCode", {
                    urlParameters: { "$top": "5000000" },
                    success: function (oresponse) {
                        this.getView().getModel("oBatchData2").setProperty("/aData2", oresponse.results)
                    }.bind(this)
                })
            },
            addrow: function () {

                var TableModel = this.getView().getModel("oFirstTableDataModel");
                var aTableArr = TableModel.getProperty("/aFirstTableData")
                var aTablearr = [];
                    var obj = {
                        postingDate: "",
                        machine: "",
                        shifta:"",
                        shiftb:"",
                        targetproduction:"",
                        stpagetime: "",
                        deaprtment: "",
                        Stopagehour:"",
                        Stopagepercentage:"",
                        reason:"",
                        reasoncode:"",
                    }
            
                    aTableArr.push(obj);
                    TableModel.setProperty("/aFirstTableData", aTableArr)
              },
            savedata:function(){
                var table1 = this.getView().getModel("oFirstTableDataModel").getProperty("/aFirstTableData");
                if(table1.length === 0){
                    MessageBox.error("Please Add Line and Then Save Data" , {
                        title: "Warning",
                        icon: MessageBox.Icon.ERROR
                    });
                }
                else{
                    for(var i=0;i<table1.length;i++){
                        var k = i + 1;
                        if(table1[i].reason === "" || table1[i].reasoncode === "" || table1[i].Stopagepercentage === "" || table1[i].Stopagehour === "" ||
                        table1[i].deaprtment === "" ||table1[i].stpagetime === "" ||table1[i].targetproduction === "" ||table1[i].shiftb === "" ||table1[i].shifta === "" ||
                        table1[i].machine === "" ||table1[i].postingDate === "") 
                        {
                                MessageBox.error("Please Fill All Data in line No:-"+ (i+1) , {
                                    title: "Warning",
                                    icon: MessageBox.Icon.ERROR
                                });
                                break;
                           }
                           else if(k===table1.length){
                                 this.savedata1();
                           }
                    }
                }
                
              },
             savedata1: function () {
                var oBusyDialog = new sap.m.BusyDialog({
                    text: "Please wait"
                });
                oBusyDialog.open();
                var oModel = this.getView().getModel();
                var Plant = this.getView().byId("idplant").getValue();
                var depatment = this.getView().byId("iddepatment").getValue();
                if(Plant ===""){
                    oBusyDialog.close();
                    MessageBox.error("Please Select Plant", {
                        title: "Warning",
                        icon: MessageBox.Icon.ERROR
                    });
                }
                else if (depatment === ""){
                    oBusyDialog.close();
                    MessageBox.error("Please Select Department ", {
                        title: "Warning",
                        icon: MessageBox.Icon.ERROR
                    });
                }
                else{
                    var table1 = this.getView().getModel("oFirstTableDataModel").getProperty("/aFirstTableData");
                    this.getOwnerComponent().setModel(new sap.ui.model.json.JSONModel(), "oTableDataModel1");
                    this.getOwnerComponent().getModel("oTableDataModel1").setProperty("/aTableData1", []);
                    var TableModel1 = this.getOwnerComponent().getModel("oTableDataModel1");
    
                    var aTablearr1 = [];
                    table1.map(function (data1) {
                        var date = data1.postingDate
                        var oDate = new Date(date);
                        var oDate1 = new Date(oDate.getTime() - oDate.getTimezoneOffset() * 60000);
                        var oDate2 = oDate1.toISOString().slice(0, 16);
                        var items1 = {
                            Machinenumber: data1.machine,
                            Plant: Plant,
                            Stopagetime: data1.stpagetime,
                            Postindate: oDate2,
                            Department: data1.deaprtment,
                            Departmentheader: depatment,
                            Reason: data1.reason,
                            Reasoncode:data1.reasoncode,
                            Shifta:parseFloat(data1.shifta).toFixed(2),
                            Shiftb: parseFloat(data1.shiftb).toFixed(2),
                            Stopagehour:parseFloat(data1.Stopagehour).toFixed(2),
                            Stopagepercent: parseFloat(data1.Stopagepercentage).toFixed(2),
                            Tagetproduction: parseFloat(data1.targetproduction).toFixed(2),
                        }
                        aTablearr1.push(items1);
                        oModel.create("/ZPM_PRODTN_STOPAGE", items1, {
                            success: function (oresponse) {
                                oBusyDialog.close();
                                MessageBox.success( "Data Saved ", {
                                    title: "Succesfully",
                                    icon: MessageBox.Icon.success,
                                    onClose: function (oAction) {
                                        if (oAction === MessageBox.Action.OK) {
                                            window.location.reload();
                                        }
                                    }
                                });
                            },
                            error: function (ores) {
                                oBusyDialog.close();
                              MessageBox.error(ores + " Data Not saved",{
                                title: "Data Not Saved",
                                icon: MessageBox.Icon.error,
    
                              }
                              );
                            }
                          })
                    })
                   
                }
                 
             },
             ontime:function(oEvent){
                var stopagemin = oEvent.mParameters.value;
                
                var hours  = Number(stopagemin) /60;
                var percentage = (Number(stopagemin) / 1440) *100;
                percentage = parseFloat(percentage).toFixed(3)
                hours = parseFloat(hours).toFixed(3)
                oEvent.getSource().getBindingContext("oFirstTableDataModel").getObject().Stopagehour = hours
                oEvent.getSource().getBindingContext("oFirstTableDataModel").getObject().Stopagepercentage = percentage
             },
             onValueHelpRequest: function (oEvent) {
                var depatment = this.getView().byId("iddepatment").getValue();
                var oView = this.getView();
                this.oSource = oEvent.getSource();
                this.sPath = oEvent.getSource().getBindingContext('oFirstTableDataModel').getPath();
                this.sPath1 = oEvent.getSource().getBindingContext('oFirstTableDataModel').getObject().reasoncode;
                this.sPath2 = oEvent.getSource().getBindingContext('oFirstTableDataModel').getObject().reason;

                var sKey = this.oSource.getCustomData()[0].getKey();
                if (!this._pValueHelpDialog) {
                    this._pValueHelpDialog = Fragment.load({
                        id: oView.getId(),
                        name: "zproductionstopage.fragments.VendorValueHelp",
                        controller: this
                    }).then(function (oValueHelpDialog) {
                        oView.addDependent(oValueHelpDialog);
                        return oValueHelpDialog;
                    });
                }
                this._pValueHelpDialog.then(function (oValueHelpDialog) {
                    // this._configValueHelpDialog(this.oSource);
                    var aNewArr = [];
                    var sInput = this.sPath1
                        var oModel = this.getView().getModel('oBatchData2').getProperty("/aData2");
                        oModel.map(function (items) {
                             if(depatment === items.Department){
                                aNewArr.push(items)
                             }
                               
                        })
                    this.getView().setModel(new sap.ui.model.json.JSONModel(), "BatchData")
                    this.getView().getModel("BatchData").setProperty("/aData", aNewArr)
                    if (sKey === 'VC') {
                        var oTemplate = new sap.m.StandardListItem({
                            title: "{BatchData>Description}",
                            description: "{BatchData>Code}",
                            info:"{BatchData>Department}",
                            type: "Active"
                        });
                        oValueHelpDialog.bindAggregation("items", {
                            path: 'BatchData>/aData',
                            template: oTemplate
                        });
                        oValueHelpDialog.setTitle("Select Reason Code");
                    }

                    oValueHelpDialog.open();
                }.bind(this));
            },
            _configValueHelpDialog: function (oSource) {
                var sInputValue = oSource.getBindingContext("oFirstTableDataModel").getObject().reasoncode,
                    oModel = this.getView().getModel('oBatchData1'),
                    sKey = oSource.getCustomData()[0].getKey();
                var aNewArr = []
                if (sKey === 'VC') {
                    var aData = oModel.getProperty("/aData1");
                    aData.map(function (items) {    
                            aNewArr.push(items)
                    })
                    aData.forEach(function (aNewArr) {
                        aNewArr.selected = (aNewArr.Code === sInputValue);
                    });
                    oModel.setProperty("/aData1", aData);
                }
            },
            onValueHelpDialogClose: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("selectedItem");
                var sPath = oEvent.getParameter("selectedContexts")[0].getPath();
                var oObject = oEvent.getParameter("selectedContexts")[0].getObject();
                // this.oSource = this.byId("productInput");
                if (!oSelectedItem) {
                    this.oSource.resetProperty("value");
                    return;
                }
                if (sPath.search('/aData1') != -1) {
                    // this.getView().getModel('oFirstTableDataModel').getProperty(this.sPath).selvedge = oObject.Selvedge;
                    this.getView().getModel('oFirstTableDataModel').getProperty(this.sPath).reason = oObject.Description;
                    this.getView().getModel('oFirstTableDataModel').setProperty(this.sPath, this.getView().getModel('oFirstTableDataModel').getProperty(this.sPath));
                }
                else{
                    this.getView().getModel('oFirstTableDataModel').getProperty(this.sPath).reason = oObject.Description;
                    this.getView().getModel('oFirstTableDataModel').setProperty(this.sPath, this.getView().getModel('oFirstTableDataModel').getProperty(this.sPath));
                }
                this.oSource.setValue(oSelectedItem.getDescription());
            },
            onSearch: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                    var oFilter = new Filter([
                        new Filter("Code", FilterOperator.Contains, sValue),
                        new Filter("Description", FilterOperator.Contains, sValue)
                    ])  
                var oBinding = oEvent.getParameter("itemsBinding");
                oBinding.filter([oFilter]);
            },
            handleDelete: function (oEvent) {
                var oTable = oEvent.getSource().getParent().getParent();
                var aSelectedIndex = oTable.getSelectedIndices();
                var aTableArr = this.getView().getModel("oFirstTableDataModel").getProperty("/aFirstTableData")
                var aNewArr = []
                for (var i = 0; i < aTableArr.length; i++) {
                    var ind = aSelectedIndex.indexOf(i)
                    if(ind == -1){
                        aNewArr.push(aTableArr[i])
                    }
                }
                this.getView().getModel("oFirstTableDataModel").setProperty("/aFirstTableData", aNewArr);




            },
        });
    });
