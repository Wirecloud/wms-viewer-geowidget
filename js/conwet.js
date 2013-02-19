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

/*========.PACKAGES.========*/
var conwet = {};
conwet.ui  = {};
conwet.map = {};

function registerNS(ns) {
    var nsParts = ns.split(".");
    var root = window;

    for(var i=0; i<nsParts.length; i++) {
        if(nsParts[i] root[] == "undefined")
            root[nsParts[i]] = {};
        root = root[nsParts[i]];
    }
}

/*********.GADGET.*********/
conwet.Gadget = Class.create({

    initialize: function() {
        // EzWeb Events
        this.event = new conwet.PropagableEvent('eventNR');
        this.slot  = new conwet.PropagableSlot('slotP', function(state) {
            this.updateState(state.evalJSON());
        }.bind(this));
        this.slot.addEvent(this.event);

        // Attributes
        this.cursorManager = new conwet.ui.CursorManager({
            'onBlur'       : this._disableOtherCursors.bind(this),
            'onMove'       : this._moveOtherCursors.bind(this)
        });
        this.mapManager = new conwet.map.MapManager('http://vmap0.tiles.osgeo.org/wms/vmap0?', {
            'onMove'       : this.sendState.bind(this),
            'onBeforeDrag' : function() {
                this.cursorManager.disableEvents();
                this._disableOtherCursors();
            }.bind(this),
            'onAfterDrag'  : function() {
                this.cursorManager.enableEvents();
            }.bind(this),
            'initialZoom'  : 0.5,
            'initialCenter' : {
                'lon': 0,
                'lat': 0
            }
        });
    },

    sendState: function(state) {
        this.event.send(Object.toJSON(state));
    },

    updateState: function(state) {
        if (typeof state == 'object') {
            if (('cursor' in state) || ('focus' in state)) {
                this.cursorManager.updateState(state);
            }
            if (('zoom' in state) || ('center' in state)) {
                this.mapManager.updateState(state);
            }
        }
    },

    _disableOtherCursors: function() {
        this.sendState({'focus': true});
    },

    _moveOtherCursors: function(x, y) {
        this.sendState({
            'cursor': {
                'x': x,
                'y': y
            },
            'focus' : false
        });
    }

});

/*********.CLICK.*********/
OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {
    initialize: function(map) {
        this.map = map;

        this.handlerOptions = OpenLayers.Util.extend({}, {
            'single': true,
            'delay': 200
        });

        OpenLayers.Control.prototype.initialize.apply(this); 

        this.handler = new OpenLayers.Handler.Click(this, {
            'click': this.onClick.bind(this)
        }, this.handlerOptions);
    }, 

    onClick: function(e) {
        this.map.panTo(this.map.getLonLatFromPixel(e.xy));
    }

});

/*********.MAP_TRANSFORMER.*********/
conwet.map.MapTransformer = Class.create({

    initialize: function(map) {
        this.DEFAULT = new OpenLayers.Projection('EPSG:4326');
        this.map     = map;
    },

    normalize: function(point) {
        return point.transform(this.map.getProjectionObject(), this.DEFAULT);
    },

    transform: function(point) {
        return point.transform(this.DEFAULT, this.map.getProjectionObject());
    }

});

