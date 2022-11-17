import { html, css, LitElement } from 'https://cdn.jsdelivr.net/npm/lit@^2/+esm' // 'https://cdn.skypack.dev/lit'
import 'https://cdn.jsdelivr.net/npm/@material/mwc-button@^0.25.0/+esm';
import { connect } from 'https://cdn.jsdelivr.net/npm/pwa-helpers@0/+esm'
import { auth, onAuthStateChanged } from '/assets/js/firebase.js'
import { getAssets } from '../js/api.js';
import { endAction, startAction } from '../actions/index.js'
import { store } from '../redux/store.js'

export class Title extends connect(store)(LitElement) {
  static get properties() {
    return {
      assets: { type: Array },
      currentId: { type: String },
      loaded: { type: Boolean }
    }
  }

  constructor() {
    super();
    this.assets = []
    this.loaded = false
  }

  async connectedCallback() {
    super.connectedCallback();
    this.fetchData();
  }

  fetchData() {
    onAuthStateChanged(auth, async (user) => {
      console.log("STATE CHANGED in register asset:", user)
      store.dispatch(startAction())
      if (user) {
        // this.signedIn = true
        const { assets } = await getAssets(user.uid);
        this.assets = [...assets]
        this.loaded = true
      } else {
        // this.signedIn = false
      }
      store.dispatch(endAction())
    });
  }

  onChangeTitle = id => {

    this.currentId = id
    const index = this.assets.findIndex(asset => asset.id === id)
    console.log("changed index:", index, this.currentId, this.assets[index].name)
    localStorage.setItem('currentTitle', id)
    localStorage.setItem('currentTitleName', this.assets[index].name)
  }

  onContinue = () => {
    window.location.href = '/wallet'
  }

  render() {
    console.log('currentId:', this.currentId)

    return html`<div class="container px-4 py-5 my-5 text-center justify-content-start">
            <div class="row justify-content-center">
            <div class="col-12 col-sm-12 col-md-8 col-lg-6 col-xl-6">
            <h1 class="fw-bold width-auto mb-5">Which title would you like to receive a token for?</h1>
            ${this.assets.filter(asset => asset.tokenId === 0).map((asset, index) => html`<div class="form-check">
              <label class="form-check-label d-flex gap-3">
                <input type="radio" class="form-check-input" name="optradio" .checked=${asset.id === this.current} @click=${e => this.onChangeTitle(asset.id)}/>
                <div class="flex-column ml-2">
                  <div class="text-start"><b>Option ${index + 1}</b></div>
                  <div class="text-start">${asset.name}</div>
                </div>
              </label>
            </div>`)
      }
            ${this.loaded ? (this.assets.filter(asset => asset.tokenId === 0).length > 0 ? (!!this.currentId ? html`<button type="button" class="btn btn-success" @click=${e => this.onContinue()}>Continue</button>` : html`<button type="button" class="btn btn-success" disabled @click=${e => this.onContinue()}>Continue</button>`) : html`<h3>You have got no asset to tokenize</h3><a href="/assetregister"><button type="button" class="btn btn-success">Register Asset</button></a>`) : html``
      }
            </div>
            </div>
        </div>`
  }

  createRenderRoot() {
    return this;
  }
}

customElements.define('title-panel', Title);