"use strict";
import { LitElement, html } from "@polymer/lit-element";
import "@polymer/paper-icon-button";
import "@polymer/paper-button";
import "@polymer/paper-dialog/paper-dialog.js";
import "@polymer/paper-dialog-scrollable/paper-dialog-scrollable.js";
import "@polymer/iron-dropdown";
import "@polymer/paper-spinner/paper-spinner.js";

import "./ht-toolbar-signin-firebaseui-block.js";
import "./ht-toolbar-signin-email-verify-block.js";

class HTToolabarSignin extends LitElement {
  render() {
    const { authInitialized, signedIn, loadingUserData, avatar, mode } = this;
    return html`
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
          width:270px;
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

        [hidden], #buttons[hidden] {
          display:none;
        }
      </style>
      <iron-iconset-svg size="24" name="ht-toolbar-signin">
        <svg>
            <defs>
                <g id="close"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path></g>
            </defs>
        </svg>
    </iron-iconset-svg>

    <paper-dialog id="login-dialog" with-backdrop  @opened-changed=${e => {
      if (!e.target.opened) this._onDialogClose();
    }}>
        <style>
        #login-dialog paper-dialog-scrollable {
          position:relative;
          padding:0;
          margin:0;
        }

        #login-dialog #close {
          position: absolute;
          right: 8px;
          top: 8px;
          width: 48px;
          height: 48px;
          z-index:9;
          color:var(--secondary-text-color);
        }

        #login-dialog {
          margin-left: 0;
          margin-right: 0;
          max-width:372px;
        }
        </style>
        <paper-dialog-scrollable>
            <paper-icon-button id="close" icon="ht-toolbar-signin:close" dialog-dismiss></paper-icon-button>
            <ht-toolbar-signin-firebaseui-block ?hidden=${mode ===
              "email"}></ht-toolbar-signin-firebaseui-block>
            <ht-toolbar-signin-email-verify-block ?hidden=${mode ===
              "firebaseui"}></ht-toolbar-signin-email-verify-block>
        </paper-dialog-scrollable>
    </paper-dialog>

    <div id="container">
      <paper-spinner active ?hidden=${!authInitialized ||
        !loadingUserData}></paper-spinner>
      <div id="buttons" ?hidden=${!authInitialized || loadingUserData}>
        ${
          signedIn
            ? html`<paper-icon-button src="${
                window.cloudinaryURL
              }/c_scale,r_max,f_auto,h_64,w_64/v${avatar.version}/${
                avatar.public_id
              }.${avatar.format}" @click=${_ => {
                this._toggleMenu();
              }}></paper-icon-button>`
            : html`<paper-button @click=${_ => {
                this.dialog.open();
              }}>Войти</paper-button>`
        }
      </div>
      <iron-dropdown horizontal-align="right" vertical-align="top" vertical-offset="36">
        <div slot="dropdown-content">
            <div ?hidden=${!signedIn}>
              <slot></slot>
            </div>
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
      authInitialized: { type: Boolean },
      signedIn: { type: Boolean },
      loadingUserData: { type: Boolean },
      avatar: { type: Object },
      mode: { type: String }
    };
  }

  constructor() {
    super();
    this.mode = "firebaseui";
    this.authInitialized = false;
  }

  firstUpdated() {
    this.addEventListener("firebaseui-ready", e => {
      e.stopPropagation();
      this._init();
    });
  }

  get menu() {
    return this.shadowRoot.querySelector("iron-dropdown");
  }

  get firebaseUIBlock() {
    return document.querySelector("ht-toolbar-signin-firebaseui-block");
  }

  get emailVerifyBlock() {
    return document.querySelector("ht-toolbar-signin-email-verify-block");
  }

  async _init() {
    try {
      this._initDialog();
      firebase.auth().onAuthStateChanged(
        async function(user) {
          this.dialog.close();
          this.authInitialized = true;
          // User is signed in
          if (user) {
            // Social network not give email or email not verified
            if (user.email === null || !user.emailVerified) {
              this.mode = "email";
              if (user.email === null) {
                this.emailVerifyBlock.setEmail();
              } else {
                this.emailVerifyBlock.verifyEmail();
              }
              this.dialog.open();
            } else {
              await this.authorizeUser();
              this.dialog.close();
            }
          } else {
            // No user is signed in.
            if (this.signedIn) this._signOut();
          }
          this.dispatchEvent(
            new CustomEvent("on-auth-state-changed", {
              bubbles: true,
              composed: true
            })
          );
        }.bind(this)
      );
    } catch (err) {
      console.log(err);
    }
  }

  async authorizeUser() {
    let uid = firebase.auth().currentUser.uid;
    this.loadingUserData = true;
    let userData = await this._getUserData(uid);
    if (userData === "user creating limit was reached") return;
    this._signIn(userData);
    this.loadingUserData = false;
  }

  async _getUserData(uid, counterParam) {
    let doc = await firebase
      .firestore()
      .collection("users")
      .doc(uid)
      .get();
    if (doc.exists) {
      return doc.data();
    } else {
      let counter = counterParam || 0;
      counter++;
      let promise = new Promise(resolve => {
        if (counter === 8) {
          resolve("user creating limit was reached");
          return;
        }
        setTimeout(_ => {
          resolve(this.getUserData(uid, counter));
        }, 1000);
      });
      let userData = await promise;
      return userData;
    }
  }

  _initDialog() {
    // Move paper-dialog in body for fix black overlay over all
    document.body.appendChild(this.shadowRoot.querySelector("paper-dialog"));
    this.dialog = document.body.querySelector("paper-dialog");
    let style = document.createElement("style");
    style.innerHTML = "#scrollable {padding: 16px 8px !important;}";
    this.dialog
      .querySelector("paper-dialog-scrollable")
      .shadowRoot.append(style);
  }

  _toggleMenu() {
    if (this.menu.style.display === "") {
      this.menu.close();
    } else {
      this.menu.open();
    }
  }

  close() {
    this.menu.close();
  }

  async _onDialogClose() {
    if (this.firebaseUIBlock !== null && this.emailVerifyBlock !== null) {
      this.firebaseUIBlock.reset();
      this.emailVerifyBlock.reset();
      if (this.mode === "email") {
        this.mode = "firebaseui";
        let currentUser = firebase.auth().currentUser;
        if (currentUser.emailVerified && currentUser.email !== null) {
          await this.authorizeUser();
          this.dispatchEvent(
            new CustomEvent("show-toast", {
              bubbles: true,
              composed: true,
              detail: {
                duration: 5000,
                text: "Ваш email успешно подтвержден"
              }
            })
          );
        } else {
          this._signOut();
        }
      }
    }
  }

  _signIn(userData) {
    this.dispatchEvent(
      new CustomEvent("on-signin", {
        bubbles: true,
        composed: true,
        detail: {
          userData: userData
        }
      })
    );
  }

  _signOut() {
    this.dispatchEvent(
      new CustomEvent("on-signout", {
        bubbles: true,
        composed: true
      })
    );
  }
}

customElements.define(HTToolabarSignin.is, HTToolabarSignin);
