import { html, css, LitElement } from 'https://cdn.jsdelivr.net/npm/lit@^2/+esm'
import { connect } from 'https://cdn.jsdelivr.net/npm/pwa-helpers@^0.9.1/+esm'
import { store } from '../redux/store.js'
import { hideToast } from '../actions/index.js'

export class Toast extends connect(store)(LitElement) {
  static get properties() {
    return {
      showToast: { type: Boolean },
      header: { type: String },
      message: { type: String }
    }
  }

  constructor() {
    super();
    this.showToast = false
    this.header = ''
    this.message = ''
  }

  async stateChanged(state) {
    this.showToast = state.common.showToast
    this.header = state.common.header
    this.message = state.common.message
  }

  hideToast() {
    store.dispatch(hideToast());
  }

  render() {
    return this.showToast ? html`
        <div class="toast show" style="position:fixed;top:20px;right:30px;z-index:1000">
            <div class="toast-header" style="display:flex;justify-content:space-between;">
            ${this.header}
            <button type="button" class="btn-close" @click=${this.hideToast}></button>
            </div>
            <div class="toast-body">
            ${this.message}
            </div>
        </div>
    ` : html``
  }

  createRenderRoot() {
    return this;
  }
}

customElements.define('toast-message', Toast);