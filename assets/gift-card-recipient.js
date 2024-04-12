document.addEventListener('alpine:init', () => {
  Alpine.data('Theme_GiftCardRecipient', () => ({
    enabled: false,
    recipientMessage: '',
    get messageLength() {
      return this.recipientMessage.length;
    },
    errors: null,
    init() {
      document.body.addEventListener('shapes:cart:adderror', (e) => {
        if (
          e.detail.source === 'product-form' &&
          e.detail.sourceId === this.$root.closest('form').getAttribute('id')
        ) {
          this.errors = e.detail.errors;
          this.enabled = true;

          this.$root.scrollIntoView({ block: 'start', behavior: 'smooth' });
        }
      });
    },
  }));
});
