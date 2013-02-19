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

conwet.ui.UIUtils = Class.create({
    initialize: function() {
    }
});

conwet.ui.UIUtils.createButton = function(options) {
    var default_options = $H({
        classNames: [],
        onClick   : function(){},
        title     : ""
    });
    options = default_options.merge(options);

    var button = document.createElement("div");

    var classNames = options.get("classNames");
    for (var i=0; i<classNames.length; i++) {
        $(button).addClassName(classNames[i]);
    }

    button.title = options.get("title");

    if (options.get("value")) {
        button.appendChild(document.createTextNode(options.get("value")));
    }

    var context = {"onClick": options.get("onClick")};
    button.observe("click", function(e) {
        this.onClick(e);
        e.stop();
    }.bind(context));
    conwet.ui.UIUtils.ignoreEvents(button, ["dblclick", "mouseover", "mouseout", "mousedown", "mouseup"]);

    return button;
}

conwet.ui.UIUtils.ignoreEvents = function(element, events) {
    for (var i=0; i<events.length; i++) {
        element.observe(events[i], conwet.ui.UIUtils.ignoreEventHandler);
    }
}

conwet.ui.UIUtils.ignoreEventHandler = function(e) {
    e.stop();
}
