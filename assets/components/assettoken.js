import { html, css, LitElement } from 'https://cdn.jsdelivr.net/npm/lit@^2/+esm' // 'https://cdn.skypack.dev/lit'
import 'https://cdn.jsdelivr.net/npm/@material/mwc-button@^0.25.0/+esm';
import { connect } from 'https://cdn.jsdelivr.net/npm/pwa-helpers@0/+esm'
import axios from 'https://cdn.jsdelivr.net/npm/axios@^0.26.0/+esm'
import Promise from 'https://cdn.jsdelivr.net/npm/bluebird@^3.7.2/+esm'
import { auth, onAuthStateChanged } from '/assets/js/firebase.js'
// import assetTokenABI from '../constants/abi/assetToken.js'
// import assetTokenBytecode from '../constants/bytecode/assetToken.js'
import { titleContractAddress } from '../constants/index.js'
import titleABI from '../constants/abi/titleToken.js'
import { getAssets } from '../js/api.js'
import { endAction, startAction } from '../actions/index.js'
import { store } from '../redux/store.js'

let web3, titleContract;

export class AssetToken extends connect(store)(LitElement) {
  static get properties() {
    return {
      walletAddress: { type: String },
      titleTokens: { type: Array },
      assets: { type: Array },
      name: { type: String },
      symbol: { type: String },
      totalSupply: { type: String },
      decimals: { type: String },
      backingToken: { type: String },
      tokenStructure: { type: String },
      titleToken: { type: String },
      offeringAmount: { type: String },
      offeringDescription: { type: String },
      launchDate: { type: String },
      initialPrice: { type: String },
      marketCap: { type: String },
      tokenPrice: { type: String }
    }
  }

  constructor() {
    super();
    this.walletAddress = localStorage.getItem('wallet') || ''
    this.titleTokens = []
    this.assets = []
    this.name = ''
    this.symbol = ''
    this.totalSupply = '0'
    this.decimals = '0'
    this.backingToken = ''
    this.tokenStructure = ''
    this.titleToken = ''
    this.offeringAmount = ''
    this.offeringDescription = ''
    this.initialPrice = '0'
    this.marketCap = '0'
    this.tokenPrice = '0'
  }

  async connectedCallback() {
    super.connectedCallback();
    this.init();
  }

  init = async () => {
    onAuthStateChanged(auth, async (user) => {
      console.log("STATE CHANGED in investments:", user)
      store.dispatch(startAction())
      if (user) {
        // this.signedIn = true
        const { assets } = await getAssets(user.uid);
        this.assets = assets
        console.log('assets:', this.assets)
        if (!window.ethereum) {
          web3 = new Web3(rpcURL)
        } else {
          web3 = new Web3(Web3.givenProvider)
        }
        titleContract = new web3.eth.Contract(titleABI, titleContractAddress)
        console.log('getting balanace:', this.walletAddress)
        const blnc = Number(await titleContract.methods.balanceOf(this.walletAddress).call())
        let indexes = []
        for (let i = 0; i < blnc; ++i) {
          indexes.push(i)
        }
        let values = []
        await Promise.all(indexes.map(async index => {
          const tokenId = await titleContract.methods.tokenOfOwnerByIndex(this.walletAddress, index).call()
          const tokenURI = await titleContract.methods.tokenURI(tokenId).call()
          let { data } = await axios.get(tokenURI)
          try {
            const assetTokenName = await titleContract.methods.getName(tokenId).call()
            data = { ...data, assetToken: assetTokenName }
            console.log('assettoken:', assetTokenContractAddr, assetTokenName)
          } catch (err) {
            console.log('error getting Asset Token:', err, tokenId)
          }
          values.push({ ...data, tokenId })
          this.titleTokens = [...values]
        }))
        console.log('titletokens:', this.titleTokens)
      } else {
        // this.signedIn = false
      }
      store.dispatch(endAction())
    });
  }

  fetchData() {
    onAuthStateChanged(auth, async (user) => {
      console.log("STATE CHANGED in register asset:", user)
      if (user) {
        this.user = user
      } else {
        // this.signedIn = false
      }
    });
  }

  register = async () => {
    try {
      store.dispatch(startAction())
      // const result = await new web3.eth.Contract(assetTokenABI)
      //   .deploy({ data: assetTokenBytecode, arguments: [this.name, this.symbol, this.totalSupply, this.decimals, titleContractAddress, this.titleToken] })
      //   .send({ from: this.walletAddress })
      // console.log('deploy result:', result._address)
      await titleContract.methods.createAsset(this.titleToken, this.totalSupply, this.name, this.symbol, this.decimals, this.tokenPrice).send({ from: this.walletAddress }).on('confirmation', (confirmationNumber, receipt) => {
        store.dispatch(endAction())
        window.location.href = '/admin'
      })
    } catch (err) {
      console.log('deploying error:', err)
      store.dispatch(endAction())
    }
  }

  changeTitleToken = newToken => {
    this.titleToken = newToken
  }

  changeBackingToken = newToken => {
    const asset = this.assets.find(asset => asset.id === newToken)
    this.totalSupply = asset.valuation / asset.sharePrice
    this.initialPrice = asset.sharePrice
    this.tokenPrice = asset.sharePrice
    this.marketCap = asset.valuation
  }

