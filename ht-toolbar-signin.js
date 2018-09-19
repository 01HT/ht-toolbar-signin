"use strict";
import { LitElement, html } from "@polymer/lit-element";
import "@polymer/paper-icon-button";
import "@polymer/paper-button";
import "@polymer/iron-dropdown";
import "@polymer/paper-spinner/paper-spinner.js";
import "@polymer/paper-styles/default-theme.js";
import { firebaseStyles } from "./firebase-styles.js";
import { HTFirebaseStyles } from "./ht-firebase-styles.js";

import { connect } from "pwa-helpers/connect-mixin.js";
import { store } from "/src/store.js";

import { authInitialized, signIn, signOut } from "/src/actions/auth.js";

class HTToolabarSignin extends connect(store)(LitElement) {
  render() {
    return html`
    ${firebaseStyles}
    ${HTFirebaseStyles}
      <style>
        :host {
          display: block;
          position: relative;
          box-sizing: border-box;
        }
        
        #container {
          display:flex;
          align-items:center;
        }
        
        paper-icon-button {
          color: var(--secondary-text-color);
          width: 32px;
          height: 32px;
          border-radius: 50%;
          overflow: hidden;
          padding:0;
          margin-left:4px;
        }

        paper-button {
          color: var(--accent-color);
          height:36px;
          padding: 8px;
          font-size:14px;
          font-weight:500;
          transition: background-color .2s,color .2s;
          margin:0;
        }

        paper-spinner {
          align-items:center;
        }

        paper-button:hover {
          background:#f0f0f0;
          transition: background-color .2s,color .2s;
        }

        #buttons {
          display:flex;
          align-items:center;
        }

        iron-dropdown {
          width:280px;
          height:auto;
          overflow: hidden;
          background: #fff;
          box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14),
          0 1px 10px 0 rgba(0, 0, 0, 0.12),
          0 2px 4px -1px rgba(0, 0, 0, 0.4);
        }

        iron-dropdown > div {
          overflow: hidden;
        }

        #menuDropdown {
          width:270px;
        }

        #loginDropdown {
          min-height:308px;
        }

        [hidden], #buttons[hidden] {
          display:none;
        }
      </style>
      <div id="container">
        <paper-spinner active ?hidden=${!this.authInitialized ||
          !this.loadingUserData}></paper-spinner>
        <div id="buttons" ?hidden=${!this.authInitialized ||
          this.loadingUserData}>
          ${
            this.signedIn
              ? html`<paper-icon-button src=${
                  window.cloudinaryURL
                }/c_scale,r_max,f_auto,h_64,w_64/v${this.avatar.version}/${
                  this.avatar.public_id
                }.${this.avatar.format} @click=${_ => {
                  this._toggleDropdown("menuDropdown");
                }}></paper-icon-button>`
              : html`<paper-button @click=${_ => {
                  this._toggleDropdown("loginDropdown");
                }}>Войти</paper-button>`
          }
        </div>
        <iron-dropdown id="menuDropdown" horizontal-align="right" vertical-align="top" vertical-offset="36">
          <div slot="dropdown-content">
              <div ?hidden=${!this.signedIn}>
                <slot></slot>
              </div>
          </div>
        </iron-dropdown>
        <iron-dropdown id="loginDropdown" horizontal-align="right" vertical-align="top" vertical-offset="36" @iron-overlay-opened=${_ => {
          this._startPeriodicRefit();
        }} @iron-overlay-closed=${_ => {
      this._stopPeriodicRefit();
    }}>
          <div slot="dropdown-content">
              <div id="firebaseui-auth-container"></div>
          </div>
        </iron-dropdown>
      </div>
`;
  }

  static get is() {
    return "ht-toolbar-signin";
  }

  static get properties() {
    return {
      authInitialized: Boolean,
      signedIn: Boolean,
      loadingUserData: Boolean,
      refitIntervalId: Number,
      avatar: Object
    };
  }

