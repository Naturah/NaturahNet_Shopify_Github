function throttle(callback, limit) {
  var waiting = false; // Initially, we're not waiting
  return function () {
    // We return a throttled function
    if (!waiting) {
      // If we're not waiting
      callback.apply(this, arguments); // Execute users function
      waiting = true; // Prevent future invocations
      setTimeout(function () {
        // After a period of time
        waiting = false; // And allow future invocations
      }, limit);
    }
  };
}

/**
 * Wrapper around Object.assign that deletes null or undefined
 * keys from the provided object, making them fall back to
 * values in the defaults object.
 *
 *
 * @param {Object} defaults - An object with defaults for settings/config
 * @param {Object} provided - Provided settings/config object
 * @returns {Object} - Merged object
 */

function objectWithDefaults(defaults, provided) {
  filterObjectByValues(provided, (value) => {
    return value === null || value === undefined;
  });

  return Object.assign(defaults, provided);
}

function wrapAll(nodes, wrapper) {
  // Cache the current parent and previous sibling of the first node.
  var parent = nodes[0].parentNode;
  var previousSibling = nodes[0].previousSibling;

  // Place each node in wrapper.
  //  - If nodes is an array, we must increment the index we grab from
  //    after each loop.
  //  - If nodes is a NodeList, each node is automatically removed from
  //    the NodeList when it is removed from its parent with appendChild.
  for (var i = 0; nodes.length - i; wrapper.firstChild === nodes[0] && i++) {
    wrapper.appendChild(nodes[i]);
  }

  // Place the wrapper just after the cached previousSibling
  parent.insertBefore(wrapper, previousSibling.nextSibling);

  return wrapper;
}

function unwrap(wrapper) {
  // place childNodes in document fragment
  var docFrag = document.createDocumentFragment();
  while (wrapper.firstChild) {
    var child = wrapper.removeChild(wrapper.firstChild);
    docFrag.appendChild(child);
  }

  // replace wrapper with document fragment
  wrapper.parentNode.replaceChild(docFrag, wrapper);
}

function initTeleport(el) {
  if (!el) return;

  const teleportCandidates = el.querySelectorAll('[data-should-teleport]');

  if (teleportCandidates.length) {
    teleportCandidates.forEach((teleportCandidate) => {
      teleportCandidate.setAttribute(
        'x-teleport',
        teleportCandidate.dataset.shouldTeleport
      );
    });
  }
}

async function fetchSectionHTML(url, selector) {
  const res = await fetch(url);
  const fetchedSection = await res.text();
  const result = querySelectorInHTMLString(selector, fetchedSection);
  if (result === null) {
    return null;
  } else {
    return result.innerHTML;
  }
}

function fetchConfigDefaults(type = 'json') {
  return {
    method: 'POST',
    credentials: 'same-origin',
    headers: {
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/json;',
      Accept: `application/${type}`,
    },
  };
}

function parseDOMFromString(htmlString) {
  window.___shapesDOMParser = window.___shapesDOMParser || new DOMParser();

  return window.___shapesDOMParser.parseFromString(htmlString, 'text/html');
}

function querySelectorInHTMLString(selector, htmlString) {
  return parseDOMFromString(htmlString).querySelector(selector);
}

/**
 * Light wrapper around fetch for making common
 * requests easier. Provides very basic caching.
 */

window.__fetchCache = window.__fetchCache || {};

const RESPONSE_TYPE_JSON = 0;
const RESPONSE_TYPE_TEXT = 1;

async function fetchAndCache(
  url,
  options,
  cacheTimeout = 5000,
  forceFresh = false,
  responseType
) {
  if (__fetchCache[url] && !forceFresh) {
    return __fetchCache[url];
  }

  const responseReader =
    responseType === RESPONSE_TYPE_TEXT
      ? Response.prototype.text
      : Response.prototype.json;

  const res = await fetch(url, options);
  const data = responseReader.call(res);

  if (cacheTimeout && cacheTimeout > 0) {
    __fetchCache[url] = data;

    setTimeout(() => {
      delete __fetchCache[url];
    }, cacheTimeout);
  }

  return data;
}

/**
 * fetchHTML and fetchJSON cache responses for 5 seconds
 * by default; if a fresh request is required, set
 * forceFresh to true or use the freshHTML and freshJSON
 * helper functions.
 */

async function fetchHTML(
  url,
  options,
  cacheTimeout = 5000,
  forceFresh = false
) {
  return fetchAndCache(
    url,
    options,
    cacheTimeout,
    forceFresh,
    RESPONSE_TYPE_TEXT
  );
}

function freshHTML(url, options) {
  return fetchHTML(url, options, 0, true);
}

async function fetchJSON(
  url,
  options,
  cacheTimeout = 5000,
  forceFresh = false
) {
  return fetchAndCache(
    url,
    options,
    cacheTimeout,
    forceFresh,
    RESPONSE_TYPE_JSON
  );
}

function freshJSON(url, options) {
  return fetchJSON(url, options, 0, true);
}

async function fetchHTMLFragment(url, selector) {
  const fetchedHTMLString = await fetchHTML(url);
  const fragment = querySelectorInHTMLString(selector, fetchedHTMLString);

  return fragment ? fragment.innerHTML : '';
}

function clearURLSearchParams(url) {
  for (const key of [...url.searchParams.keys()]) {
    url.searchParams.delete(key);
  }
}

/**
 * paramsInput can be a string, a sequence of pairs,
 * or a record, as per:
 *
 * https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams/URLSearchParams#examples
 *
 * It can also be an instance of URLSearchParams.
 *
 */

function _getURLByModifyingParams(
  urlString,
  paramsInput,
  clear = false,
  append
) {
  const url = new URL(urlString, window.location.origin);

  if (clear) {
    clearURLSearchParams(url);
  }

  const params = new URLSearchParams(paramsInput);

  const setOrAppendParam = append
    ? URLSearchParams.prototype.append
    : URLSearchParams.prototype.set;

  for (const [key, value] of params) {
    setOrAppendParam.call(url.searchParams, key, value);
  }

  return url;
}

function getURLWithParams(url, paramsInput, clear = false) {
  return _getURLByModifyingParams(url, paramsInput, clear, false);
}

function currentURLWithParams(paramsInput, clear = false) {
  return getURLWithParams(window.location.href, paramsInput, clear);
}

function getURLAddingParams(url, paramsInput, clear = false) {
  return _getURLByModifyingParams(url, paramsInput, clear, true);
}

function currentURLAddingParams(paramsInput, clear = false) {
  return getURLAddingParams(window.location.href, paramsInput, clear);
}

let touchDevice = false;

window.setTouch = function () {
  touchDevice = true;
};

window.isTouch = function () {
  return touchDevice;
};

function getModalLabel(modalSlotName, slotEl) {
  if (Alpine.store('modals')[modalSlotName].open) {
    const labelSourceEl = Array.from(slotEl.children).filter((el) =>
      el.hasAttribute('data-modal-label')
    )[0];

    if (labelSourceEl) {
      return labelSourceEl.dataset.modalLabel;
    }
  }

  return false;
}

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
