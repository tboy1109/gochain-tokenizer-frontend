import { html, css, LitElement } from 'https://cdn.jsdelivr.net/npm/lit@^2/+esm' // 'https://cdn.skypack.dev/lit'
import 'https://cdn.jsdelivr.net/npm/@material/mwc-button@^0.25.0/+esm'
import BigNumber from 'https://cdn.jsdelivr.net/npm/bignumber.js@9/+esm'
// import MultiChart from 'https://cdn.jsdelivr.net/npm/multi-chart@^2.2.1/+esm'
import { auth, onAuthStateChanged } from '/assets/js/firebase.js'
import { getAsset } from '../js/api.js';
import { endAction, startAction } from '../actions/index.js'
import { store } from '../redux/store.js'
import { titleContractAddress } from '../constants/index.js'
import { getOrganization } from '../js/api.js';
import titleABI from '../constants/abi/titleToken.js'

let web3, titleContract;

export class AssetInfo extends LitElement {
  static get properties() {
    return {
      name: { type: String },
      id: { type: String },
      imgUrl: { type: String },
      location: { type: String },
      creator: { type: String },
      description: { type: String },
      category: { type: String },
      equity: { type: Number },
      map: { type: String },
      owner: { type: String },
      seeking: { type: Number },
      sharePrice: { type: Number },
      valuation: { type: Number },
      tokenId: { type: Number },
      distributionUsers: { type: Array },
      distributionAmounts: { type: Array },
      hasAsset: { type: Boolean },
      decimals: { type: Number },
      totalSupply: { type: String },
      balance: { type: String },
      organization: { type: Object },
      fieldNames: { type: Array },
      values: { type: Array },
      titleOwner: { type: String },
      wallet: { type: String },
      amount: { type: Number },
      price: { type: Number }
    }
  }

  constructor() {
    super();
    this.distributionUsers = []
    this.distributionAmounts = []
    this.fieldNames = []
    this.values = []
    this.wallet = localStorage.getItem('wallet')
    this.totalSupply = ''
    this.balance = 0
    this.fetchData()
  }

  fetchData() {
    onAuthStateChanged(auth, async (user) => {
      console.log("STATE CHANGED in investments:", user)
      console.log("getting asset:", assetId)
      store.dispatch(startAction())
      try {
        if (user) {
          const { asset } = await getAsset(assetId)
          this.name = asset.name
          this.id = asset.id
          this.imgUrl = asset.imgUrl
          this.location = asset.location
          this.creator = asset.creator
          this.description = asset.description
          this.equity = asset.equity
          this.map = asset.map
          this.category = asset.category
          this.owner = asset.owner
          this.seeking = asset.seeking
          this.sharePrice = asset.sharePrice
          this.valuation = asset.valuation
          this.tokenId = asset.tokenId
          if (!!asset.fieldNames) {
            this.fieldNames = [...asset.fieldNames]
          }
          if (!!asset.values) {
            this.values = [...asset.values]
          }
          if (!!asset.map) {
            var map;
            var src = asset.map;

            map = new google.maps.Map(document.getElementById('map'), {
              center: new google.maps.LatLng(-19.257753, 146.823688),
              zoom: 2,
              mapTypeId: 'terrain'
            });

            var kmlLayer = new google.maps.KmlLayer(src, {
              suppressInfoWindows: true,
              preserveViewport: false,
              map: map
            });
            kmlLayer.addListener('click', function (event) {
              var content = event.featureData.infoWindowHtml;
              var testimonial = document.getElementById('capture');
              testimonial.innerHTML = content;
            });
          }
          if (!!this.owner) {
            console.log('getting org:', this.owner)
            this.organization = (await getOrganization(this.owner)).organization
            console.log('organization:', this.organization)
          }
          if (!window.ethereum) {
            web3 = new Web3(rpcURL)
          } else {
            web3 = new Web3(Web3.givenProvider)
          }
          console.log('tokenId:', this.tokenId)
          if (this.tokenId > 0) {
            titleContract = new web3.eth.Contract(titleABI, titleContractAddress)
            try {
              this.decimals = Number(await titleContract.methods.getDecimal(this.tokenId).call())
              this.titleOwner = await titleContract.methods.ownerOf(this.tokenId).call()
              this.totalSupply = BigNumber(await titleContract.methods.getTotalSupply(this.tokenId).call()).dividedBy(BigNumber(10).exponentiatedBy(this.decimals)).toString()
              this.balance = BigNumber(await titleContract.methods.getTokenBalance(this.tokenId, this.wallet).call()).dividedBy(BigNumber(10).exponentiatedBy(this.decimals)).toString()
              console.log('decimal:', this.decimals)
              const res = await titleContract.methods.getAssetDistribution(this.tokenId).call()
              console.log('distribution res:', res)
              this.distributionUsers = [...res[0]]
              // this.distributionAmounts = [...res[1]]
              // this.hasAsset = true
              // console.log('distribution:', res)
            } catch (err) {
              console.log("error:", err)
            }
          }
        }
      } catch (err) {
        console.log('error:', err)
      }
      store.dispatch(endAction())
    });
  }

  createSale = () => {
    console.log('creating sale:', this.price, this.amount)
  }

  async connectedCallback() {
    super.connectedCallback();
  }

