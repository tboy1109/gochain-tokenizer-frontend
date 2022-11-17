import { html, css, LitElement } from 'https://cdn.jsdelivr.net/npm/lit@^2/+esm' // 'https://cdn.skypack.dev/lit'
import 'https://cdn.jsdelivr.net/npm/@material/mwc-button@^0.25.0/+esm';
import { auth, onAuthStateChanged } from '/assets/js/firebase.js'
import { getOrganizations, leaveOrg } from '../js/api.js';
import { endAction, startAction } from '../actions/index.js'
import { store } from '../redux/store.js'

export class Organnizaitons extends LitElement {
  static get properties() {
    return {
      organizations: { type: Array },
      members: { type: Array },
      email: { type: String },
      myorgs: { type: Array },
      dialogOpened: { type: Boolean },
      status: { type: String },
      openedChanged: { type: Boolean }
    }
  }

  constructor() {
    super();
    this.organizations = []
    this.members = []
    this.myorgs = []
    this.dialogOpened = false
    this.status = ''
    this.openedChanged = false
  }

  async connectedCallback() {
    super.connectedCallback();
    this.fetchData();
  }

  fetchData() {
    onAuthStateChanged(auth, async (user) => {
      console.log("STATE CHANGED in investments:", user)
      store.dispatch(startAction())
      try {
        if (user) {
          // this.signedIn = true
          this.email = user.email
          console.log('getting assets')
          const res = await getOrganizations(this.email);
          console.log('organizations res:', res.organizations)
          this.members = [...res.members]
          let newOrgs = []
          res.members.map(member => {
            let org = res.organizations.find(org => org.id === member.orgid)
            if (!!org) {
              newOrgs.push(org)
            }
          })
          this.organizations = [...newOrgs]
        } else {
          // this.signedIn = false
        }
      } catch (err) {
        console.log('error:', err)
      }
      store.dispatch(endAction())
    });
  }

  leave = async orgid => {
    store.dispatch(startAction())
    const res = await leaveOrg(orgid, this.email)
    console.log('resultt:', res)
    store.dispatch(endAction())
    window.location.href = `/organizations`
  }

  render() {
    return html`<div class="container px-4 py-5 my-5 text-center justify-content-start">
            <div class="row justify-content-center">
                <div class="col-12 col-sm-12 col-md-8 col-lg-6 col-xl-6">
                    <h1 class="fw-bold width-auto mb-5">Organizations</h1>
                    <div class="row justify-content-end">
                      <a href="create-org" style="width:auto"><button type="button" class="btn btn-success">Create</button></a>
                    </div>
                    <table class="table table-borderless">
                      <thead>
                        <tr>
                          <th>Logo</th>
                          <th>Organization</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${this.organizations.map(org => html`<tr>
                            <td><img src=${org.logo} style="max-height:40px;"/></td>
                            <td style="vertical-align:middle;"><a href=${`/organization/${org.id}`} style="text-decoration:none;">${org.name}</a></td>
                            ${org.admin !== this.email ? html`<td><button type="button" class="btn btn-danger" @click=${e => this.leave(org.id)}>Leave</button></td>` : ''
      }
                          </tr>`)
      }
                      </tbody>
                    </table>
                </div>
            </div>
        </div>`
  }

  createRenderRoot() {
    return this;
  }
}

customElements.define('organizations-panel', Organnizaitons);