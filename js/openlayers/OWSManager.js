/* 
 * Based in OWSManager by Lorenzo Becchi (ominiverdi.org):
 *
 * Copyright (c) 2006-2007 MetaCarta, Inc., published under the BSD license.
 * See http://svn.openlayers.org/trunk/openlayers/release-license.txt 
 * for the full text of the license.
 *
 */

/*
 * Modified by jmostazo (CoNWeT, UPM)
 */

OpenLayers.Control.OWSManager = OpenLayers.Class.create();
OpenLayers.Control.OWSManager.prototype = OpenLayers.Class.inherit(OpenLayers.Control, {

    initialize: function (mapManager, initialServers) {
        OpenLayers.Control.prototype.initialize.apply(this);

        this.TAB_LAYERS  = 0;
        this.TAB_SERVERS = 1;

        this.tabsElements = [];
        this.initialServers = initialServers;

        this.wmsManager = new conwet.map.WmsManager();
        this.mapManager = mapManager;
        this.gadget = this.mapManager.getGadget();
        this.selectedLayersManager = null;
    },

    setMap: function (map) {
        OpenLayers.Control.prototype.setMap.apply(this, arguments);

        var toolBar = new OpenLayers.Control.WMSToolbar(this.wmsManager, this.mapManager);
        // Add controls
        this.map.addControl(toolBar);
        toolBar.activateControl(toolBar.PAN_CONTROL);
    },

    draw: function () {
        OpenLayers.Control.prototype.draw.apply(this);

        conwet.ui.UIUtils.ignoreEvents(this.div, ["click", "dblclick", "mouseover", "mouseout"]);
        Event.observe(this.div, "mouseup", function (e) {
            if (this.mouseDown) {
                this.mouseDown = false;
                e.stop();
            }
        }.bind(this));
        Event.observe(this.div, "mousedown", function (e) {
            this.mouseDown = true;
            e.stop();
        }.bind(this));

        this.configButton = conwet.ui.UIUtils.createButton({
            "classNames": ["config_button"],
            "title"     : _("Config layers"),
            "onClick"   : function(e) {
                this.showControls(false);
            }.bind(this)
        });
        this.map.viewPortDiv.appendChild(this.configButton);

        // Header
        var controlHeader = document.createElement("div");
        $(controlHeader).addClassName("tab_header");
        this.div.appendChild(controlHeader);

        var minimizeButton = conwet.ui.UIUtils.createButton({
            "classNames": ["minimize"],
            "title"     : _("Minimize"),
            "onClick"   : function (e) {
                this.showControls(true);
            }.bind(this)
        });
        controlHeader.appendChild(minimizeButton);

        // Layers tab

        var layersButton = conwet.ui.UIUtils.createButton({
            "classNames": ["tab"],
            "value"     : _("Layers"),
            "onClick"   : function(e) {
                this.showTab(this.TAB_LAYERS);
            }.bind(this)
        });
        controlHeader.appendChild(layersButton);

        var layersContainer = document.createElement("div");
        $(layersContainer).addClassName("tab_container");
        $(layersContainer).addClassName("tab_layers");
        this.div.appendChild(layersContainer);

        this.tabsElements.push({"button": layersButton, "container": layersContainer});

        // Servers tab

        var serversButton = conwet.ui.UIUtils.createButton({
            "classNames": ["tab"],
            "value"     : _("WMS Servers"),
            "onClick"   : function(e) {
                this.showTab(this.TAB_SERVERS);
            }.bind(this)
        });
        controlHeader.appendChild(serversButton);

        var serversContainer = document.createElement("div");
        $(serversContainer).addClassName("tab_container");
        $(serversContainer).addClassName("tab_servers");
        this.div.appendChild(serversContainer);

        this.tabsElements.push({"button": serversButton, "container": serversContainer});

        this.serverSelect = new StyledElements.StyledSelect();
        this.serverSelect.addEventListener('change', this._sendGetCapabilities.bind(this));
        this.serverSelect.insertInto(serversContainer);
        this.serverSelect.addEntries([[_('Select a server'), '']]);

        for (var i = 0; i < this.initialServers.length; i++) {
            this.serverSelect.addEntries([[this.initialServers[i][0], this.initialServers[i][1]]]);
        }

        this.serverForm = document.createElement("div");
        serversContainer.appendChild(this.serverForm);

        // Selected layers
        this.selectedLayersManager = new conwet.map.SelectedLayersManager(this.map, this.wmsManager, this.mapManager, layersContainer);
        this.selectedLayersManager.addLayer(new OpenLayers.Layer.OSM( "Simple OSM Map"), "EPSG:900913", true, true);

        //TODO si no hay nada configurado
        this.showTab(this.TAB_SERVERS);
        this.showControls(false);

        return this.div;
    },

    showControls: function (minimize) {
        if (minimize) {
            this.div.removeClassName("show");
        }
        else {
            this.div.addClassName("show");
        }
    },

    showTab: function (tab) {
        for (var i=0; i<this.tabsElements.length; i++) {
            this.tabsElements[i].button.removeClassName('active');
            this.tabsElements[i].container.removeClassName('active');
        }

        this.tabsElements[tab].button.addClassName('active');
        this.tabsElements[tab].container.addClassName('active');
    },

    addWmsService: function(name, url) {
        this.serverSelect.addOption(name, url, {"removable": true});
        this.gadget.showMessage(_("Nuevo servidor añadido."));
    },

    _sendGetCapabilities: function (select) {
        var baseURL = select.getValue();

        if (this.serverForm) {
            this.serverForm.innerHTML = "";
        }

        if (baseURL.length == 0) {
            return;
        }

        if (baseURL.indexOf('?') == -1) {
            baseURL = baseURL + '?';
        } else {
            if (baseURL.charAt(baseURL.length - 1) == '&') baseURL = baseURL.slice(0, -1);
        }

        this.gadget.showMessage(_("Solicitando datos al servidor."), true);
        baseURL += "&service=WMS&version=1.1.1&request=GetCapabilities";

        //TODO Gif chulo para esperar
        MashupPlatform.http.makeRequest(baseURL, {
            onSuccess: function(response) {
                this.gadget.hideMessage();
                this._parseGetCapabilities(baseURL, response);
            }.bind(this),
            onFailure: function(){
                this.gadget.showError(_("El servidor no responde."));
            }.bind(this)
        });
    },

    _parseGetCapabilities: function (baseURL, ajaxResponse) {
        var xml;
        if (!("responseXML" in ajaxResponse)) {
            var text = ajaxResponse.responseText;
            text = text.replace(/<!--.*?-->/g, '');                         // Helped with ESA server
            text = text.replace(/\[.<!.*?>.\]/g, '');                       // Helped with ESA server
            text = text.replace(/<GetTileService>.*?GetTileService>/g, ''); // Skip NASA DTD error

            xml = EzWebExt.XML.parseFromString(text, 'application/xml', true);

            if (xml == null || typeof xml!='object')
                return this.gadget.showError('Incorrect content: check your WMS url');

            if (xml.childNodes.length == 0) {
                try {
                    if (OpenLayers.Ajax.getParseErrorText(xml) != OpenLayers.Ajax.PARSED_OK) {
                        var error = OpenLayers.Ajax.getParseErrorText(xml);
                        return this.gadget.showError("Error Parsing GetCapabilties:" + error);
                    }
                } catch (e) {
                    return this.gadget.showError(e.description);
                }
            }
        } else {
            xml = ajaxResponse.responseXML;
        }

        this.wmsManager.addService(baseURL, new conwet.map.WmsService(xml));
        this._drawServersForm(baseURL);

        /*
        //Check GetMap Formats
        var GetMap = xml.getElementsByTagName('GetMap');
        if (GetMap.length) {
            var aFormats = GetMap[0].getElementsByTagName('Format');
            var oFormats = [];
            for (var i=0; i<aFormats.length; i++) {
                if (aFormats[i])
                    var format = OpenLayers.Ajax.getText(aFormats[i]);
                if (format == 'image/png' || format == 'image/jpeg' || format == 'image/gif')
                    oFormats.push(format);
            }
            this.aImageFormats = oFormats;
        }

        //Check resolutionsValue for TileCache
        var resolutions = xml.getElementsByTagName('Resolutions');
        if (resolutions.length) {
            var resolutionsS = OpenLayers.Ajax.getText(resolutions[0]);
            if (resolutionsS.length) {
                var aResolutions = resolutionsS.split(' ');
                this.resolutionsValue = aResolutions;
            }
        }

        //Print Layer List
        var aLayer = xml.getElementsByTagName('Layer');
        if (aLayer.length > 0) {
            this.drawLayersForm(xml);
        }*/
    },

    _drawServersForm: function (baseURL) {
        var service = this.wmsManager.getService(baseURL);

        // Info div
        var infoDiv = document.createElement("div");
        $(infoDiv).addClassName("layer_info");

        // Projection select
        var projectionSelect = new StyledElements.StyledSelect();
        projectionSelect.addClassName("no_display");

        // Image type select
        var imageFormatSelect = new StyledElements.StyledSelect();

        // Layer select
        var layerSelect = new StyledElements.StyledSelect({idFun: function (layer) { return layer.getName(); }});
        layerSelect.addEventListener('change', function (select) {
            var layer = select.getValue();
            var layerInfo = service.getLayer(layer.getName());
            infoDiv.innerHTML = "";

            var table = document.createElement("table");
            table.cellSpacing = 0;
            table.appendChild(this._createTableRow(_("Service"), document.createTextNode(service.getTitle())));
            table.appendChild(this._createTableRow(_("Title"), document.createTextNode(layerInfo.getTitle())));
            table.appendChild(this._createTableRow(_("Queryable"), document.createTextNode((layerInfo.isQueryable())? _("Yes"): _("No"))));
            table.appendChild(this._createTableRow(_("Name"), document.createTextNode(layerInfo.getName())));

            if (layerInfo.getAbstract()) {
                table.appendChild(this._createTableRow(_("Abstract"), document.createTextNode(layerInfo.getAbstract())));
            }

            if (layerInfo.getLegendUrl()) {
                var img = document.createElement("img");
                img.src = layerInfo.getLegendUrl();
                table.appendChild(this._createTableRow(_("Legend"), img));
            }

            $(table.lastChild).addClassName("last");
            infoDiv.appendChild(table);

            projectionSelect.clear();
            imageFormatSelect.clear();
            this._addProjections(projectionSelect, layerSelect.getValue().getProjections());
            this._addFormats(imageFormatSelect, layer.getFormats());
        }.bind(this));

        var layers = service.getLayers();
        for (var i=0; i<layers.length; i++) {
            var layer = layers[i];
            layerSelect.addEntries([[layer.getTitle()  + ((layer.isQueryable())? _(' (q)'): ''), layer]]);
        }

        // Add porjections
        this._addProjections(projectionSelect, layerSelect.getValue().getProjections());

        // Add formats
        this._addFormats(imageFormatSelect, layerSelect.getValue().getFormats());

        // Base layer checkbox
        var baseLayerButton = document.createElement('input');
        baseLayerButton.type = 'checkbox';
        baseLayerButton.value = 'overlay';
        baseLayerButton.checked = false;
        baseLayerButton.observe("mousedown", function(e) {
            baseLayerButton.checked = !baseLayerButton.checked;
            if (baseLayerButton.checked) {
                projectionSelect.removeClassName("no_display");
            }
            else {
                projectionSelect.addClassName("no_display");
            }
        }.bind(this));

        var baseLayerLabel = document.createElement('span');
        baseLayerLabel.appendChild(document.createTextNode(_('Is base layer')));

        // Add button
        var addButton = document.createElement('button');
        $(addButton).observe("mousedown", function() {
            this._addWMSLayer(
                this.serverSelect.getValue(),
                layerSelect.getValue(),
                projectionSelect.getValue(),
                imageFormatSelect.getValue(),
                baseLayerButton.checked
            );
        }.bind(this));
        addButton.appendChild(document.createTextNode(_('Add layer')));

        // Create UI
        layerSelect.insertInto(this.serverForm);
        projectionSelect.insertInto(this.serverForm);
        imageFormatSelect.insertInto(this.serverForm);
        this.serverForm.appendChild(baseLayerButton);
        this.serverForm.appendChild(baseLayerLabel);
        this.serverForm.appendChild(addButton);
        this.serverForm.appendChild(infoDiv);
    },

    _addProjections: function(select, projections) {
        select.clear();
        for (var i=0; i<projections.length; i++) {
            //if (projections[i] in Proj4js.defs) {
                select.addEntries([[projections[i], projections[i]]]);
            //}
        }
    },

    _addFormats: function(select, formats) {
        select.clear();
        for (var i=0; i<formats.length; i++) {
            select.addEntries([[formats[i], formats[i]]]);
        }
    },

    _addJSONLayer: function(json) {
        var layer = new OpenLayers.Layer.Vector();
        layer.addFeatures((new OpenLayers.Format.GeoJSON()).read(json));
        this.map.addLayer(layer);
    },

    _addWMSLayer: function(url, layer, projection, imageType, isBaseLayer) {
        if (url.indexOf('?') == -1) {
            url = url + '?';
        } else {
            if (url.charAt(url.length - 1) == '&')
                url = url.slice(0, -1);
        }

        //check for base layer
        var layers = this.map.layers;
        var hasBaseLayer = false;
        for (var i = 0; i < layers.length; i++) {
            if (layers[i].isBaseLayer) {
                hasBaseLayer = true;
            }
        }

        // TODO Revisar
        if (this.resolutionsValue) {
            var aResolutions = this.resolutionsValue;
            var minRes = aResolutions[aResolutions.length - 1];
            var options = {
                resolutions: aResolutions,
                maxresolution: aResolutions[0],
                minResolution: minRes
            };
            this.map.setOptions(options);
        }

        //SRS - OL default srs is EPSG:4326 
        /*var options = {srs: 'EPSG:4326'};
        this.OWSManager.map.setOptions(options) ;
        */

        if ((!isBaseLayer) && (imageType == 'image/jpeg'))
            return this.gadget.showError('you cannot select JPEG format for overlays, please choose another format');

        this.showTab(this.TAB_LAYERS);

        this.selectedLayersManager.addLayer(new OpenLayers.Layer.WMS(layer.getName(), url, {
            "layers": layer.getName(),
            "format": imageType,
            "TRANSPARENT": ("" + !isBaseLayer).toUpperCase(),
            "EXCEPTIONS": 'application/vnd.ogc.se_inimage'
        }), projection, isBaseLayer);
    },

    /*addMarkerLayer: function(layer) {
        this.selectedLayersManager.addLayer(layer, false);
    },*/

    _createTableRow: function(title, value) {
        var tr = document.createElement("tr");
        var th = document.createElement("th");
        th.appendChild(document.createTextNode(title));
        tr.appendChild(th);
        var td = document.createElement("td");
        td.appendChild(value);
        tr.appendChild(td);
        return tr;
    },

    /** @final @type String */
    CLASS_NAME: "OpenLayers.Control.OWSManager"
});

