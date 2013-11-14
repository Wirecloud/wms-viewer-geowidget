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

use("conwet");

conwet.Gadget = Class.create({
    initialize: function() {
        this.centerEvent = new conwet.events.Event('center_event');
        this.featureInfoEvent = new conwet.events.Event('feature_info_event');
        this.gadgetInfoEvent = new conwet.events.Event('map_info_event');
        this.legendUrl = new conwet.events.Event('legend_url');

        this.locationSlot = new conwet.events.Slot('location_slot', this.setMarker.bind(this));
        this.locationInfoSlot = new conwet.events.Slot('location_info_slot', function(location) {
            location = JSON.parse(location);
            if (typeof location == 'object') {
                this.setInfoMarker(location);
            }
        }.bind(this));

        this.wmsServiceSlot = new conwet.events.Slot('wms_service_slot', function(service) {
            service = JSON.parse(service);
            if (typeof service == 'object') {
                if (('type' in service) && ('url' in service) && ('name' in service) && (service.url != "")) {
                    if (service.type == "WMS") {
                        this.addWmsService(service);
                    } else if (service.type == "WMSC") {
                        this.addWmscService(service);
                    }

                }
            }
        }.bind(this));

        this.gadgetInfoSlot = new conwet.events.Slot('map_info_slot', function(state) {
            this.reacting_to_wiring_event = true;
            try {
                this.updateState(JSON.parse(state));
            } catch (e) {
            }
            this.reacting_to_wiring_event = false;
        }.bind(this));
        //this.gadgetInfoSlot.addEvent(this.gadgetInfoEvent);

        // Attributes
        this.messageManager = new conwet.ui.MessageManager(1000);
        this.transformer = new conwet.map.ProjectionTransformer();

        this.cursorManager = new conwet.ui.CursorManager({
            'onBlur': this._disableOtherCursors.bind(this),
            'onMove': this._moveOtherCursors.bind(this)
        });

        this.reacting_to_wiring_event = false;
        this.mapManager = new conwet.map.MapManager(this, {
            onMove: this.sendState.bind(this),
            onBeforeDrag: function() {
                this.cursorManager.disableEvents();
                this._disableOtherCursors();
            }.bind(this),
            onAfterDrag: function() {
                this.cursorManager.enableEvents();
            }.bind(this),
            initialZoom: 0,
            initialCenter: {
                'lon': 0,
                'lat': 0
            },
            cursorManager: this.cursorManager
        });

    },
    sendState: function(state) {
        if (!this.reacting_to_wiring_event) {
            if ("center" in state) {
                this.sendCenter(state.center.lon, state.center.lat);
            }
            this.gadgetInfoEvent.send(Object.toJSON(state));
        }
    },
    updateState: function(state) {
        if (typeof state == 'object') {
            if (('lonlat' in state) || ('focus' in state)) {
                if ('lonlat' in state) {
                    state.cursor = this.mapManager.getPixelFromLonLat(state.lonlat.lon, state.lonlat.lat);
                    if (state.cursor) {
                        this.cursorManager.updateState(state);
                    }
                }
            }
            if (('zoom' in state) || ('center' in state)) {
                this.mapManager.updateState(state);
            }
        }
    },
    addWmsService: function(wmsService) {
        this.mapManager.addWmsService(wmsService.name, wmsService.url);
    },
    addWmscService: function(wmscService) {
        this.mapManager.addWmscService(wmscService.name, wmscService.url);
    },
    sendFeatureInfo: function(feature) {
        this.featureInfoEvent.send(feature);
    },
    sendCenter: function(lon, lat) {
        this.centerEvent.send(lon + "," + lat);
    },
    sendLocation: function(lon, lat) {
        MashupPlatform.wiring.pushEvent('location_event', lon + "," + lat);
    },
    setMarker: function(lonlat) {
        this.mapManager.setHighlightMarker(JSON.parse(lonlat));

    },
    setInfoMarker: function(positionInfos) {
        if (positionInfos.length) {
            if (positionInfos[0].bbox != null)
                this.mapManager.setBox(positionInfos[0]);
            else
                this.mapManager.setEventMarker(positionInfos);
        }
    },
    _disableOtherCursors: function() {
        this.sendState({'focus': true});
    },
    _moveOtherCursors: function(x, y) {
        var lonlat = this.mapManager.getLonLatFromPixel(x, y);
        if (!lonlat)
            return;
        this.sendState({
            'lonlat': {
                'lon': lonlat.lon,
                'lat': lonlat.lat
            },
            'focus': false
        });
    },
    showMessage: function(message, permanent) {
        this.messageManager.showMessage(message, conwet.ui.MessageManager.INFO, permanent);
    },
    hideMessage: function() {
        this.messageManager.hideMessage();
    },
    showError: function(message, permanent) {
        this.messageManager.showMessage(message, conwet.ui.MessageManager.ERROR, permanent);
    }

});