/*********.MAP_MANAGER.*********/
conwet.map.MapManager = Class.create({

    initialize: function(mapUrl, options) {
        // Map
        this.map = new OpenLayers.Map({
            'div'              : 'map',
            'panMethod'        : null,
            'controls'         : [],
            'units'            : 'm',
            'projection'       : new OpenLayers.Projection('EPSG:4326'),
            'displayProjection': new OpenLayers.Projection('EPSG:4326'),
            'maxResolution'    : 156543.0339,
            'maxExtent'        : new OpenLayers.Bounds(-20037508.34, -20037508.34, 20037508.34, 20037508.34),
            'numZoomLevels'    : 19
        });

        this.transformer = new conwet.map.MapTransformer(this.map);

        // Init
        this.isDrag    = false;
        this.zoomLevel = -1;
        this.center    = new OpenLayers.LonLat(-1, -1);

        // Base layers
        this.layers = [];
        var osm = new OpenLayers.Layer.OSM("OpenStreetMap");
        var gmap  = new OpenLayers.Layer.Google("Google Strrets", {'visibility': false});

        // For Yahoo (bugs)
        //var yahoo = new OpenLayers.Layer.Yahoo( "Yahoo");
        //this.map.addLayers([osm, gmap, yahoo]);

        this.map.addLayers([osm, gmap]);

        // Controls
        this.map.addControl(new OpenLayers.Control.LayerSwitcher());

        var click = new OpenLayers.Control.Click(this.map);
        this.map.addControl(click);
        click.activate();

        this.mousePosition = new OpenLayers.Control.MousePosition();
        this.map.addControl(this.mousePosition);

        this.map.addControl(new OpenLayers.Control.PanPanel());
        this.map.addControl(new OpenLayers.Control.OverviewMap());
        this.map.addControl(new OpenLayers.Control.Navigation({'zoomWheelEnabled': false}));
        this.map.addControl(new OpenLayers.Control.ScaleLine());

        // Options
        if (arguments.length > 1) {
            if ('onMove' in options) {
                this._onMove = options.onMove;
            }
            if ('onBeforeDrag' in options) {
                this._onBeforeDrag = options.onBeforeDrag;
            }
            if ('onAfterDrag' in options) {
                this._onAfterDrag = options.onAfterDrag;
            }
        }
        else {
            options = {};
        }

        options['onSetZoom'] = this.setZoom.bind(this);
        options['onZoomOut'] = this.zoomOut.bind(this);
        options['onZoomIn']  = this.zoomIn.bind(this);

        // ZoomBar
        this.zoomBar = new conwet.ui.ZoomBar(options);

        // Map Events
        this.map.events.register("moveend", this, function() {
            var changes = {};
            var zoomLevel = this.map.getZoom();

            if (this.zoomLevel != zoomLevel) {
                this.zoomLevel = zoomLevel;
                var zoom = zoomLevel / this.map.getNumZoomLevels();
                this.zoomBar.setZoom(zoom);
                changes["zoom"] = zoom;
            }

            var center = this.transformer.normalize(this.map.getCenter());
            if (!this.center.equals(center)) {
                this.center = center;
                changes['center'] = center;
            }

            if (('zoom' in changes) || ('center' in changes)) {
                this._onMove(changes);
            }

            this.isDrag = false;
            this.mousePosition.activate();
            this._onAfterDrag();
        }.bind(this));

        this.map.events.register("movestart", this, function() {
            this.isDrag = true;
            this.mousePosition.deactivate();
            // TODO Si haces dos drag seguidos sin mover el cursor, desaparecen las coordenadas
            this._onBeforeDrag();
        }.bind(this));

        this.map.events.register('mouseover', this, function() {
            if (!this.isDrag) {
                this.mousePosition.activate();
            }
        });
        this.map.events.register('mouseout',  this.mousePosition, this.mousePosition.deactivate);

        // Initial Options
        if ('initialZoom' in options) {
            this.setZoom(options.initialZoom);
        }

        if ('initialCenter' in options) {
            this.setCenter(options.initialCenter.lon, options.initialCenter.lat);
        }

    },

    addLayer: function(url, options) {
        var layer = new OpenLayers.Layer.WMS('OpenLayers WMS', url, options);
        this.layers.push(layer);
        this.map.addLayer(layer);
    },

    updateState: function(state) {
        if ('zoom' in state) {
            this.setZoom(state.zoom);
        }
        if ('center' in state) {
            this.setCenter(state.center.lon, state.center.lat);
        }
    },

    setCenter: function(lon, lat) {
        var center = this.transformer.transform(new OpenLayers.LonLat(lon, lat));
        if (!this.center.equals(center)) {
            this.map.setCenter(center, this.map.getZoom());
        }
    },

    setZoom: function(zoom) {
        this._setZoomLevel(Math.round(this.map.getNumZoomLevels() * zoom));
    },

    zoomIn: function() {
        this._setZoomLevel(this.zoomLevel + 1);
    },

    zoomOut: function() {
        this._setZoomLevel(this.zoomLevel - 1);
    },

    _setZoomLevel: function(zoomLevel) {
        zoomLevel = (zoomLevel < 0)? 0: zoomLevel;
        zoomLevel = (zoomLevel >= this.map.getNumZoomLevels())? this.map.getNumZoomLevels()-1: zoomLevel;

        if (this.zoomLevel != zoomLevel) {
            this.map.zoomTo(zoomLevel);
        }
    },

    _onMove: function(zoom) {
        // To overwrite
    },

    _onBeforeDrag: function() {
        // To overwrite
    },

    _onAfterDrag: function() {
        // To overwrite
    }

});

/*********.CURSOR_MANAGER.*********/
conwet.ui.CursorManager = Class.create({

    initialize: function(options) {
        //HTML Elements
        this.contentElement = $('content');
        this.cursorElement  = $('cursor');

        //Options
        if (arguments.length > 0) {
            if ('onMove' in options) {
                this._onMove = options.onMove;
            }
            if ('onBlur' in options) {
                this._onBlur = options.onBlur;
            }
        }

        // HTML Events
        this._move = this._move.bind(this)
        this.enableEvents();

        // Init
        this.updateState({'focus' : false});
    },

    enableEvents: function() {
        this.contentElement.observe('mousemove', this._move);
        this.contentElement.observe('mouseout',  this._onBlur);
    },

    disableEvents: function() {
        this.contentElement.stopObserving('mousemove', this._move);
        this.contentElement.stopObserving('mouseout',  this._onBlur);
    },

    updateState: function(state) {
        if ('cursor' in state) {
            var deltaX = Math.floor(this.contentElement.offsetWidth  / 2) - Math.floor(this.cursorElement.offsetWidth / 2);
            var deltaY = Math.floor(this.contentElement.offsetHeight / 2) - Math.floor(this.cursorElement.offsetHeight / 2);

            this.cursorElement.style.left = (state.cursor.x + deltaX) + 'px';
            this.cursorElement.style.top  = (state.cursor.y + deltaY) + 'px';
        }
        if ('focus' in state) {
            if (state.focus) {
                this.cursorElement.addClassName("invisible");
            }
            else {
                this.cursorElement.removeClassName("invisible");
            }
        }
    },

    _move: function(e) {
        var deltaX = Math.floor(this.contentElement.offsetWidth  / 2);
        var deltaY = Math.floor(this.contentElement.offsetHeight / 2);

        this.updateState({'focus' : true});
        this._onMove(e.pointerX() - deltaX, e.pointerY() - deltaY);
    },

    _onBlur: function() {
        // To overwrite
    },

    _onMove: function(x, y) {
        // To overwrite
    }

});

/*========.INIT.========*/
var init = function() {
    new conwet.Gadget();
}
