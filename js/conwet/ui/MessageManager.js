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

conwet.ui.MessageManager = Class.create({

    initialize: function(time) {
        this.timeout = -1;
        this.time    = (time)? time: 3000;

        // HTML Elements
        this.contentElement = document.createElement("div");
        $(this.contentElement).addClassName("message");
        document.body.appendChild(this.contentElement);

        this._hide();
    },

    showMessage: function(message, type, permanent) {
        permanent = (permanent)? permanent: false;

        this._stopInterval();
        this._updateType(type);
        this.contentElement.innerHTML = message;
        this._show();
        if (!permanent) {
            this._startInterval();
        }
    },

    hideMessage: function() {
        this._stopInterval();
        this._hide();
    },

    _updateType: function(type) {
        if (type == conwet.ui.MessageManager.ERROR) {
            this.contentElement.addClassName("error");
        }
        else {
            this.contentElement.removeClassName("error");
        }
    },

    _stopInterval: function() {
        clearTimeout(this.timeout);
    },

    _startInterval: function() {
        this.timeout = setTimeout(this._hide.bind(this), this.time);
    },

    _hide: function() {
        this.contentElement.addClassName("no_display");
    },

    _show: function() {
        this.contentElement.removeClassName("no_display");
    }

});

conwet.ui.MessageManager.INFO  = 0;
conwet.ui.MessageManager.ERROR = 1;
