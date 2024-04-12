document.addEventListener('alpine:init', () => {
  Alpine.data('FreeShippingBar', () => ({
    contentHTML: null,
    styleString: null,
    init() {
      this.updateStyleString(this.$root);

      window.addEventListener(
        'shapes:modalcart:afteradditem',
        this.onCartUpdate.bind(this)
      );

      window.addEventListener(
        'shapes:modalcart:cartqtychange',
        this.onCartUpdate.bind(this)
      );
    },
    async onCartUpdate() {
      const updatedSection = await freshHTML(
        getURLWithParams(window.theme.routes.root_url, {
          section_id: this.$root.id,
        })
      );

      const updatedRoot = querySelectorInHTMLString(
        '[x-data="FreeShippingBar"]',
        updatedSection
      );

      this.updateStyleString(updatedRoot);

      this.contentHTML = updatedRoot.querySelector('[data-content]').innerHTML;
    },
    updateStyleString(el) {
      if (!this.$root.hasAttribute('style')) return;

      this.styleString = el.style.cssText;
    },
  }));
});
