import { html, css, LitElement } from 'https://cdn.jsdelivr.net/npm/lit@^2/+esm' // 'https://cdn.skypack.dev/lit'
import 'https://cdn.jsdelivr.net/npm/@material/mwc-button@^0.25.0/+esm';
import { auth, onAuthStateChanged } from '/assets/js/firebase.js'
import { connect } from 'https://cdn.jsdelivr.net/npm/pwa-helpers@0/+esm'
import { store } from '../redux/store.js'
import { addOrganization } from '../js/api.js';
import { endAction, startAction } from '../actions/index.js'

export class CreateOrg extends connect(store)(LitElement) {
  static get properties() {
    return {
      name: { type: String },
      formData: { type: FormData },
      email: { type: String }
    }
  }

  constructor() {
    super();
    this.name = ''
  }

  async connectedCallback() {
    super.connectedCallback();
    this.fetchData();
  }

  fetchData() {
    onAuthStateChanged(auth, async (user) => {
      console.log("STATE CHANGED in investments:", user)
      try {
        if (user) {
          this.email = user.email
        }
      } catch (err) {
        console.log('error:', err)
      }
    });
  }

  onImageChange = e => {
    const file = e.target.files[0]
    if (!(file.type.startsWith('image'))) {
      alert('Not Image')
      return
    }
    this.formData = new FormData()
    this.formData.append('logo', file)
  }

  register = async () => {
    this.formData.append('name', this.name)
    this.formData.append('email', this.email)
    store.dispatch(startAction())
    try {
      const res = await addOrganization(this.formData)
      console.log('result:', res)
      store.dispatch(endAction())
      window.location.href = '/organizations'
    } catch (err) {
      store.dispatch(endAction())
      console.log('error:', err)
    }
  }

  render() {
    return html`<div class="container px-4 py-5 my-5 text-start">
            <h1 class="fw-bold width-auto mb-5 text-center">Create Organization</h1>
            <div class="row justify-content-center">
              <div class="col-xl-6 col-lg-6 col-md-8 col-sm-10 col-12">
                <div class="form-floating mb-3 mt-3">
                  <input type="text" class="form-control" id="name" placeholder="Enter name" name="name" .value=${this.name} @input=${e => this.name = e.target.value}>
                  <label for="name">Name</label>
                </div>
                <input type="file" class="form-control" id="image" placeholder="Upload Asset Image" name="iamge" @input=${this.onImageChange}>
                <div class="form-floating mb-3 mt-3 d-grid">
                  <button type="button" class="btn btn-primary btn-block" @click=${e => this.register()}>Create</button>
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

customElements.define('create-organization', CreateOrg);