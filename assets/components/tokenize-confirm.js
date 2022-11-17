import { html, css, LitElement } from 'https://cdn.jsdelivr.net/npm/lit@^2/+esm' // 'https://cdn.skypack.dev/lit'
import 'https://cdn.jsdelivr.net/npm/@material/mwc-button@^0.25.0/+esm'
import { connect } from 'https://cdn.jsdelivr.net/npm/pwa-helpers@0/+esm'
import { auth, onAuthStateChanged } from '/assets/js/firebase.js'
import { tokenize, getAssets, completeTokenize } from '../js/api.js'
import titleABI from '../constants/abi/titleToken.js'
import { titleContractAddress } from '../constants/index.js'
import { endAction, startAction } from '../actions/index.js'
import { store } from '../redux/store.js'

let web3, titleContract;

export class TokenizeConfirm extends connect(store)(LitElement) {
  static get properties() {
    return {
      walletAddress: { type: String },
      currentTitle: { type: String },
      currentTitleName: { type: String },
      target: { type: String }
    }
  }

  constructor() {
    super();
    this.walletAddress = localStorage.getItem('wallet') || ''
    this.currentTitle = localStorage.getItem('currentTitle') || ''
    this.currentTitleName = localStorage.getItem('currentTitleName') || ''
    this.target = localStorage.getItem('target')
    this.init()
  }

  init = async () => {
    if (!window.ethereum) {
      web3 = new Web3(rpcURL)
    } else {
      web3 = new Web3(Web3.givenProvider)
    }
    titleContract = new web3.eth.Contract(titleABI, titleContractAddress)
    const totalMinted = await titleContract.methods.totalMinted().call()
    console.log('total Minted:', totalMinted)
  }

  async connectedCallback() {
    super.connectedCallback();
    this.fetchData();
  }

  fetchData() {
    onAuthStateChanged(auth, async (user) => {
      console.log("STATE CHANGED in register asset:", user)
      if (user) {
        // this.signedIn = true-
        const assets = await getAssets(user.uid);
        console.log('asssets:', assets)
        this.user = user
      } else {
        // this.signedIn = false
      }
    });
  }

  mint = async () => {
    try {
      store.dispatch(startAction())
      const { metadataURL } = await tokenize(this.currentTitle, this.target)
      let curBlnc = await titleContract.methods.balanceOf(this.target).call()
      console.log('curbalance:', curBlnc)
      try {
        await titleContract.methods.mint(metadataURL, this.target).send({
          from: this.walletAddress
        }).on('confirmation', async (confirmationNumber, receipt) => {
          curBlnc = await titleContract.methods.balanceOf(this.target).call()
          const tokenId = await titleContract.methods.tokenOfOwnerByIndex(this.target, Number(curBlnc) - 1).call()
          localStorage.setItem('curTokenId', tokenId)
          console.log('result:', metadataURL)
          await completeTokenize(this.currentTitle, parseInt(tokenId))
          window.location.href = '/token-issued'
        })
      } catch (err) {
        console.log('mint transaction error:', err)
      }
    } catch (err) {
      console.log('error:', err)
    }
    store.dispatch(endAction())
  }

  render() {
    return html`<div class="container px-4 py-5 my-5 text-center justify-content-start">
            <h1 class="fw-bold width-auto mb-5">Check your answers before submitting your application</h1>
            <table class="table">
              <tbody>
                <tr>
                  <td><b>Title Name</b></td>
                  <td>${this.currentTitleName}</td>
                  <td><a href="/title" class="text-decoration-none">Change</a></td>
                </tr>
                <tr>
                  <td><b>Wallet Address</b></td>
                  <td>${this.target}</td>
                  <td><a href="/wallet" class="text-decoration-none">Change</a></td>
                </tr>
              </tbody>
            </table>
            <button type="button" class="btn btn-success" @click=${e => this.mint()}>Accept and send</button>
        </div>
        ${this.loading ? html`
              <div class="loading">
                <img src="/assets/images/loading1.gif" style="opacity:1;"/>
              </div>
            ` : html``
      }
        `
  }

  createRenderRoot() {
    return this;
  }
}

customElements.define('tokenize-confirm', TokenizeConfirm);