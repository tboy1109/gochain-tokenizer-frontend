import { html, css, LitElement } from 'https://cdn.jsdelivr.net/npm/lit@2/+esm'
// import 'https://cdn.jsdelivr.net/npm/@material/mwc-button@0/+esm'
import { auth, onAuthStateChanged } from '/assets/js/firebase.js'
import { connect } from 'https://cdn.jsdelivr.net/npm/pwa-helpers@0/+esm'
import { store } from '../redux/store.js'
import { changeWallet, showToast } from '../actions/index.js'
import { chainConfig } from '../constants/index.js'

let web3, provider

export class ConnectWallet extends connect(store)(LitElement) {
  static get properties() {
    return {
      // inputs:
      userID: { type: String },
      symbol: { type: String },

      // internal:
      signedIn: { type: Boolean },
      balance: { type: Object },
      fetching: { type: Boolean },
      error: { type: Object },
      walletAddress: { type: String }
    }
  }

  async stateChanged(state) {
    const { walletAddress } = state.common
    if (!!walletAddress && !this.walletAddress) {
      this.walletAddress = walletAddress;
      localStorage.setItem('wallet', walletAddress)
      /*
      console.log('adding tokenlist')
      const wasAdded = await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20', // Initially only supports ERC20, but eventually more!
          options: {
            address: titleContractAddress, // The address that the token is at.
            symbol: 'TT', // A ticker symbol or shorthand, up to 5 chars.
            decimals: 0, // The number of decimals in the token
          },
        },
      });
      if (wasAdded) {
        console.log('Thanks for your interest!');
      } else {
        console.log('Your loss!');
      }
      */
    }
  }

  constructor() {
    super();
    this.userID = '';
    this.symbol = '';
    this.walletAddress = ''

    this.balance = {};

    this.fetching = false;
    this.error = null;
    this.signedIn = false;
    if (!Web3.givenProvider) {
      return
    }
    provider = Web3.givenProvider
    web3 = new Web3(provider)
    provider.on('accountsChanged', (code, reason) => {
      if (!!this.walletAddress && window.location.pathname !== '/login') {
        console.log("accountchanged:", code)
        this.walletAddress = ''
        localStorage.removeItem('wallet')
        window.location = '/investments'
      }
    })
    web3.eth.net.getId().then(chainId => {
      window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [chainConfig],
      }).then(() => {
        if (chainId != chainConfig.chainId) {
          window.location.reload()
        }
        window.ethereum.request({ method: 'eth_requestAccounts' }).then(res => {
          if (!window.ethereum) {
            web3 = new Web3(rpcURL)
          } else {
            web3 = new Web3(Web3.givenProvider)
          }
          const wallet = localStorage.getItem('wallet')
          if (!!wallet) {
            store.dispatch(changeWallet(wallet));
          } else if (window.location.pathname != '/investments' && window.location.pathname != '/login') {
            window.location = '/investments'
          }
        })
      })
    })
  }

  connectedCallback() {
    super.connectedCallback();
    // this.fetchData();
  }

  fetchData() {
    onAuthStateChanged(auth, (user) => {
      console.log("STATE CHANGED in button:", user)
      if (user) {
        this.signedIn = true
      } else {
        this.signedIn = false
      }
    });
  }

  render() {
    /*
    if (this.error) {
        return html`Error: ${this.error}`;
    }
    if (this.fetching) {
        return html`<mwc-linear-progress indeterminate></mwc-linear-progress>`;
    }
    if (this.signedIn) {
        return html`<mwc-button outlined @click=${this.signOut}>Sign out</mwc-button>`
    }
    */
    return html`
        <mwc-button style="margin-right:10px" unelevated @click=${this.connect}>${!!this.walletAddress ? `${this.walletAddress.substr(0, 6)}...${this.walletAddress.substr(this.walletAddress.length - 4, 4)}` : 'Connect'}</mwc-button>
        `
  }

  async connect() {
    if (this.walletAddress) {
      localStorage.removeItem('wallet')
      store.dispatch(changeWallet(''));
    } else {
      try {
        const accounts = await web3.eth.getAccounts()
        store.dispatch(changeWallet(accounts[0]));
      } catch (err) {
        store.dispatch(showToast('Connect Wallet', 'Please Install Metamask'));
      }
    }
  }

  createRenderRoot() {
    return this;
  }
}

customElements.define('connect-wallet', ConnectWallet);