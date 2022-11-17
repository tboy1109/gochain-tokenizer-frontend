import { html, css, LitElement } from 'https://cdn.jsdelivr.net/npm/lit@^2/+esm' // 'https://cdn.skypack.dev/lit'
import 'https://cdn.jsdelivr.net/npm/@material/mwc-button@^0.25.0/+esm';

export class TokenIssued extends LitElement {
  constructor() {
    super();
  }

  async connectedCallback() {
    super.connectedCallback();
  }

  render() {
    return html`<div class="container px-4 py-5 my-5 text-center justify-content-start">
            <div class="mt-4 p-5 bg-secondary text-white rounded mb-4">
              <h1>Token issued</h1>
              <h3>Your TokenID: ${localStorage.getItem('curTokenId')}</h3>
            </div>
            <p class="lead mb-4 text-start"><b>Your identity has been verified and your token has been issued to your digital wallet</b></p>
            <p class="lead mb-4 text-start"><b>To burn your title token <a>Click here</a> and it will be permanently deleted. <br/> You may request a new token for the same title at a later date.</b></p>
            <a class="text-decoration-none" href="/admin">View your token details</a>
        </div>`
  }

  createRenderRoot() {
    return this;
  }
}

customElements.define('token-issued', TokenIssued);