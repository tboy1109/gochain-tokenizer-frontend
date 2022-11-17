import { html, css, LitElement } from 'https://cdn.jsdelivr.net/npm/lit@^2/+esm'
import { connect } from 'https://cdn.jsdelivr.net/npm/pwa-helpers@^0.9.1/+esm'
import { store } from '../redux/store.js'

export class Loader extends connect(store)(LitElement) {
  static get properties() {
    return {
      loading: { type: Boolean }
    }
  }

  constructor() {
    super();
    this.loading = false
  }

  async stateChanged(state) {
    this.loading = state.common.loading
  }

  render() {
    return this.loading ? html`
              <div class="loading">
                <img src="/assets/images/loading1.gif" style="opacity:1;"/>
              </div>
            ` : html``
  }

  createRenderRoot() {
    return this;
  }
}

customElements.define('loader-component', Loader);