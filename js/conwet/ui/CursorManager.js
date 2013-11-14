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

conwet.ui.CursorManager = Class.create({
    initialize: function(options) {
        //HTML Elements
        this.contentElement = $('content');
        this.cursorElement = $('cursor');

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
        //this.enableEvents();
        this.enabled = false;

        // Init
        this.updateState({'focus': true});

    },
    enableEvents: function() {
        if (!this.enabled) {
            if (this.map != null)
                this.map.events.register('mousemove', this, this._move);
            if (this.map != null)
                this.map.events.register('mouseout', this, this._onBlur);

            this.contentElement.addEventListener('mousemove', this._move);
            this.contentElement.addEventListener('mouseout', this._onBlur);
            this.enabled = true;
        }
    },
    disableEvents: function() {
         if (this.enabled) {
            if (this.map != null)
                this.map.events.unregister('mousemove', this, this._move);
            if (this.map != null)
                this.map.events.unregister('mousemove', this, this._move);
            this.contentElement.removeEventListener('mousemove', this._move);
            this.contentElement.removeEventListener('mouseout', this._onBlur);
            this.enabled = false;
        }
    },
    updateState: function(state) {
        if ('cursor' in state) {
            var deltaX = /*Math.floor(this.contentElement.offsetWidth  / 2)*/ -Math.floor(this.cursorElement.offsetWidth / 2);
            var deltaY = /*Math.floor(this.contentElement.offsetHeight / 2)*/ -Math.floor(this.cursorElement.offsetHeight / 2);

            this.cursorElement.style.left = (state.cursor.x + deltaX) + 'px';
            this.cursorElement.style.top = (state.cursor.y + deltaY) + 'px';
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
        var deltaX = 0;//Math.floor(this.contentElement.offsetWidth  / 2);
        var deltaY = 0;//Math.floor(this.contentElement.offsetHeight / 2);

        this.updateState({'focus': true});
        this._onMove(e.pointerX() - deltaX, e.pointerY() - deltaY);
    },
    _onBlur: function() {
        // To overwrite
    },
    _onMove: function(x, y) {
        // To overwrite
    },
    setMap: function(map) {
        this.map = map;
        this.enableEvents();
    }
});
