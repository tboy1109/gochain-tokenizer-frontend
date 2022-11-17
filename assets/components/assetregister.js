import { html, css, LitElement } from 'https://cdn.jsdelivr.net/npm/lit@^2/+esm' // 'https://cdn.skypack.dev/lit'
import 'https://cdn.jsdelivr.net/npm/@material/mwc-button@^0.25.0/+esm';
import { connect } from 'https://cdn.jsdelivr.net/npm/pwa-helpers@0/+esm'
import { auth, onAuthStateChanged } from '/assets/js/firebase.js'
import { registerAsset, getAdminOrgs, getAssets } from '../js/api.js';
import { endAction, startAction } from '../actions/index.js'
import { store } from '../redux/store.js'

export class AssetRegister extends connect(store)(LitElement) {
  static get properties() {
    return {
      name: { type: String },
      description: { type: String },
      equity: { type: Number },
      seeking: { type: Number },
      location: { type: String },
      category: { type: String },
      valuation: { type: Number },
      sharePrice: { type: Number },
      imgData: { type: String },
      map: { type: String },
      user: { type: Object },
      formData: { type: FormData },
      owner: { type: String },
      organizations: { type: Array },
      fieldNames: { type: Array },
      values: { type: Array },
      curFieldName: { type: Array }
    }
  }

  constructor() {
    super();
    this.name = '';
    this.description = '';
    this.equity = 0;
    this.seeking = 0;
    this.location = '';
    this.category = '';
    this.valuation = 0;
    this.sharePrice = 0;
    this.imgData = '';
    this.owner = '';
    this.organizations = [];
    this.fieldNames = [];
    this.values = [];
    this.curFieldName = '';
    this.formData = new FormData();
  }

  async connectedCallback() {
    super.connectedCallback();
    this.fetchData();
  }

  fetchData() {
    onAuthStateChanged(auth, async (user) => {
      console.log("STATE CHANGED in register asset:", user)
      if (user) {
        // this.signedIn = true
        // const assets = await getAssets(user.uid);
        // console.log('asssets:', assets)
        const orgs = await getAdminOrgs(user.email)
        this.organizations = [...orgs.organizations]
        this.user = user
      } else {
        // this.signedIn = false
      }
    });
  }

  onImageChange = e => {
    const file = e.target.files[0]
    if (!(file.type.startsWith('image'))) {
      alert('Not Image')
      return
    }
    this.formData.set('imgData', file)
  }

  onMapChange = e => {
    const file = e.target.files[0]
    this.formData.set('mapData', file)
  }

  register = async () => {
    this.formData.append('name', this.name)
    this.formData.append('description', this.description)
    this.formData.append('equity', this.equity)
    this.formData.append('seeking', this.seeking)
    this.formData.append('location', this.location)
    this.formData.append('category', this.category)
    this.formData.append('valuation', this.valuation)
    this.formData.append('sharePrice', this.sharePrice)
    this.formData.append('creator', this.user.uid)
    this.formData.append('owner', this.owner)
    this.fieldNames.map(fieldName => this.formData.append('fieldNames[]', fieldName))
    this.values.map(value => this.formData.append('values[]', value))
    store.dispatch(startAction())
    try {
      const res = await registerAsset(this.formData)
      console.log('result:', res)
      store.dispatch(endAction())
      if (!!this.owner) {
        window.location.href = `/organization/${this.owner}/assets`
      } else {
        window.location.href = '/investments'
      }
    } catch (err) {
      store.dispatch(endAction())
      console.log('error:', err)
    }
  }

  add = () => {
    this.fieldNames = [...this.fieldNames, this.curFieldName];
    this.values = [...this.values, ''];
    this.curFieldName = '';
  }

  remove = index => {
    this.fieldNames = [...this.fieldNames.filter((fieldName, idx) => idx !== index)]
    this.values = [...this.values.filter((value, idx) => idx !== index)]
  }

