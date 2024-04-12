class ScrollingItemsContainer extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    if (!this.isConnected) return;

    this.scrollingItemsEl = this.firstElementChild;

    this.resizeObserver = new ResizeObserver(
      debounce((entries) => {
        const entry = entries[0];

        if (entry.contentRect.width === this.lastWidth) {
          return;
        }

        this.lastWidth = entry.contentRect.width;

        this.scrollingItemsEl.adjustScrollingItemsSpeed();
        this.scrollingItemsEl.makeClones();
      }, 150)
    );

    this.resizeObserver.observe(this);

    this.addEventListener('scrolling-items:change', () => {
      console.log('scrolling-items:change');

      this.scrollingItemsEl.adjustScrollingItemsSpeed();
      this.scrollingItemsEl.makeClones();
    });

    if (Shopify.designMode) {
      document.addEventListener('shopify:section:unload', (e) => {
        if (e.target.contains(this)) {
          this.resizeObserver.disconnect();
        }
      });
    }
  }

  disconnectedCallback() {
    this.resizeObserver.disconnect();
  }
}

class ScrollingItems extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    if (!this.isConnected) return;

    this.adjustScrollingItemsSpeed();
    this.makeClones();
  }

  adjustScrollingItemsSpeed() {
    const referenceWidth = 1024;

    document.documentElement.style.setProperty(
      '--global-scrolling-items-speed-multiplier',
      window.innerWidth / referenceWidth
    );
  }

  makeClones() {
    let i = 0;

    const fallbackContentEl = this.querySelector('noscript');

    if (fallbackContentEl) {
      this.querySelector('noscript').remove();
    }

    const scrollingItemsSurfaceEl = this.querySelector('scrolling-items-surface');

    const originalContentEl = this.querySelector('scrolling-items-content');

    if (!scrollingItemsSurfaceEl || !originalContentEl) {
      return;
    }

    const originalContentWidth =
      originalContentEl.getBoundingClientRect().width;

    if (originalContentWidth === 0) {
      return;
    }

    // get two screen widths' worth and
    // round up to an even integer
    const totalClonesNeeded =
      2 * Math.ceil((window.innerWidth * 2) / originalContentWidth / 2);

    const addClone = () => {
      const clone = originalContentEl.cloneNode(true);

      scrollingItemsSurfaceEl.append(clone);
    };

    while (scrollingItemsSurfaceEl.children.length !== totalClonesNeeded) {
      if (
        totalClonesNeeded === Infinity ||
        Number.isNaN(totalClonesNeeded) ||
        i > 1000
      ) {
        console.error(
          `Baseline: Scrolling items: Something went wrong inside the scrolling items layout function`,
          {
            originalContentWidth,
            windowInnerWidth: window.innerWidth,
            totalExistingClones: scrollingItemsSurfaceEl.children.length,
            totalClonesNeeded,
          }
        );

        break;
      }

      if (scrollingItemsSurfaceEl.children.length > totalClonesNeeded) {
        scrollingItemsSurfaceEl.removeChild(scrollingItemsSurfaceEl.lastChild);
      } else {
        addClone();
      }
    }

    this.style.setProperty(
      '--local-scrolling-items-speed-multiplier',
      this.getBoundingClientRect().width / window.innerWidth
    );
  }
}

customElements.define('scrolling-items-container', ScrollingItemsContainer);
customElements.define('scrolling-items', ScrollingItems);
