import { html, css, LitElement } from 'https://cdn.jsdelivr.net/npm/lit@^2/+esm' // 'https://cdn.skypack.dev/lit'
import 'https://cdn.jsdelivr.net/npm/@material/mwc-button@^0.25.0/+esm';
import BigNumber from 'https://cdn.jsdelivr.net/npm/bignumber.js@9/+esm'

let web3;
const oneEth = BigNumber('1000000000000000000')

export class Wallet extends LitElement {
  static get properties() {
    return {
      walletAddress: { type: String },
      balance: { type: String },
      target: { type: String }
    }
  }

  constructor() {
    super();
    this.walletAddress = localStorage.getItem('wallet') || ''
    this.balance = '0'
    this.target = localStorage.getItem('wallet') || ''
    localStorage.setItem('target', this.walletAddress)
    this.init()
  }

  async init() {
    console.log('initing wallet')
    if (!window.ethereum) {
      web3 = new Web3(rpcURL)
    } else {
      web3 = new Web3(Web3.givenProvider)
    }
    const blnc = await web3.eth.getBalance(this.walletAddress)
    this.balance = BigNumber(blnc).dividedBy(oneEth).toFixed(2);
  }

  async connectedCallback() {
    super.connectedCallback();
  }

  render() {
    return html`<div class="container px-4 py-5 my-5 text-center justify-content-start">
        <div class="row justify-content-center">
            <div class="col-12 col-sm-12 col-md-8 col-lg-6 col-xl-6">
            <h1 class="fw-bold width-auto mb-5">Digital Wallet Address</h1>
            <div class="text-center">Wallet Address</div>
            <div class="form-floating mb-3 mt-3">
              <input type="text" class="form-control" id="wallet" placeholder="Enter wallet" .value=${this.target} @input=${e => {
        this.target = e.target.value
        localStorage.setItem('target', this.target)
      }}>
              <label for="wallet">Wallet Address</label>
            </div>
            <div class="text-center">Balance</div>
            <div class="text-center mb-2"><b>${this.balance} GO</b></div>
            <a class="text-decoration-none" href="/wallet"><div class="mb-2 text-center">Not your wallet address?</div></a>
            ${!!this.target ? html`<a href="/tokenize-confirm"><button type="button" class="btn btn-success">Continue</button></a>` : html`<button type="button" class="btn btn-success" disabled>Continue</button>`
      }
            
            </div>
            </div>
        </div>`
  }

  createRenderRoot() {
    return this;
  }
}

customElements.define('wallet-panel', Wallet);