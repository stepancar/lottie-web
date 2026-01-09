import { getLocationHref } from '../../main';
import {
  createElementID,
} from '../../utils/common';
import filtersFactory from '../../utils/filters';

var registeredEffects = {};
var idPrefix = 'filter_result_';

function CVSVGEffects(elem) {
  var i;
  var source = 'SourceGraphic';
  var len = elem.data.ef ? elem.data.ef.length : 0;
  var filId = createElementID();
  var fil = filtersFactory.createFilter(filId, true);
  var count = 0;
  this.filters = [];
  var filterManager;
  for (i = 0; i < len; i += 1) {
    filterManager = null;
    var type = elem.data.ef[i].ty;
    if (registeredEffects[type]) {
      var Effect = registeredEffects[type].effect;
      filterManager = new Effect(fil, elem.effectsManager.effectElements[i], elem, idPrefix + count, source);
      source = idPrefix + count;
      if (registeredEffects[type].countsAsEffect) {
        count += 1;
      }
    }
    if (filterManager) {
      this.filters.push(filterManager);
    }
  }
  if (count) {
    const globalSVGsContainer = document.getElementById('lottie_svg_container') || (() => {
      const element = document.createElement('div');
      // element.setAttribute('id', 'lottie_svg_container');
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      element.appendChild(svg);
      document.body.appendChild(element);

      const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.setAttribute('id', 'lottie_svg_container');
      svg.appendChild(defs);
      return defs;
    })();

    globalSVGsContainer.appendChild(fil);
  }
  if (this.filters.length) {
    elem.addRenderableComponent(this);
  }
  this.globalData = elem.globalData;
  this.filterId = filId;
}

CVSVGEffects.prototype.renderFrame = function (_isFirstFrame) {
  var i;
  var len = this.filters.length;
  for (i = 0; i < len; i += 1) {
    this.filters[i].renderFrame(_isFirstFrame);
  }

  this.globalData.canvasContext.filter = 'url(' + getLocationHref() + '#' + this.filterId + ')';
};

CVSVGEffects.prototype.getEffects = function (type) {
  var i;
  var len = this.filters.length;
  var effects = [];
  for (i = 0; i < len; i += 1) {
    if (this.filters[i].type === type) {
      effects.push(this.filters[i]);
    }
  }
  return effects;
};

export function registerEffect(id, effect, countsAsEffect) {
  registeredEffects[id] = {
    effect,
    countsAsEffect,
  };
}

export default CVSVGEffects;
