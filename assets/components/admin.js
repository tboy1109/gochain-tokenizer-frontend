import { html, LitElement } from 'https://cdn.jsdelivr.net/npm/lit@^2/+esm' // 'https://cdn.skypack.dev/lit'
import 'https://cdn.jsdelivr.net/npm/@material/mwc-button@^0.25.0/+esm'
import { connect } from 'https://cdn.jsdelivr.net/npm/pwa-helpers@0/+esm'
import BigNumber from 'https://cdn.jsdelivr.net/npm/bignumber.js@9/+esm'
import titleABI from '../constants/abi/titleToken.js'
import assetABI from '../constants/abi/assetToken.js'
import { titleContractAddress } from '../constants/index.js'
import axios from 'https://cdn.jsdelivr.net/npm/axios@^0.26.0/+esm'
import Promise from 'https://cdn.jsdelivr.net/npm/bluebird@^3.7.2/+esm'
import { endAction, startAction } from '../actions/index.js'
import { store } from '../redux/store.js'

let web3, titleContract;

export class Admin extends connect(store)(LitElement) {
  static get properties() {
    return {
      walletAddress: { type: String },
      titleTokens: { type: Array },
      currentTokenId: { type: Number },
      destination: { type: String },
      amount: { type: String },
      max: { type: String }
    }
  }

  constructor() {
    super();
    this.walletAddress = localStorage.getItem('wallet') || ''
    this.titleTokens = []
    this.destination = ''
    this.amount = 0
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
      console.log('tokneUri:', tokenURI)
      let { data } = await axios.get(tokenURI)
      console.log("data:", data)
      try {
        const assetTokenName = await titleContract.methods.getSymbol(tokenId).call()
        console.log(assetTokenName)
        const balance = await titleContract.methods.getTokenBalance(tokenId, this.walletAddress).call()
        console.log(balance)
        const decimals = await titleContract.methods.getDecimal(tokenId).call()
        console.log(decimals)
        data = { ...data, tokenId, assetToken: assetTokenName, balance: BigNumber(balance).dividedBy(BigNumber('10').exponentiatedBy(parseInt(decimals))).toString() }
      } catch (err) {
        console.log('error getting Asset Token:', err)
      }
      values.push(data)
      this.titleTokens = [...values]
    }))
    console.log('current tokens:', values)
    store.dispatch(endAction())
  }

  makeOffer = async () => {
    store.dispatch(startAction())
    const decimals = await titleContract.methods.getDecimal(this.currentTokenId).call()
    const amount = BigNumber(this.amount).multipliedBy(BigNumber('10').exponentiatedBy(Number(decimals))).toString()
    try {
      await titleContract.methods.transferAsset(this.currentTokenId, this.destination, amount).send({
        from: this.walletAddress
      }).on('confirmation', async (confirmationNumber, receipt) => {
        store.dispatch(endAction())
        window.location.href = '/myassets'
      })
    } catch (err) {
      console.log('error transferring asset token:', err)
      store.dispatch(endAction())
    }
  }

  async connectedCallback() {
    super.connectedCallback();
  }

  render() {
    return html`<div class="container px-4 py-5 my-5 text-center justify-content-start">
            <h1 class="fw-bold width-auto mb-5">Admin</h1>
            <div class="table-responsive-sm">
              <table class="table table-borderless">
                <thead>
                  <tr>
                    <th></th>
                    <th>Token</th>
                    <th>Offering</th>
                    <th>Asset Type</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.titleTokens.map(asset => html`<tr>
                    <td style="height:70px;"><img class="card-img-top h-100" src=${asset.image} alt="Card image" style="object-fit:contain;width:auto"/></td>
                    <td style="height:70px"><div class="full-height d-flex justify-content-center align-items-center">${!!asset.assetToken ? html`<span class="badge bg-primary">${asset.assetToken}</span>` : html`<a href='/assettoken'><button type="button" class="btn btn-outline-primary">Create Token</button></a>`
      }</div></td>
                    <td style="height:70px"><div class="full-height d-flex justify-content-center align-items-center">${!!asset.assetToken ? html`<button type="button" class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#offering-modal" @click=${e => {
        this.currentTokenId = asset.tokenId
        this.max = asset.balance
      }}> Create Offering</button> ` : html` <button type = "button" class= "btn btn-outline-primary" disabled> Create Offering</button>`
      }</div></td>
                    <td style="height:70px"><div class="full-height d-flex justify-content-center align-items-center"><div>${asset.attributes[5].value}</div></div></td>
                  </tr>`)
      }
                </tbody>
              </table>
            </div>
            <div class="modal" id="offering-modal">
                <div class="vertical-alignment-helper">
                    <div class="modal-dialog modal-sm vertical-align-center">
                        <div class="modal-content">

                        <div class="modal-header border-none">
                            <h4 class="modal-title">Offer</h4>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>

                        <div class="modal-body" style="border-radius:12px;border:1px solid #dee6f1;margin:15px;">
                            <div class="mb-3 mt-3 justify-content-start">
                              <div class="row">
                                <label for="destination" class="form-label text-start">Destination:</label>
                              </div>
                              <input type="destination" class="form-control" id="destination" placeholder="Enter destination" name="destination" .value=${this.destination} @input=${e => this.destination = e.target.value}>
                            </div>
                            <div class="mb-3 justify-content-start">
                              <div class="row">
                                <label for="amount" class="form-label text-start">Amount:</label>
                              </div>
                              <input type="number" class="form-control" id="amount" placeholder="Enter amount" name="amount" .value=${this.amount} @input=${e => this.amount = e.target.value}>
                            </div>
                        </div>

                        <div class="modal-footer border-none">
                            ${!!this.destination && this.destination !== this.walletAddress && BigNumber(this.max).isGreaterThan(BigNumber(this.amount)) && BigNumber(this.amount).isGreaterThan(BigNumber('0')) ? html`<button type="button" class="btn btn-primary full-width" data-bs-dismiss="offering-modal" @click=${e => this.makeOffer()}><b>Make Offer</b></button>` : html`<button type="button" class="btn btn-primary full-width" data-bs-dismiss="offering-modal" disabled><b>Make Offer</b></button>`
      }
                            
                        </div>
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

customElements.define('admin-panel', Admin)