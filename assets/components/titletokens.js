import { html, LitElement } from 'https://cdn.jsdelivr.net/npm/lit@^2/+esm' // 'https://cdn.skypack.dev/lit'
import 'https://cdn.jsdelivr.net/npm/@material/mwc-button@^0.25.0/+esm'
import { connect } from 'https://cdn.jsdelivr.net/npm/pwa-helpers@0/+esm'
import titleABI from '../constants/abi/titleToken.js'
import { titleContractAddress } from '../constants/index.js'
import axios from 'https://cdn.jsdelivr.net/npm/axios@^0.26.0/+esm'
import Promise from 'https://cdn.jsdelivr.net/npm/bluebird@^3.7.2/+esm'
import { endAction, startAction } from '../actions/index.js'
import { store } from '../redux/store.js'

let web3, titleContract;

export class TitleTokens extends connect(store)(LitElement) {
  static get properties() {
    return {
      walletAddress: { type: String },
      titleTokens: { type: Array }
    }
  }

  constructor() {
    super();
    this.walletAddress = localStorage.getItem('wallet') || ''
    this.titleTokens = []
    this.init()
  }

  init = async () => {
    store.dispatch(startAction())
    if (!window.ethereum) {
      web3 = new Web3(rpcURL)
    } else {
      web3 = new Web3(Web3.givenProvider)
    }
    titleContract = new web3.eth.Contract(titleABI, titleContractAddress)
    const blnc = Number(await titleContract.methods.balanceOf(this.walletAddress).call())
    let indexes = []
    for (let i = 0; i < blnc; ++i) {
      indexes.push(i)
    }
    let values = []
    await Promise.all(indexes.map(async index => {
      const tokenId = await titleContract.methods.tokenOfOwnerByIndex(this.walletAddress, index).call()
      const tokenURI = await titleContract.methods.tokenURI(tokenId).call()
      const { data } = await axios.get(tokenURI)
      values.push(data)
      this.titleTokens = [...values]
    }))
    console.log('titletokens:', this.titleTokens)
    store.dispatch(endAction())
  }

  async connectedCallback() {
    super.connectedCallback();
  }

  render() {
    return html`<div class="container px-4 py-5 my-5 text-center justify-content-start">
            <h1 class="fw-bold width-auto mb-5">Title Tokens</h1>
            <div class="row mt-4 justify-content-center">
              ${this.titleTokens.map(asset => html`<div class="col-xl-4 col-lg-4 col-md-6 col-sm-10 col-12 p-2">
                          <div class="card full-height">
                            <div class="mt-3" style="height:100px">
                              <img class="card-img-top h-100" src=${asset.image} alt="Card image" style="object-fit:contain;width:auto"/>
                              <div class="text-secondary" style="position:absolute;top:10px;right:10px;"><i class="fa-solid fa-heart"></i></div>
                            </div>
                            <div class="card-body text-start">
                              <b>${asset.name}</b>
                              <p class="card-text text-start text-secondary mt-2 small"><small>${asset.description}</small></p>
                              <div class="row" style="gap: 10px 0px">
                                <div class="col-xl-4 col-lg-4 col-md-6 col-sm-6 col-6">
                                  <div class="text-secondary">Equity Offered</div>
                                  <div>${asset.attributes[2].value}%</div>
                                </div>
                                <div class="col-xl-4 col-lg-4 col-md-6 col-sm-6 col-6">
                                  <div class="text-secondary">Seeking</div>
                                  <div>${asset.attributes[3].value}USD</div>
                                </div>
                                <div class="col-xl-4 col-lg-4 col-md-6 col-sm-6 col-6">
                                  <div class="text-secondary">Location</div>
                                  <div>${asset.attributes[4].value}</div>
                                </div>
                                <div class="col-xl-4 col-lg-4 col-md-6 col-sm-6 col-6">
                                  <div class="text-secondary">Category</div>
                                  <div>${asset.attributes[5].value}</div>
                                </div>
                                <div class="col-xl-4 col-lg-4 col-md-6 col-sm-6 col-6">
                                  <div class="text-secondary">Valuation</div>
                                  <div>${asset.attributes[6].value}USD</div>
                                </div>
                                <div class="col-xl-4 col-lg-4 col-md-6 col-sm-6 col-6">
                                  <div class="text-secondary">Share Price</div>
                                  <div>${asset.attributes[7].value}USD</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>`)
      }
            </div>
        </div>
        `
  }

  createRenderRoot() {
    return this;
  }
}

customElements.define('title-tokens', TitleTokens);