  render() {
    return html`<div class="container px-4 py-5 my-5 text-start">
            <h1 class="fw-bold width-auto mb-5 text-center">Register Asset</h1>
            <div class="row justify-content-center">
              <div class="col-xl-6 col-lg-6 col-md-8 col-sm-10 col-12">
                <div class="form-floating mb-3 mt-3">
                  <input type="text" class="form-control" id="name" placeholder="Enter name" name="name" .value=${this.name} @input=${e => this.name = e.target.value}>
                  <label for="name">Name</label>
                </div>
                <div class="form-group mb-3 mt-3" style="display:flex;flex-direction:row;align-items:center">
                  <i class="fa-regular fa-image" style="margin-right:10px"></i>
                  <input type="file" class="form-control" accept="image/*" id="image" placeholder="Select Image" name="image" @input=${this.onImageChange}>
                </div>
                <div class="form-group mb-3 mt-3" style="display:flex;flex-direction:row;align-items:center">
                  <i class="fa-solid fa-map-location-dot" style="margin-right:10px"></i>
                  <input type="file" class="form-control" accept=".kmz,.kml" id="map" placeholder="Select Map" name="map" @input=${this.onMapChange}>
                </div>
                <div class="form-floating mb-3 mt-3">
                  <textarea type="text" class="form-control" id="description" placeholder="Enter description" name="description" .value=${this.description} @input=${e => this.description = e.target.value}></textarea>
                  <label for="description">Description</label>
                </div>
                <div class="form-floating mb-3 mt-3">
                  <input type="number" class="form-control" id="equity" placeholder="Enter equity" name="equity" .value=${this.equity} @input=${e => this.equity = Number(e.target.value)}>
                  <label for="equity">Equity Offered(%)</label>
                </div>
                <div class="form-floating mb-3 mt-3">
                  <input type="number" class="form-control" id="seeking" placeholder="Enter seeking" name="seeking" .value=${this.seeking} @input=${e => this.seeking = Number(e.target.value)}>
                  <label for="seeking">Seeking(USD)</label>
                </div>
                <div class="form-floating mb-3 mt-3">
                  <input type="text" class="form-control" id="location" placeholder="Enter location" name="location"  .value=${this.location} @input=${e => this.location = e.target.value}>
                  <label for="location">Location</label>
                </div>
                <div class="form-floating mb-3 mt-3">
                  <select class="form-select" id="category" name="sellist" .value=${this.category} @input=${e => this.category = e.target.value}>
                    <option>Real Estate</option>
                    <option>Equity</option>
                    <option>Oil</option>
                  </select>
                  <label for="category" class="form-label">Select Category</label>
                </div>
                <div class="form-floating mb-3 mt-3">
                  <select class="form-select" id="owner" name="sellist" .value=${this.owner} @input=${e => this.owner = e.target.value}>
                    ${this.organizations.map(org => html`<option value=${org.id}>${org.name}</option>`)
      }
                    <option value=''>Individual</option>
                  </select>
                  <label for="owner" class="form-label">Select Owner</label>
                </div>
                <div class="form-floating mb-3 mt-3">
                  <input type="number" class="form-control" id="valuation" placeholder="Enter valuation" .value=${this.valuation} @input=${e => this.valuation = Number(e.target.value)}>
                  <label for="valuation">Valuation(USD)</label>
                </div>
                <div class="form-floating mb-3 mt-3">
                  <input type="number" class="form-control" id="shareprice" placeholder="Enter share price" name="shareprice" .value=${this.sharePrice} @input=${e => this.sharePrice = Number(e.target.value)}>
                  <label for="shareprice">Share Price(USD)</label>
                </div>
                ${this.fieldNames.map((fieldName, index) => html`<div class="row" style="align-items:center;">
                      <div class="col form-floating mb-3 mt-3">
                          <input type="text" class="form-control" id=${fieldName} placeholder="Enter ${fieldName}" name=${fieldName} .value=${this.values[index]} @input=${e => this.values[index] = e.target.value}></input>
                          <label for=${fieldName} style="margin-left:10px;">${fieldName}</label>
                      </div>
                      <button type="button" class="btn btn-danger" @click=${e => this.remove(index)} style="width:58px; height:58px;">X</button>
                    </div>
                  </div>`)
      }
                <div class="form-floating mb-3 mt-3">
                  <div class="row">
                    <div class="col-6 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                      <input type="text" class="form-control" id="fieldName" placeholder="Enter field name" name="fieldName" .value=${this.curFieldName} @input=${e => this.curFieldName = e.target.value}>
                    </div>
                    <div class="col-6 col-sm-6 col-md-6 col-lg-6 col-xl-6">
                      ${!!this.curFieldName ? html`<button type="button" class="btn btn-primary btn-block" @click=${e => this.add()} style="width:100%;">Add</button>` : html`<button type="button" class="btn btn-primary btn-block" @click=${e => this.add()} style="width:100%;" disabled>Add</button>`
      }
                    </div>
                  </div>
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

customElements.define('asset-register', AssetRegister);