/** Sarissa derived getParseErrorText
 */
OpenLayers.Ajax.PARSED_OK = "Document contains no parsing errors";
OpenLayers.Ajax.PARSED_EMPTY = "Document is empty";
OpenLayers.Ajax.PARSED_UNKNOWN_ERROR = "Not well-formed or other error";

OpenLayers.Ajax.getParseErrorText = function (oDoc) {
    //this is only the IE version from Sarissa
    var parseErrorText = OpenLayers.Ajax.PARSED_OK;
    if (oDoc && oDoc.parseError && oDoc.parseError.errorCode && oDoc.parseError.errorCode != 0) {
        parseErrorText = "XML Parsing Error: " + oDoc.parseError.reason + "\nLocation: " + oDoc.parseError.url + "\nLine Number " + oDoc.parseError.line + ", Column " + oDoc.parseError.linepos + ":\n" + oDoc.parseError.srcText + "\n";
        for (var i = 0; i < oDoc.parseError.linepos; i++) {
            parseErrorText += "-";
        };
        parseErrorText += "^\n";
    } else if (oDoc.documentElement == null) {
        parseErrorText = OpenLayers.Ajax.PARSED_EMPTY;
    };
    return parseErrorText;
};

/*OpenLayers.Ajax.escape = function (sXml) {
    return sXml.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
};

OpenLayers.Ajax.unescape = function (sXml) {
    return sXml.replace(/&apos;/g, "'").replace(/&quot;/g, "\"").replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&amp;/g, "&");
};


if (!window.Node || !Node.ELEMENT_NODE) {
    Node = {
        ELEMENT_NODE: 1,
        ATTRIBUTE_NODE: 2,
        TEXT_NODE: 3,
        CDATA_SECTION_NODE: 4,
        ENTITY_REFERENCE_NODE: 5,
        ENTITY_NODE: 6,
        PROCESSING_INSTRUCTION_NODE: 7,
        COMMENT_NODE: 8,
        DOCUMENT_NODE: 9,
        DOCUMENT_TYPE_NODE: 10,
        DOCUMENT_FRAGMENT_NODE: 11,
        NOTATION_NODE: 12
    };
};*/
