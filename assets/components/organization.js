import { html, css, LitElement } from 'https://cdn.jsdelivr.net/npm/lit@^2/+esm' // 'https://cdn.skypack.dev/lit'
import 'https://cdn.jsdelivr.net/npm/@material/mwc-button@^0.25.0/+esm';
import { auth, onAuthStateChanged } from '/assets/js/firebase.js'
import { getOrganization, getOrganizationUsers, inviteUser, leaveOrg } from '../js/api.js';
import { endAction, startAction } from '../actions/index.js'
import { store } from '../redux/store.js'

export class Organizaiton extends LitElement {
  static get properties() {
    return {
      admin: { type: String },
      logo: { type: String },
      name: { type: String },
      users: { type: Array },
      email: { type: String },
      inviteEmail: { type: String }
    }
  }

  constructor() {
    super();
    this.admin = ''
    this.logo = ''
    this.name = ''
    this.users = []
    this.inviteEmail = ''
    this.email = ''
    this.fetchData();
  }

  async connectedCallback() {
    super.connectedCallback();
  }

  fetchData() {
    onAuthStateChanged(auth, async (user) => {
      console.log("STATE CHANGED in investments:", user)
      store.dispatch(startAction())
      try {
        if (user) {
          this.email = user.email
          const org = (await getOrganization(orgId)).organization
          this.users = [...((await getOrganizationUsers(orgId)).users)]
          this.admin = org.admin
          this.name = org.name
          this.logo = org.logo
        } else {
          // this.signedIn = false
        }
      } catch (err) {
        console.log('error:', err)
      }
      store.dispatch(endAction())
    });
  }

  invite = async () => {
    console.log('inviting:', orgId, this.inviteEmail)
    store.dispatch(startAction())
    const res = await inviteUser(orgId, this.inviteEmail)
    console.log('resultt:', res)
    store.dispatch(endAction())
    window.location.href = `/organization/${orgId}`
  }

  kick = async email => {
    console.log('kicking:', email)
    store.dispatch(startAction())
    await leaveOrg(orgId, email)
    store.dispatch(endAction())
    window.location.href = `/organization/${orgId}`
  }

  render() {
    return html`<div class="container px-4 py-5 my-5 text-center justify-content-start">
            <div class="row justify-content-center">
                <div class="col-10 col-sm-10 col-md-10 col-lg-8 col-xl-8">
                    <h1 class="fw-bold width-auto mb-5">${this.name}</h1>
                    <img src=${this.logo}/>
                    <div class="row" style="justify-content:center">
                        <div class="col-10 col-sm-10 col-md-8 col-lg-8 col-xl-6 mt-2 p-3">
                            <a href=${`/organization/${orgId}/assets`} style="text-decoration:none;">View Assets</a>
                            <h1 class="fw-bold width-auto mt-1 mb-1">Members</h1>
                            <table class="table table-borderless">
                              <thead>
                                <tr>
                                  <th>Email</th>
                                  <th>Role</th>
                                </tr>
                              </thead>
                              <tbody>
                                ${this.users.map(user => html`<tr>
                                    <td style="vertical-align:middle;">${user.email}</td>
                                    <td style="vertical-align:middle;">${user.role}</td>
                                    ${this.admin === this.email && user.role === 'User' ? html`<td><button type="button" class="btn btn-danger" @click=${e => this.kick(user.email)}>Leave</button></td>` : html``
      }
                                  </tr>`)
      }
                              </tbody>
                            </table>
                            ${this.email === this.admin ? html`<button type="button" class="btn btn-success"  data-bs-toggle="modal" data-bs-target="#invite-modal">Invite</button>` : ''
      }
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal" id="invite-modal">
                <div class="vertical-alignment-helper">
                    <div class="modal-dialog modal-sm vertical-align-center">
                        <div class="modal-content">

                        <div class="modal-header border-none">
                            <h4 class="modal-title">Invite</h4>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>

                        <div class="modal-body" style="border-radius:12px;border:1px solid #dee6f1;margin:15px;">
                            <div class="mb-3 mt-3 justify-content-start">
                              <div class="row">
                                <label for="email" class="form-label text-start">Email:</label>
                              </div>
                              <input type="email" class="form-control" id="email" placeholder="Enter email" name="email" .value=${this.inviteEmail} @input=${e => this.inviteEmail = e.target.value}>
                            </div>
                        </div>

                        <div class="modal-footer border-none">
                            ${!!this.inviteEmail ? html`<button type="button" class="btn btn-primary full-width" data-bs-dismiss="invite-modal" @click=${e => this.invite()}><b>Invite</b></button>` : html`<button type="button" class="btn btn-primary full-width" data-bs-dismiss="invite-modal" disabled><b>Invite</b></button>`
      }
                            
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal" id="invite-modal">
                <div class="vertical-alignment-helper">
                    <div class="modal-dialog modal-sm vertical-align-center">
                        <div class="modal-content">

                        <div class="modal-header border-none">
                            <h4 class="modal-title">Invite</h4>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>

                        <div class="modal-body" style="border-radius:12px;border:1px solid #dee6f1;margin:15px;">
                            <div class="mb-3 mt-3 justify-content-start">
                              <div class="row">
                                <label for="email" class="form-label text-start">Email:</label>
                              </div>
                              <input type="email" class="form-control" id="email" placeholder="Enter email" name="email" .value=${this.inviteEmail} @input=${e => this.inviteEmail = e.target.value}>
                            </div>
                        </div>

                        <div class="modal-footer border-none">
                            ${!!this.inviteEmail ? html`<button type="button" class="btn btn-primary full-width" data-bs-dismiss="invite-modal" @click=${e => this.invite()}><b>Invite</b></button>` : html`<button type="button" class="btn btn-primary full-width" data-bs-dismiss="invite-modal" disabled><b>Invite</b></button>`
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

customElements.define('organization-panel', Organizaiton);