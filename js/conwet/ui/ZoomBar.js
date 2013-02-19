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

use('conwet.ui');

conwet.ui.ZoomBar = Class.create({

    initialize: function(options) {
        this.actualZoom = 0;

        // HTML Elements
        this.contentElement = $('content');
        this.zoom           = $('zoom');
        this.zoomHandle     = $('zoom_handle');
        this.zoomBar        = $('zoom_bar');
        this.plusButton     = $('zoom_plus');
        this.minusButton    = $('zoom_minus');

        // Drag and Drop
        this.isDrag       = false;
        this.lastDeltaY   = 0;

        this.HANDLE_DELTA = Math.floor(this.zoomHandle.offsetHeight / 2);
        this.TOP_LIMIT    = -1 * this.HANDLE_DELTA;
        this.BOTTOM_LIMIT = this.zoomBar.offsetHeight - this.HANDLE_DELTA;

        // Necesary for disable events
        this.stopDrag   = this._stopDrag.bind(this);
        this.moveHandle = this._moveHandle.bind(this);

        // Optional paramenters
        if (arguments.length > 0) {
            if ('onBeforeDrag' in options) {
                this._onBeforeDrag = options.onBeforeDrag;
            }
            if ('onAfterDrag' in options) {
                this._onAfterDrag = options.onAfterDrag;
            }
            if ('onSetZoom' in options) {
                this._onSetZoom = options.onSetZoom;
            }
            if ('onZoomOut' in options) {
                this._onZoomOut = options.onZoomOut;
            }
            if ('onZoomIn' in options) {
                this._onZoomIn = options.onZoomIn;
            }
        }

        // HTML Events
        this.plusButton.observe  ('click',     this._onZoomIn);
        this.minusButton.observe ('click',     this._onZoomOut);
        this.zoomBar.observe     ('mousedown', this._zoomByClick.bind(this));
        this.zoomHandle.observe  ('mousedown', this._startDrag.bind(this));
    },

    enableEvents: function() {
        this.contentElement.observe('mouseup',   this.stopDrag);
        this.contentElement.observe('mousemove', this.moveHandle);
    },

    disableEvents: function() {
        this.contentElement.stopObserving('mouseup',   this.stopDrag);
        this.contentElement.stopObserving('mousemove', this.moveHandle);
    },

    getZoom: function() {
        return this.actualZoom;
    },

    setZoom: function(zoom) {
        zoom = (zoom < 0)? 0: ((zoom > 1)? 1: zoom);
        if (zoom != this.actualZoom) {
            this.actualZoom = zoom;
            this._updateHandlePosition(this.actualZoom);
            this._onSetZoom(this.actualZoom);
        }
    },

    _updateHandlePosition: function(zoom) {
        zoom = (zoom < 0)? 0: ((zoom > 1)? 1: zoom);
        this.zoomHandle.style.top = this._getPositionByZoom(zoom) + 'px';
    },

    _getPositionByZoom: function(zoom) {
        return ((this.BOTTOM_LIMIT + this.HANDLE_DELTA) * (1 - zoom)) - this.HANDLE_DELTA;
    },

    _getZoomByPosition: function(position) {
        return 1 - ((position + this.HANDLE_DELTA) / (this.BOTTOM_LIMIT + this.HANDLE_DELTA));
    },

    _zoomByClick: function(e) {
        this.setZoom(this._getZoomByPosition(e.pointerY() - this.zoom.offsetTop - this.zoomBar.offsetTop - this.HANDLE_DELTA));
        e.stop();
    },

    _startDrag: function(e) {
        this.contentElement.addClassName("dragging");
        this.isDrag = true;
        var y = e.pointerY() - this.zoomBar.offsetTop;
        this.lastDeltaY = y - this.zoomHandle.offsetTop;

        this.enableEvents();
        e.stop();
        this._onBeforeDrag();
    },

    _stopDrag: function(e) {
        this.contentElement.removeClassName("dragging");
        e.stop();
        if (this.isDrag) {
            this.disableEvents();
            this._onAfterDrag();
            this._moveHandle(e, true);
            this.isDrag = false;
        }
    },

    _moveHandle: function(e, noDragging) {
        if (this.isDrag) {
            var y = e.pointerY() - this.zoomBar.offsetTop;

            var handlePos = y - this.lastDeltaY;
            if (handlePos < this.TOP_LIMIT) {
                handlePos = this.TOP_LIMIT;
            }
            else if (handlePos > this.BOTTOM_LIMIT) {
                handlePos = this.BOTTOM_LIMIT;
            }

            var zoom = this._getZoomByPosition(handlePos);
            if ((arguments.length > 1) && noDragging) {
                this.setZoom(zoom);
            }
            else {
                this._updateHandlePosition(zoom);
            }

            this.lastDeltaY = (handlePos + this.lastDeltaY) - this.zoomHandle.offsetTop;
        }
    },

    _onSetZoom: function(zoom) {
        // To overwrite
    },

    _onZoomIn: function() {
        // To overwrite
    },

    _onZoomOut: function() {
        // To overwrite
    },

    _onBeforeDrag: function() {
        // To overwrite
    },

    _onAfterDrag: function() {
        // To overwrite
    }

});
