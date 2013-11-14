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
OpenLayers.Control.FeatureInfo = OpenLayers.Class(OpenLayers.Control, {   

    /**
     * @constructor
     */
    initialize: function (owsManager) {
        this.ascending = true;
        OpenLayers.Control.prototype.initialize.apply(this, []);
        this.owsManager = owsManager;
    },

    /**
     *  
     */
    destroy: function () {
        OpenLayers.Event.stopObservingElement(this.div);
        OpenLayers.Event.stopObservingElement(this.minimizeDiv);
        OpenLayers.Event.stopObservingElement(this.maximizeDiv);

        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },

    /**
     * @returns A reference to the DIV DOMElement containing the switcher tabs
     * @type DOMElement
     */
    draw: function () {
        OpenLayers.Control.prototype.draw.apply(this);

        $(this.div).addClassName("olControlOWSManager");
        $(this.div).addClassName("olControlFeatureInfo");

        Event.observe(this.div, "mouseup", this.mouseUp.bind(this));
        Event.observe(this.div, "click", this.ignoreEvent.bind(this));
        Event.observe(this.div, "mousedown", this.mouseDown.bind(this));
        Event.observe(this.div, "dblclick", this.ignoreEvent.bind(this));

        var imgLocation = OpenLayers.Util.getImagesLocation();
        var sz = new OpenLayers.Size(18, 18);

        // maximize button div
        var img = imgLocation + 'layer-switcher-maximize.png';
        this.maximizeDiv = OpenLayers.Util.createAlphaImageDiv("OpenLayers_Control_MaximizeDiv_Feature", null, sz, img, "absolute");
        this.maximizeDiv.style.top = "5px";
        this.maximizeDiv.style.right = "0px";
        this.maximizeDiv.style.left = "";
        this.maximizeDiv.style.display = "none";
        OpenLayers.Event.observe(this.maximizeDiv, "click", this.maximizeControl.bindAsEventListener(this));

        this.div.appendChild(this.maximizeDiv);

        // minimize button div
        var img = imgLocation + 'layer-switcher-minimize.png';
        var sz = new OpenLayers.Size(18, 18);
        this.minimizeDiv = OpenLayers.Util.createAlphaImageDiv("OpenLayers_Control_MinimizeDiv_Feature", null, sz, img, "absolute");
        this.minimizeDiv.style.top = "5px";
        this.minimizeDiv.style.right = "0px";
        this.minimizeDiv.style.left = "";
        this.minimizeDiv.style.display = "none";
        OpenLayers.Event.observe(this.minimizeDiv, "click", this.minimizeControl.bindAsEventListener(this));

        this.div.appendChild(this.minimizeDiv);

        this.featuresDiv = document.createElement("div");
        $(this.featuresDiv).addClassName("layersDiv");
        this.div.appendChild(this.featuresDiv);

        this.olLayerManagerHeader = document.createElement("div");
        $(this.olLayerManagerHeader).addClassName("olLayerManagerHeader");
        this.olLayerManagerHeader.innerHTML = _("Information");
        this.featuresDiv.appendChild(this.olLayerManagerHeader);

        this.olFeaturesList = document.createElement("div");
        $(this.olFeaturesList).addClassName("olServerList");
        this.featuresDiv.appendChild(this.olFeaturesList);

        this.minimizeControl();

        //forcing panel height and scroll
        this.div.style.height = this.map.size.h - 100;

        return this.div;
    },

    /** Set up the labels and divs for the control
     * 
     * @param {Event} e
     */
    maximizeControl: function (e) {
        //HACK HACK HACK - find a way to auto-size this layerswitcher
        this.div.style.width = "30em";
        this.div.style.height = "";

        this.showControls(false);

        if (e != null) {
            OpenLayers.Event.stop(e);
        }

        this.owsManager.minimizeControl();
    },

    /** Hide all the contents of the control, shrink the size, 
     *   add the maximize icon
     * 
     * @param {Event} e
     */
    minimizeControl: function (e) {
        this.div.style.width = "0px";
        this.div.style.height = "0px";

        this.showControls(true);

        if (e != null) {
            OpenLayers.Event.stop(e);
        }
    },

    /** Hide/Show all LayerSwitcher controls depending on whether we are
     *   minimized or not
     * 
     * @private
     * 
     * @param {Boolean} minimize
     */
    showControls: function (minimize) {
        this.maximizeDiv.style.display = minimize ? "" : "none";
        this.minimizeDiv.style.display = minimize ? "none" : "";
        this.featuresDiv.style.display = minimize ? "none" : "";
    },

    /** 
     * @private
     *
     * @param {Event} evt
     */
    ignoreEvent: function (evt) {
        OpenLayers.Event.stop(evt);
    },

    /** Register a local 'mouseDown' flag so that we'll know whether or not
     *   to ignore a mouseUp event
     * 
     * @private
     *
     * @param {Event} evt
     */
    mouseDown: function (evt) {
        this.mouseDown = true;
        this.ignoreEvent(evt);
    },

    /** If the 'mouseDown' flag has been set, that means that the drag was 
     *   started from within the LayerSwitcher control, and thus we can 
     *   ignore the mouseup. Otherwise, let the Event continue.
     *  
     * @private
     *
     * @param {Event} evt
     */
    mouseUp: function (evt) {
        if (this.mouseDown) {
            this.mouseDown = false;
            this.ignoreEvent(evt);
        }
    },

    setInfo: function(info, reset) {
        if (reset)
            this.olFeaturesList.innerHTML = "";
        this.olFeaturesList.innerHTML += info;
        this.maximizeControl();
    }

});
