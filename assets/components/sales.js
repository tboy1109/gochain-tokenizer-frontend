import { html, LitElement } from 'https://cdn.jsdelivr.net/npm/lit@^2/+esm' // 'https://cdn.skypack.dev/lit'
import 'https://cdn.jsdelivr.net/npm/@material/mwc-button@^0.25.0/+esm'
import { connect } from 'https://cdn.jsdelivr.net/npm/pwa-helpers@0/+esm'
import BigNumber from 'https://cdn.jsdelivr.net/npm/bignumber.js@9/+esm'
import titleABI from '../constants/abi/titleToken.js'
import { titleContractAddress } from '../constants/index.js'
import axios from 'https://cdn.jsdelivr.net/npm/axios@^0.26.0/+esm'
import Promise from 'https://cdn.jsdelivr.net/npm/bluebird@^3.7.2/+esm'
import { endAction, startAction } from '../actions/index.js'
import { store } from '../redux/store.js'

let web3, titleContract;

export class Sales extends connect(store)(LitElement) {
  static get properties() {
    return {
      walletAddress: { type: String },
      titleTokens: { type: Array },
      destination: { type: String },
      amount: { type: String },
      assets: { type: Array },
      max: { type: String },
      tokenId: { type: Number }
    }
  }

  constructor() {
    super();
    this.walletAddress = localStorage.getItem('wallet') || ''
    this.titleTokens = []
    this.destination = ''
    this.amount = 0
    this.assets = [
      {
        image: '/assets/images/download.jfif',
        assetName: 'First Asset',
        assetToken: 'FA',
        amount: 100,
        seller: '0x1576E561F2636e090cb855277eBA6bc89FB5CAC7'
      },
      {
        image: '/assets/images/download.jfif',
        assetName: 'First Asset',
        assetToken: 'FA',
        amount: 100,
        seller: '0x1576E561F2636e090cb855277eBA6bc89FB5CAC7'
      },
      {
        image: '/assets/images/download.jfif',
        assetName: 'First Asset',
        assetToken: 'FA',
        amount: 100,
        seller: '0x1576E561F2636e090cb855277eBA6bc89FB5CAC7'
      },
      {
        image: '/assets/images/download.jfif',
        assetName: 'First Asset',
        assetToken: 'FA',
        amount: 100,
        seller: '0x1576E561F2636e090cb855277eBA6bc89FB5CAC7'
      }
    ]
    // this.init()
  }

  init = async () => {
    store.dispatch(startAction())
    if (!window.ethereum) {
      web3 = new Web3(rpcURL)
    } else {
      web3 = new Web3(Web3.givenProvider)
    }
    titleContract = new web3.eth.Contract(titleABI, titleContractAddress)
    const blncRes = await titleContract.methods.getTokenBalances(this.walletAddress).call()
    const tokenIds = blncRes[0]
    const balances = blncRes[1]
    let assets = []
    await Promise.all(tokenIds.map(async (tokenId, index) => {
      const tokenURI = await titleContract.methods.tokenURI(tokenId).call()
      const assetTokenName = await titleContract.methods.getSymbol(tokenId).call()
      const totalAssets = await titleContract.methods.getTotalSupply(tokenId).call()
      const decimals = await titleContract.methods.getDecimal(tokenId).call()
      let { data } = await axios.get(tokenURI)
      assets.push({
        ...data, tokenId, balance: BigNumber(balances[index]).dividedBy(BigNumber('10').exponentiatedBy(Number(decimals))).toString(), assetToken: assetTokenName, totalAssets: BigNumber(totalAssets).dividedBy(BigNumber('10').exponentiatedBy(Number(decimals))).toString()
      })
    }))
    this.assets = [...assets]
    store.dispatch(endAction())
  }

  transfer = async () => {
    store.dispatch(startAction())
    const decimals = await titleContract.methods.getDecimal(this.tokenId).call()
    const amount = BigNumber(this.amount).multipliedBy(BigNumber('10').exponentiatedBy(Number(decimals))).toString()
    try {
      await titleContract.methods.transferAsset(this.tokenId, this.destination, amount).send({
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
            <h1 class="fw-bold width-auto mb-5">Live Sales</h1>
            <div class="table-responsive-sm">
              <table class="table table-borderless">
                <thead>
                  <tr>
                    <th></th>
                    <th>Name</th>
                    <th>Token</th>
                    <th>Amount</th>
                    <th>Seller</th>
                  </tr>
                </thead>
                <tbody>
                  ${this.assets.map(asset => html`<tr>
                    <td style="height:70px;"><img class="card-img-top h-100" src=${asset.image} alt="Card image" style="object-fit:contain;width:auto"/></td>
                    <td style="height:70px"><div class="full-height d-flex justify-content-center align-items-center">${asset.assetName}</div></td>
                    <td style="height:70px"><div class="full-height d-flex justify-content-center align-items-center"><span class="badge bg-primary">${asset.assetToken}</span></div></td>
                    <td style="height:70px"><div class="full-height d-flex justify-content-center align-items-center"><div>${asset.amount}</div></div></td>
                    <td style="height:70px"><div class="full-height d-flex justify-content-center align-items-center"><div>${asset.seller.substr(0, 6)}...${asset.seller.substr(asset.seller.length - 4, 4)}</div></div></td>
                    <td style="height:70px"><div class="full-height d-flex justify-content-center align-items-center"><button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#transfer-modal" @click=${e => {

      }}> <b>Buy</b></button></td>
                  </tr>`)
      }
                </tbody>
              </table>
            </div>
            <div class="modal" id="transfer-modal">
                <div class="vertical-alignment-helper">
                    <div class="modal-dialog modal-sm vertical-align-center">
                        <div class="modal-content">

                        <div class="modal-header border-none">
                            <h4 class="modal-title">Transfer</h4>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>

                        <div class="modal-body" style="border-radius:12px;border:1px solid #dee6f1;margin:15px;">
                            <div class="mb-3 justify-content-start">
                              <div class="row">
                                <label for="amount" class="form-label text-start">Amount:</label>
                              </div>
                              <input type="number" class="form-control" id="amount" placeholder="Enter amount" name="amount" .value=${this.amount} @input=${e => this.amount = e.target.value}>
                            </div>
                        </div>

                        <div class="modal-footer border-none">
                            ${!!this.destination && this.destination !== this.walletAddress && BigNumber(this.max).isGreaterThan(BigNumber(this.amount)) && BigNumber(this.amount).isGreaterThan(BigNumber('0')) ? html`<button type="button" class="btn btn-primary full-width" data-bs-dismiss="transfer-modal" @click=${e => this.transfer()}><b>Buy</b></button>` : html`<button type="button" class="btn btn-primary full-width" data-bs-dismiss="transfer-modal" disabled><b>Buy</b></button>`
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

customElements.define('sales-panel', Sales)