  _stateChanged(state) {
    this.authInitialized = state.auth.authInitialized;
    this.signedIn = state.auth.signedIn;
    this.avatar = state.auth.user.avatar;
  }

  firstUpdated() {
    this._loadFirebaseUIScript();
  }

  get menuDropdown() {
    return this.shadowRoot.querySelector("#menuDropdown");
  }

  get loginDropdown() {
    return this.shadowRoot.querySelector("#loginDropdown");
  }

  _loadFirebaseUIScript() {
    const script = document.createElement("script");
    script.src =
      "/node_modules/@01ht/ht-toolbar-signin/firebase-ui-auth__ru.js";
    script.onload = _ => {
      this._firebaseUILoaded();
    };
    document.head.appendChild(script);
  }

  _getUiConfig() {
    return {
      callbacks: {
        // Called when the user has been successfully signed in.
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
          // Do not redirect.
          return false;
        }
      },
      signInFlow: "popup",
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.FacebookAuthProvider.PROVIDER_ID,
        firebase.auth.TwitterAuthProvider.PROVIDER_ID,
        firebase.auth.GithubAuthProvider.PROVIDER_ID,
        {
          provider: firebase.auth.EmailAuthProvider.PROVIDER_ID,
          requireDisplayName: false
        }
      ],
      credentialHelper: firebaseui.auth.CredentialHelper.NONE,
      tosUrl: "/privacy"
    };
  }

  _firebaseUILoaded() {
    firebase.auth().onAuthStateChanged(
      async function(user) {
        this.close();
        if (!this.authInitialized) store.dispatch(authInitialized());
        if (user) {
          // User is signed in.
          // if (user.emailVerified === false) user.sendEmailVerification();
          this._closeLoginDropdown();
          this.loadingUserData = true;
          let uid = user.uid;
          let userData = await this.getUserData(uid);
          store.dispatch(signIn(userData));
          this.loadingUserData = false;
        } else {
          // No user is signed in.
          if (this.signedIn) {
            this._initFirebaseAuthContainer();
            store.dispatch(signOut());
          }
        }
        // on-auth-state-changed
        this.dispatchEvent(
          new CustomEvent("on-auth-state-changed", {
            bubbles: true,
            composed: true
          })
        );
      }.bind(this)
    );
    // Initialize the FirebaseUI Widget using Firebase.
    let ui = new firebaseui.auth.AuthUI(firebase.auth());
    this._initFirebaseAuthContainer();
  }

  _initFirebaseAuthContainer() {
    const ui = firebaseui.auth.AuthUI.getInstance();
    ui.reset();
    ui.start(
      this.shadowRoot.querySelector("#firebaseui-auth-container"),
      this._getUiConfig()
    );
  }

  _refit() {
    this.loginDropdown.refit();
  }

  _toggleDropdown(dropdownId) {
    if (this[dropdownId].style.display === "") {
      this[dropdownId].close();
    } else {
      this[dropdownId].open();
    }
  }

  _closeLoginDropdown() {
    this.loginDropdown.close();
  }

  _startPeriodicRefit() {
    this.refitIntervalId = setInterval(_ => {
      this._refit();
    }, 300);
  }

  _stopPeriodicRefit() {
    clearInterval(this.refitIntervalId);
  }

  close() {
    this["menuDropdown"].close();
  }

  async getUserData(uid, counterParam) {
    try {
      let counter = 0;
      if (counterParam) counter = counterParam;
      let doc = await firebase
        .firestore()
        .collection("users")
        .doc(uid)
        .get();
      if (doc.exists) {
        return doc.data();
      } else {
        let promise = new Promise(resolve => {
          if (counter === 10)
            throw new Error("GetUserData invoke limit was reached");
          setTimeout(_ => {
            resolve(this.getUserData(uid, counter++));
          }, 1000);
        });
        await promise;
        return promise;
      }
    } catch (e) {
      console.log("getUserData: " + e.message);
    }
  }

  openLogin() {
    this._toggleDropdown("loginDropdown");
  }
}

customElements.define(HTToolabarSignin.is, HTToolabarSignin);