  render() {
    console.log('custom fields:', this.fieldNames, this.values)
    return html`<div class="container my-5 text-center justify-content-start">
            <div class="flex-column justify-content-center">
                    <h1 class="fw-bold width-auto mb-5">${this.name}</h1>
                    <img src=${this.imgUrl} style="width:500px;height:auto;"/>
                    <div class="row">
                        <div class="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 mt-5 p-3">
                            ${this.description}
                            <div class="row justify-content-center mt-5">
                              <div class="d-flex flex-column col-4 mt-4 justify-content-center text-center">
                                <div class="mb-2"><b>${this.equity}%</b></div>
                                <div>Equity</div>
                              </div>
                              <div class="d-flex flex-column col-4 mt-4 justify-content-center text-center">
                                <div class="mb-2"><b>${this.seeking} USD</b></div>
                                <div>Seeking</div>
                              </div>
                              <div class="d-flex flex-column col-4 mt-4 justify-content-center text-center">
                                <div class="mb-2"><b>${this.location}</b></div>
                                <div>Location</div>
                              </div>
                              <div class="d-flex flex-column col-4 mt-4 justify-content-center text-center">
                                <div class="mb-2"><b>${this.category}</b></div>
                                <div>Category</div>
                              </div>
                              <div class="d-flex flex-column col-4 mt-4 justify-content-center text-center">
                                <div class="mb-2"><b>${this.valuation} USD</b></div>
                                <div>Valuation</div>
                              </div>
                              <div class="d-flex flex-column col-4 mt-4 justify-content-center text-center">
                                <div class="mb-2"><b>${this.sharePrice} USD</b></div>
                                <div>Share Price</div>
                              </div>
                              ${!!this.totalSupply ? html`<div class="d-flex flex-column col-4 mt-4 justify-content-center text-center">
                                <div class="mb-2"><b>${this.totalSupply}</b></div>
                                <div>Total Supply</div>
                              </div>` : html``
      }
                              ${!!this.balance ? html`<div class="d-flex flex-column col-4 mt-4 justify-content-center text-center">
                                <div class="mb-2"><b>${this.balance}</b></div>
                                <div>Shares Owned</div>
                              </div>` : html``
      }
                              ${this.fieldNames.map((fieldName, index) => html`<div class="d-flex flex-column col-4 mt-4 justify-content-center text-center">
                                  <div class="mb-2"><b>${this.values[index]}</b></div>
                                  <div>${fieldName}</div>
                                </div>`)}
                            </div>
                            ${this.tokenId === 0 ? html`<div class="row mt-3">
                              <a href="/tokenize"><button type="button" class="btn btn-success">Tokenize</button></a>
                            </div>` : (this.hasAsset ? html`<h3 class="mt-4">Token Amounts</h3><table class="table table-borderless">
                              <thead>
                                <tr>
                                  <th>User</th>
                                  <th>Share Amount</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${this.distributionUsers.map((user, index) => html`<tr>
                                    <td>${user}</td>
                                    <td>${BigNumber(this.distributionAmounts[index]).dividedBy(BigNumber('10').exponentiatedBy(this.decimals)).toString()}</td>
                                  </tr>`)}
                              </tbody>
                            </table>`: html`<div class="row mt-3">
                            ${this.titleOwner === this.wallet ? html`<a href="/assettoken"><button type="button" class="btn btn-success">Create Asset Token</button></a>` : html``}
                            </div>`)}
                            ${this.balance > 0 ? html`<button type="button" class="btn btn-success">Create Sale</button>` : ''
      }
                        </div>
                        <div class="col-12 col-sm-12 col-md-6 col-lg-6 col-xl-6 mt-2 p-3" style="height:auto;">
                            <h2 class="mb-3">${this.organization?.name}</h2>
                            <img src=${this.organization?.logo} style="width:500px;max-width:100%;height:auto;"/>
                            <div id="map"></div>
                            <div id="capture"></div>
                            <iframe class="mt-3" src="https://www.google.com/maps/d/u/0/embed?mid=1p1rjfMufBYXYPCJwNMsDGarcYOJxscQN&ehbc=2E312F" style="width:100%;height:500px;"></iframe>
                        </div>
                    </div>
                </div>
                <div class="modal" id="sale-modal">
                    <div class="vertical-alignment-helper">
                        <div class="modal-dialog modal-sm vertical-align-center">
                            <div class="modal-content">

                            <div class="modal-header border-none">
                                <h4 class="modal-title">Create Sale</h4>
                                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                            </div>

                            <div class="modal-body" style="border-radius:12px;border:1px solid #dee6f1;margin:15px;">
                                <div class="mb-3 mt-3 justify-content-start">
                                  <div class="row">
                                    <label for="price" class="form-label text-start">Price:</label>
                                  </div>
                                  <input type="number" class="form-control" id="price" placeholder="Enter price" name="price" .value=${this.price} @input=${e => this.price = e.target.value}>
                                </div>
                                <div class="mb-3 justify-content-start">
                                  <div class="row">
                                    <label for="amount" class="form-label text-start">Amount:</label>
                                  </div>
                                  <input type="number" class="form-control" id="amount" placeholder="Enter amount" name="amount" .value=${this.amount} @input=${e => this.amount = e.target.value}>
                                </div>
                            </div>

                            <div class="modal-footer border-none">
                                ${BigNumber(this.price).isGreaterThan(BigNumber(0)) && BigNumber(this.amount).isGreaterThan(BigNumber(0)) ? html`<button type="button" class="btn btn-primary full-width" data-bs-dismiss="sale-modal" @click=${e => this.createSale()}><b>Create Sale</b></button>` : html`<button type="button" class="btn btn-primary full-width" data-bs-dismiss="sale-modal" disabled><b>Create Sale</b></button>`
      }
                                
                            </div>
                        </div>
                    </div>
                </div>
        </div>`
  }

  createRenderRoot() {
    return this;
  }
}

customElements.define('asset-info', AssetInfo);