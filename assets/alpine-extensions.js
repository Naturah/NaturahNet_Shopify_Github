// Custom alpine directives go here
//
// For example, `x-uppercase`:
//
// Alpine.directive('uppercase', (el) => {
//   el.textContent = el.textContent.toUpperCase();
// });

const { mutateDom, initTree } = Alpine;

Alpine.magic('fetchedSection', () => {
  return (url, selector) => {
    return async () => {
      return await fetchSectionHTML(url, selector);
    };
  };
});

Alpine.directive(
  'html-if-set',
  (el, { expression }, { effect, evaluateLater }) => {
    let evaluate = evaluateLater(expression);

    function saveInitialHTML() {
      el._x_custom_initialHTML = el.innerHTML;
    }

    function getInitialHTML() {
      return el._x_custom_initialHTML;
    }

    effect(() => {
      let newHTML;

      evaluate((value) => {
        if (Boolean(value)) {
          newHTML = value;

          if (!getInitialHTML()) {
            saveInitialHTML();
          }
        } else {
          if (getInitialHTML()) {
            newHTML = getInitialHTML();
          }
        }

        if (newHTML) {
          mutateDom(() => {
            el.innerHTML = newHTML;

            el._x_ignoreSelf = true;
            initTree(el);
            delete el._x_ignoreSelf;
          });
        }
      });
    });
  }
);

document.addEventListener('DOMContentLoaded', () => {
  Alpine.start();
});