  render() {
    return html`<div class="container px-4 py-5 my-5 text-start">
            <h1 class="fw-bold width-auto mb-5 text-center">Create Asset Token</h1>
            <div class="row justify-content-center">
              <div class="col-xl-6 col-lg-6 col-md-8 col-sm-10 col-12">
                <div class="form-floating mb-3 mt-3">
                  <input type="text" class="form-control" id="tokenname" placeholder="Enter token name" name="tokenname" .value=${this.name} @input=${e => this.name = e.target.value}>
                  <label for="tokenname">Token Name</label>
                </div>
                <div class="form-floating mb-3 mt-3">
                  <input type="text" class="form-control" id="tokensymbol" placeholder="Enter token symbol" name="tokensymbol" .value=${this.symbol} @input=${e => this.symbol = e.target.value}>
                  <label for="tokensymbol">Token Symbol</label>
                </div>
                <div class="form-floating mb-3 mt-3">
                  <input type="number" class="form-control" id="tokensupply" placeholder="Enter token supply" name="tokensupply" disabled .value=${this.totalSupply} @input=${e => this.totalSupply = e.target.value}>
                  <label for="tokensupply">Token Supply</label>
                </div>
                <div class="form-floating mb-3 mt-3">
                  <input type="number" class="form-control" id="decimals" placeholder="Enter token decimal units" name="decimals" .value=${this.decimals} @input=${e => this.decimals = e.target.value}>
                  <label for="decimals">Token Decimal Units</label>
                </div>
                <div class="form-floating mb-3 mt-3">
                  <select class="form-select" id="backingToken" name="sellist" .value=${this.backingToken} @input=${e => this.changeBackingToken(e.target.value)}>
                  <option value="">---Select a Backing Token---</option>
                  ${this.assets.map(asset => html`<option value=${asset.id}>${asset.name}</option>`)}
                  </select>
                  <label for="backingToken" class="form-label">Select Asset Backing Token</label>
                </div>
                <div class="form-floating mb-3 mt-3">
                  <select class="form-select" id="structure" name="sellist" .value=${this.tokenStructure} @input=${e => this.tokenStructure = e.target.value}>
                    <option>Debt</option>
                    <option>Equity</option>
                  </select>
                  <label for="structure" class="form-label">Select Token Structure</label>
                </div>
                <div class="form-floating mb-3 mt-3">
                  <select class="form-select" id="titleToken" name="sellist" .value=${this.titleToken} @input=${e => this.changeTitleToken(e.target.value)}>
                    <option value="">---Select a Title Token---</option>
                  ${this.titleTokens.filter(titleToken => !titleToken.assetToken).map(titleToken => html`<option value=${titleToken.tokenId}>${titleToken.name}</option>`)
      }
                  </select>
                  <label for="titleToken" class="form-label">Select Title Token</label>
                </div>
                <!--
                <div class="form-floating mb-3 mt-3">
                  <input type="number" class="form-control" id="offering" placeholder="Enter offering amount" name="offering" .value=${this.offeringAmount} @input=${e => this.offeringAmount = e.target.value}>
                  <label for="offering">Offering Amount</label>
                </div>
                <div class="form-floating mb-3 mt-3">
                  <input type="text" class="form-control" id="offeringDescription" placeholder="Enter offering description" name="offeringDescription" .value=${this.offeringDescription} @input=${e => this.offeringDescription = e.target.value}>
                  <label for="offeringDescription">Offering Description</label>
                </div>
                <div class="form-floating mb-3 mt-3">
                  <input type="date" class="form-control" id="launchdate" placeholder="Enter launch date" name="launchdate" .value=${this.launchDate} @input=${e => this.launchDate = e.target.value}>
                  <label for="launchdate">Launch Date</label>
                </div>
                -->
                <div class="form-floating mb-3 mt-3">
                  <input type="number" class="form-control" id="initialPrice" placeholder="Enter initial price" name="initialPrice" disabled .value=${this.initialPrice} @input=${e => this.initialPrice = e.target.value}>
                  <label for="initialPrice">Initial Price</label>
                </div>
                <div class="form-floating mb-3 mt-3">
                  <input type="number" class="form-control" id="marketCap" placeholder="Enter market cap" name="marketCap" disabled .value=${this.marketCap} @input=${e => this.marketCap = e.target.value}>
                  <label for="marketCap">Market Cap</label>
                </div>
                <div class="form-floating mb-3 mt-3">
                  <input type="number" class="form-control" id="tokenPrice" placeholder="Enter token price" name="tokenPrice" disabled .value=${this.tokenPrice} @input=${e => this.tokenPrice = e.target.value}>
                  <label for="tokenPrice">Token Price</label>
                </div>
                <div class="form-floating mb-3 mt-3 d-grid">
                  <button type="button" class="btn btn-primary btn-block" @click=${e => this.register()}>Register</button>
                </div>
              </div>
            </div>
        </div>
        `
  }

  createRenderRoot() {
    return this;
  }
}

customElements.define('asset-token', AssetToken);