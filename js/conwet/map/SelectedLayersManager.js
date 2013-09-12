/*
 *     Copyright (c) 2013 CoNWeT Lab., Universidad Politécnica de Madrid
 *
 *     This file is part of the GeoWidgets Project,
 *
 *     http://conwet.fi.upm.es/geowidgets
 *
 *     Licensed under the GNU General Public License, Version 3.0 (the 
 *     "License"); you may not use this file except in compliance with the 
 *     License.
 *
 *     Unless required by applicable law or agreed to in writing, software
 *     under the License is distributed in the hope that it will be useful, 
 *     but on an "AS IS" BASIS, WITHOUT ANY WARRANTY OR CONDITION,
 *     either express or implied; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
 *  
 *     See the GNU General Public License for specific language governing
 *     permissions and limitations under the License.
 *
 *     <http://www.gnu.org/licenses/gpl.txt>.
 *
 */

use("conwet.map");

conwet.map.SelectedLayersManager = Class.create({

    initialize: function(map, wmsManager, mapManager, parentElement) {
        this.map = map;
        this.parentElement = parentElement;
        this.wmsManager = wmsManager;
        this.mapManager = mapManager;
        this.gadget = this.mapManager.getGadget();

        this.MAX_OPACITY = 1.0;
        this.MIN_OPACITY = 0.1;

        this.baseLayers = [];
        this.overlays   = [];

        this.baseLayersContainer = null;
        this.overlaysContainer   = null;
        this.detailsContainer    = null;

        this._draw();
    },

    _draw: function() {
        var baseLayersElement = document.createElement("div");
        $(baseLayersElement).addClassName("baselayers");
        this.parentElement.appendChild(baseLayersElement);

        var baseLayersHeader = document.createElement("div");
        $(baseLayersHeader).addClassName("header");
        baseLayersHeader.appendChild(document.createTextNode(_("Base Layers")));
        baseLayersElement.appendChild(baseLayersHeader);

        this.baseLayersContainer = document.createElement("div");
        $(this.baseLayersContainer).addClassName("container");
        baseLayersElement.appendChild(this.baseLayersContainer);

        var overlaysElement = document.createElement("div");
        $(overlaysElement).addClassName("overlays");
        this.parentElement.appendChild(overlaysElement);

        var overlaysHeader = document.createElement("div");
        $(overlaysHeader).addClassName("header");
        overlaysHeader.appendChild(document.createTextNode(_("Overlays")));
        overlaysElement.appendChild(overlaysHeader);

        this.overlaysContainer = document.createElement("div");
        $(this.overlaysContainer).addClassName("container");
        overlaysElement.appendChild(this.overlaysContainer);

        this.detailsContainer = document.createElement("div");
        $(this.detailsContainer).addClassName("details");
        this.parentElement.appendChild(this.detailsContainer);
    },

    addLayer: function(layer, projection, isBaseLayer, init) {
        var layerObj = null;
        var list     = (isBaseLayer)? this.baseLayers: this.overlays;
        var index    = this._getLayerIndex(layer, isBaseLayer);
        var isOsm      = (layer.CLASS_NAME == "OpenLayers.Layer.OSM");

        if (index < 0) {
            var layerInfo = null;
            if (isOsm) {
                layerInfo  = new conwet.map.OsmLayer(layer);
            }
            else {
                var service = this.wmsManager.getService(layer.url);
                layerInfo = service.getLayer(layer.name);
            }

            var layerElement = document.createElement("div");
            $(layerElement).addClassName("layer");
            layerElement.observe("click", function(e) {
                this._selectLayerObj(layerObj, isBaseLayer);
            }.bind(this));
            layerElement.observe("mouseover", function(e) {
                layerElement.addClassName("highlight");
            }.bind(this), false);
            layerElement.observe("mouseout", function(e) {
                layerElement.removeClassName("highlight");
            }.bind(this), false);

            var zoomButton = document.createElement("div");
            $(zoomButton).addClassName('layer_button');
            $(zoomButton).addClassName('zoom');
            zoomButton.observe("click", function (e) {
                this._zoomToExtent(layerObj.layerInfo);
            }.bind(this));
            zoomButton.title = _('Zoom to extent');

            var inputElement = document.createElement("input");
            if (isBaseLayer) {
                inputElement.name = "baseLayer";
                inputElement.type = "radio";
            }
            else {
                inputElement.type = "checkbox";
            }

            layerObj = {
                "layer"       : layer,
                "layerElement": layerElement,
                "inputElement": inputElement,
                "zoomElement" : zoomButton,
                "layerInfo"   : layerInfo,
                "projection"  : projection
            };

            inputElement.observe("mousedown", function(e) {
                if (inputElement.type == "radio") {
                    this._changeBaseLayer(layerObj);
                    this._zoomToExtent(layerObj.layerInfo);
                } else {
                    layerObj.inputElement.checked = !layerObj.inputElement.checked;
                    layerObj.layer.setVisibility(layerObj.inputElement.checked, true);
                }
                e.stop();
            }.bind(this));

            layerElement.appendChild(inputElement);

            var nameElement = document.createElement("span");
            nameElement.appendChild(document.createTextNode(layerInfo.getTitle() + ((layerInfo.isQueryable())? _(" (q)"): "")));
            nameElement.title = layerInfo.getTitle();
            layerElement.appendChild(nameElement);

            if (!isOsm) {
                var dropButton = document.createElement("div");
                $(dropButton).addClassName('layer_button');
                $(dropButton).addClassName('drop');
                dropButton.observe("click", function(e) {
                    this.map.removeLayer(layerObj.layer);
                    this._dropLayerObj(layerObj, isBaseLayer);
                    if (isBaseLayer && (!layerObj.layerElement.hasClassName("deselected_baselayer"))) {
                        this._changeBaseLayer(this.baseLayers[0]);
                        this._zoomToExtent(this.baseLayers[0].layerInfo);
                    }
                }.bind(this));
                dropButton.title = _("Remove layer");
                layerElement.appendChild(dropButton);
            }

            layerElement.appendChild(zoomButton);

            var parentElement = null;
            if (isBaseLayer) {
                parentElement = this.baseLayersContainer;
            }
            else {
                var upButton = document.createElement("div");
                $(upButton).addClassName('layer_button');
                $(upButton).addClassName("up");
                upButton.observe("click", function(e) {
                    var index    = this.map.getLayerIndex(layerObj.layer);
                    var nLayers  = this.map.getNumLayers();
                    var nBases   = this._getNumBaseLayers();
                    var nMarkers = this.mapManager.getNumMarkerLayers();

                    if (index >= (nLayers-nMarkers-1))
                        return;

                    this.map.raiseLayer(layerObj.layer, 1);
                    index = this.map.getLayerIndex(layerObj.layer);

                    var parentElement =layerObj. layerElement.parentNode;
                    var previousElement = parentElement.children[nLayers-nMarkers-1-index];
                    layerObj.layerElement.remove();
                    parentElement.insertBefore(layerObj.layerElement, previousElement);
                    layerObj.layerElement.removeClassName("highlight");
                }.bind(this));
                upButton.title = _("Up");
                layerElement.appendChild(upButton);

                var downButton = document.createElement("div");
                $(downButton).addClassName('layer_button');
                $(downButton).addClassName("down");
                downButton.observe("click", function(e) {
                    var index    = this.map.getLayerIndex(layerObj.layer);
                    var nLayers  = this.map.getNumLayers();
                    var nBases   = this._getNumBaseLayers();
                    var nMarkers = this.mapManager.getNumMarkerLayers();

                    if (index <= nBases)
                        return;

                    this.map.raiseLayer(layerObj.layer, -1);
                    index = this.map.getLayerIndex(layerObj.layer);

                    var parentElement = layerObj.layerElement.parentNode;
                    if (nLayers-nMarkers-index < parentElement.children.length) {
                        var nextElement = parentElement.children[nLayers-nMarkers-index];
                        layerObj.layerElement.remove();
                        parentElement.insertBefore(layerObj.layerElement, nextElement);
                    }
                    else {
                        layerObj.layerElement.remove();
                        parentElement.appendChild(layerObj.layerElement);
                    }

                    layerObj.layerElement.removeClassName("highlight");
                }.bind(this));
                downButton.title = _("Down");
                layerElement.appendChild(downButton);

                parentElement = this.overlaysContainer;
            }

            if (parentElement.firstChild) {
                parentElement.insertBefore(layerElement, parentElement.firstChild);
            }
            else {
                parentElement.appendChild(layerElement);
            }

            if (isBaseLayer) {
                this._changeMapProjection(layerInfo, projection);
            }

            layerObj.projection = this.map.projection;
            this._setExtent(layer, layerInfo, layerObj.projection, isBaseLayer);
            this.map.addLayer(layer);

            if (isBaseLayer) {
                this.map.setLayerIndex(layer, 0);
                this.map.setBaseLayer(layer, true);
                this._selectBaseLayerElement(layerObj.layerElement);
                this._updateOverlaysProjection(layerObj.projection);
                this.map.events.triggerEvent("changebaselayer");
            }
            else {
                this.map.setLayerIndex(layer, this.map.getNumLayers()-this.mapManager.getNumMarkerLayers()-1);
            }

            list.push(layerObj);
            this._disableOverlays();
            layerObj.inputElement.checked = true;
            if (!init)
                this.gadget.showMessage((isBaseLayer)? _("Nueva capa base."): _("Nueva capa."));
        }
        else {
            layerObj = list[index];
            if (!init)
                this.gadget.showMessage(_("La capa ya existe."));
        }

        this._selectLayerObj(layerObj, isBaseLayer);

        // Set Extent
        if (isBaseLayer) {
            // Para evitar fallo con OSM
            setTimeout(function() {this._zoomToExtent(layerObj.layerInfo);}.bind(this), 1000);
        }
    },

    _setExtent: function(layer, layerInfo, projection, isBaseLayer) {
        layer.projection = projection;
        layer.units      = new OpenLayers.Projection(projection).getUnits();
        layer.maxExtent  = layerInfo.getExtent(projection);

        if ((layer.CLASS_NAME == "OpenLayers.Layer.OSM") || (!isBaseLayer && (this.map.baseLayer.CLASS_NAME == "OpenLayers.Layer.OSM"))) {
            layer.maxExtent  = null;
        }
        else {
            layer.maxExtext = layerInfo.getExtent(projection);
        }
        //layer.maxResolution = "auto";
        //layer.minResolution = "auto";
    },

    _changeBaseLayer: function(layerObj) {
        layerObj.inputElement.checked = true;
        this._changeMapProjection(layerObj.layerInfo, layerObj.projection);
        this.map.setBaseLayer(layerObj.layer, true);
        this._selectBaseLayerElement(layerObj.layerElement);
        this._updateOverlaysProjection(this.map.projection);
        this._disableOverlays();
        this.map.events.triggerEvent("changebaselayer");
    },

    _getNumBaseLayers: function() {
        return this.baseLayers.length;
    },

    _getNumOverlays: function() {
        return this.overlays.length;
    },

    _selectBaseLayerElement: function(baselayerElement) {
        for (var i=0; i<this.baseLayers.length; i++) {
            this.baseLayers[i].layerElement.addClassName("deselected_baselayer");
        }

        baselayerElement.removeClassName("deselected_baselayer");
    },

    _updateOverlaysProjection: function(projection) {
        for (var i=0; i<this.overlays.length; i++) {
            var layerObj = this.overlays[i];
            var layer = layerObj.layer;

            if (layerObj.projection != projection) {
                var index = this.map.getLayerIndex(layer);

                var newLayer = new OpenLayers.Layer.WMS(layer.name, layer.url, {
                    "layers": layer.params.LAYERS,
                    "format": layer.params.FORMAT,
                    "TRANSPARENT": "TRUE",
                    "EXCEPTIONS": "application/vnd.ogc.se_inimage"
                });

                layerObj.projection = projection;
                layerObj.layer = newLayer;

                this.map.removeLayer(layer);
                this._setExtent(newLayer, layerObj.layerInfo, layerObj.projection, false);
                this.map.addLayer(newLayer);
                this.map.setLayerIndex(newLayer, index);
            }
        }
    },

    _zoomToExtent: function(layerInfo) {
        this.map.zoomToExtent(layerInfo.getExtent(this.map.projection));
        this.map.zoomIn(); // Para solucionar bug de Openlayers
        this.map.zoomOut();
    },

    _disableOverlays: function(projection) {
        for (var i=0; i<this.overlays.length; i++) {
            var layerObj = this.overlays[i];

            if (this.map.projection in layerObj.layerInfo.layer.bbox) {
                layerObj.layerElement.removeClassName("disabled_layer");
            }
            else {
                layerObj.layerElement.addClassName("disabled_layer");
            }
        }
    },

    _changeMapProjection: function(layerInfo, projection) {
        this.map.projection = projection;
        this.map.units = new OpenLayers.Projection(projection).getUnits();

        var scales = [Proj4js.maxScale[(this.map.units in (Proj4js.maxScale))?this.map.units: "m"]];
        for (var i=0; i<18; i++) {
            scales.push(scales[i]/2);
        }
        this.map.scales = scales;
        //this.maxResolution = "auto";
        //this.minResolution = "auto";

        var transformer = new conwet.map.ProjectionTransformer();
        this.map.maxExtent = layerInfo.getExtent(projection);//transformer.getMaxExtent(projection);
    },

    _selectLayerObj: function(layerObj, isBaseLayer) {
        this._deselectAllLayers();

        layerObj.layerElement.addClassName("selected");
        this._showDetails(layerObj, isBaseLayer);
    },

    _dropLayerObj: function(layerObj, isBaseLayer) {
        var index = this._getLayerIndex(layerObj.layer, isBaseLayer);
        if (index < 0)
            return;

        var list = (isBaseLayer)? this.baseLayers: this.overlays;
        list.splice(index,1);

        if (layerObj.layerElement.hasClassName("selected")) {
            this._clearDetails();
        }

        layerObj.layerElement.remove();
    },

    _deselectAllLayers: function() {
        for (var i=0; i<this.baseLayers.length; i++) {
            this.baseLayers[i].layerElement.removeClassName("selected");
        }

        for (var i=0; i<this.overlays.length; i++) {
            this.overlays[i].layerElement.removeClassName("selected");
        }
    },

    _getLayerIndex: function(layer, isBaseLayer) {
        var list = (isBaseLayer)? this.baseLayers: this.overlays;

        for (var i=0; i<list.length; i++) {
            if ((list[i].layer.name == layer.name) && (list[i].layer.service == layer.service))
                return i;
        }
        return -1;
    },

    _showDetails: function(layerObj, isBaseLayer) {
        this._clearDetails();

        var table = document.createElement("table");
        table.cellSpacing = 0;

        var layerInfo = layerObj.layerInfo;
        var layer = layerObj.layer;

        if (layer.CLASS_NAME != "OpenLayers.Layer.OSM") {
            var service = this.wmsManager.getService(layer.url);
            table.appendChild(this._createTableRow(_("Service"), document.createTextNode(service.getTitle())));
        }

        table.appendChild(this._createTableRow(_("Title"), document.createTextNode(layerInfo.getTitle())));

        if (!isBaseLayer) {
            var upButton = document.createElement("div");
            $(upButton).addClassName("opacity_button");
            $(upButton).addClassName("up");
            upButton.observe("click", function(e) {
                var opacity = (layer.opacity) ? layer.opacity : 1;
                var newOpacity = Math.min(this.MAX_OPACITY, Math.max(this.MIN_OPACITY, (parseFloat(opacity) + 0.1).toFixed(1)));
                layer.setOpacity(newOpacity);
                opSpan.innerHTML = newOpacity;
                e.stop();
            }.bind(this));
            upButton.title = _("Plus");

            var opSpan = document.createElement("span");
            opSpan.innerHTML = (layer.opacity) ? layer.opacity : 1;

            var downButton = document.createElement("div");
            $(downButton).addClassName("opacity_button");
            $(downButton).addClassName("down");
            downButton.observe("click", function(e) {
                var opacity = (layer.opacity) ? layer.opacity : 1;
                var newOpacity = Math.min(this.MAX_OPACITY, Math.max(this.MIN_OPACITY, (parseFloat(opacity) - 0.1).toFixed(1)));
                layer.setOpacity(newOpacity);
                opSpan.innerHTML = newOpacity;
                e.stop();
            }.bind(this));
            downButton.title = _("Minus");

            var op = document.createElement("span");
            $(op).addClassName("opacity");

            op.appendChild(downButton);
            op.appendChild(opSpan);
            op.appendChild(upButton);

            table.appendChild(this._createTableRow(_("Opacity"), op));
        }
        else {
            table.appendChild(this._createTableRow(_("Projection"), document.createTextNode(layerObj.projection)));
        }

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

        this.detailsContainer.appendChild(table);
    },

    _clearDetails: function() {
        this.detailsContainer.innerHTML = "";
    },

    _createTableRow: function(title, value) {
        var tr = document.createElement("tr");
        var th = document.createElement("th");
        th.appendChild(document.createTextNode(title));
        tr.appendChild(th);
        var td = document.createElement("td");
        td.appendChild(value);
        tr.appendChild(td);
        return tr;
    }

});
