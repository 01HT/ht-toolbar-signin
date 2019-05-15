"use strict";
import { LitElement, html, css } from "lit-element";
import "@polymer/paper-input/paper-input.js";
import "@polymer/paper-button";
import "@polymer/paper-spinner/paper-spinner.js";

class HTToolbarSigninEmailVerifyBlock extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        position: relative;
        box-sizing: border-box;
        font-size: 16px;
      }

      paper-button {
        border: none;
        border-radius: 2px;
        color: var(--accent-color);
        background: transparent;
        position: relative;
        height: 36px;
        margin: 0;
        min-width: 64px;
        padding: 0 16px;
        display: inline-block;
        font-size: 14px;
        font-weight: 500;
        text-transform: uppercase;
        line-height: 1;
        letter-spacing: 0;
        overflow: hidden;
        will-change: box-shadow;
        transition: box-shadow 0.2s cubic-bezier(0.4, 0, 1, 1),
          background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1),
          color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        outline: none;
        cursor: pointer;
        text-decoration: none;
        text-align: center;
        line-height: 36px;
        vertical-align: middle;
        margin-left: 8px;
      }

      paper-button:hover {
        background-color: rgba(158, 158, 158, 0.2);
      }

      paper-button.accent {
        color: #fff;
        background: var(--accent-color);
      }

      paper-button.accent:hover {
        background: var(--accent-color);
      }

      paper-spinner {
        width: 48px;
        height: 48px;
        margin: 16px 0 8px 0;
      }

      paper-input {
        padding: 0;
      }

      #container {
        display: block;
        position: relative;
        min-width: 260px;
        overflow: hidden;
        padding: 24px 24px 16px 24px;
      }

      #verify {
        display: flex;
        flex-direction: column;
      }

      #wait {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        padding-top: 24px;
        border-top: 1px solid #dddd;
        text-align: center;
        margin-top: 24px;
      }

      .title {
        color: rgba(0, 0, 0, 0.87);
        direction: ltr;
        font-size: 20px;
        font-weight: 500;
        line-height: 24px;
        margin: 0;
        padding: 0;
        text-align: left;
        padding-bottom: 20px;
      }

      .email {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      .sub {
        color: var(--secondary-text-color);
        margin-bottom: 16px;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        margin-top: 16px;
      }

      [hidden] {
        display: none !important;
      }
    `;
  }

  render() {
    let socialLogin = true;
    if (firebase.auth().currentUser !== null) {
      let providerData = firebase.auth().currentUser.providerData;
      if (
        providerData.length === 1 &&
        providerData[0].providerId === "password"
      )
        socialLogin = false;
    }
    const { mode, userData } = this;
    return html`
    <div id="container">
      <!-- Установка email -->
      <div id="set" ?hidden="${mode !== "set"}">
        <div class="title">Ваш email</div>
        <div class="text"></div>
        <paper-input id="set-input" label="Укажите ваш email адрес" @change="${e => {
          e.target.removeAttribute("invalid");
        }}" @keyup="${e => {
      e.target.removeAttribute("invalid");
    }}"></paper-input>
        <div class="actions">
          <paper-button class="accent" raised @click="${_ => {
            this._setEmail();
          }}">Сохранить</paper-button>
        </div>
      </div>
      <!-- Изменение email -->
      <div id="change" ?hidden="${mode !== "change"}">
        <div class="title">Изменение email</div>
        <paper-input id="change-input" label="Новый email" @change="${e => {
          e.target.removeAttribute("invalid");
        }}" @keyup="${e => {
      e.target.removeAttribute("invalid");
    }}"></paper-input>
    <paper-input id="password" type="password" label="Ваш текущий пароль" ?hidden="${socialLogin}" @change="${e => {
      e.target.removeAttribute("invalid");
    }}" @keyup="${e => {
      e.target.removeAttribute("invalid");
    }}"></paper-input>
        <div class="actions">
          <paper-button @click="${_ => {
            this.verifyEmail(true);
          }}">Назад</paper-button>
          <paper-button class="accent" raised @click="${
            this._changeEmail
          }">Сохранить</paper-button>
        </div>
      </div>
      <!-- Проверка -->
      <div id="verify" ?hidden="${mode !== "verify"}">
        <div class="title">Подтверждение email</div>
        <div id="edit">
          <div class="email">Ваш email: <strong>${
            userData.email === null ? "Не указан" : `${userData.email}`
          }</strong></div>
          <div class="actions">
            <paper-button class="accent" raised @click="${
              this.changeEmail
            }">Изменить</paper-button>
          </div>
        </div>
        <div id="wait" ?hidden="${userData.email === null}">
          Вам отправлено письмо с подтверждением
          <paper-spinner active></paper-spinner>
          <div class="sub">Ожидание подтверждения</div>
          <paper-button class="accent" raised @click="${
            this._sendEmailVerification
          }">Отправить еще раз</paper-button>
      </div>
    </div>`;
  }

  static get properties() {
    return {
      mode: { type: String },
      userData: { type: Object },
      loading: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.userData = {
      email: null
    };
    this.loading = false;
    this.intervalId;
    this.counter = 0;
  }

  get setInput() {
    return this.shadowRoot.querySelector("#set-input");
  }

  get changeInput() {
    return this.shadowRoot.querySelector("#change-input");
  }

  get passwordInput() {
    return this.shadowRoot.querySelector("#password");
  }

  async _updateEmailVerifiedInFirestore(uid) {
    try {
      // Need update if user change email from account settings
      await firebase
        .firestore()
        .collection("users")
        .doc(uid)
        .update({
          emailVerified: true,
          email: firebase.auth().currentUser.email
        });
    } catch (e) {
      // Access premission error when new user account creating, no need update email
    }
  }

  reset() {
    this.stopChecker();
  }

  updated() {
    if (this.mode === "verify") document.querySelector("paper-dialog").refit();
  }

  updateUserdata() {
    let userData = firebase.auth().currentUser;
    // if (userData === null) return;
    this.userData = {
      email: userData.email
    };
  }

  async startChecker() {
    this.stopChecker();
    this.counter = 0;
    this.intervalId = setInterval(async _ => {
      await firebase.auth().currentUser.reload();
      if (this.counter === 15) {
        this.dispatchEvent(
          new CustomEvent("show-toast", {
            bubbles: true,
            composed: true,
            detail: {
              text: "Превышено время ожидания"
            }
          })
        );
        document.querySelector("paper-dialog").close();
      }
      this.counter++;
      if (firebase.auth().currentUser.emailVerified) {
        this._onVerifiedComplete();
      }
    }, 5000);
  }

  stopChecker() {
    if (this.intervalId !== undefined) {
      clearInterval(this.intervalId);
    }
  }

  async _updateEmail(email) {
    try {
      await firebase.auth().currentUser.updateEmail(email);
      return true;
    } catch (err) {
      // this.dispatchEvent(
      //   new CustomEvent("show-toast", {
      //     bubbles: true,
      //     composed: true,
      //     detail: {
      //       text: err.code
      //     }
      //   })
      // );
      return err.code;
    }
  }

  async _emailExist(email) {
    let result = await firebase.auth().fetchSignInMethodsForEmail(email);
    if (result.length === 0) return false;
    return true;
  }

  async setEmail() {
    this._resetSetBlock();
    this.mode = "set";
    this.stopChecker();
  }

  _resetSetBlock() {
    this.setInput.value = "";
    this.setInput.removeAttribute("invalid");
  }

  async _setEmail() {
    let input = this.shadowRoot.querySelector("#set-input");
    let newEmail = input.value;
    let emailExist = await this._emailExist(newEmail);
    if (emailExist) {
      input.setAttribute("invalid", "");
      input.setAttribute(
        "error-message",
        "Email уже используется в другом аккаунте"
      );
      return;
    }
    await this._reauthenticate();
    await this._updateEmail(newEmail);
    this.verifyEmail();
  }

  async changeEmail() {
    this._resetChangeBlock();
    this.mode = "change";
    this.stopChecker();
  }

  _resetChangeBlock() {
    this.changeInput.value = "";
    this.changeInput.removeAttribute("invalid");
    this.passwordInput.value = "";
    this.passwordInput.removeAttribute("invalid");
  }

  async _changeEmail() {
    let newEmail = this.changeInput.value;
    let emailExist = await this._emailExist(newEmail);
    if (emailExist) {
      this.changeInput.setAttribute("invalid", "");
      this.changeInput.setAttribute(
        "error-message",
        "Email уже используется в другом аккаунте"
      );
      return;
    }
    let providerData = firebase.auth().currentUser.providerData;
    if (
      providerData.length === 1 &&
      providerData[0].providerId === "password"
    ) {
      let result = await this._reauthenticate(this.passwordInput.value);
      if (result !== true) {
        this.passwordInput.setAttribute("invalid", "");
        this.passwordInput.setAttribute("error-message", "Неверный пароль");
        return;
      }
    } else {
      await this._reauthenticate();
    }
    await this._updateEmail(newEmail);
    this.verifyEmail();
  }

  async verifyEmail(fromBack) {
    this.mode = "verify";
    this.updateUserdata();
    if (!fromBack) await this._sendEmailVerification();
    this.startChecker();
  }

  async _onVerifiedComplete() {
    this.stopChecker();
    await this._updateEmailVerifiedInFirestore(firebase.auth().currentUser.uid);
    document.querySelector("paper-dialog").close();
  }

  async _sendEmailVerification() {
    await firebase.auth().currentUser.sendEmailVerification();
    document.body.querySelector("elements-app").dispatchEvent(
      new CustomEvent("show-toast", {
        bubbles: true,
        composed: true,
        detail: {
          duration: 4000,
          text: "На ваш email отправлено письмо с подтверждением"
        }
      })
    );
  }

  async _reauthenticate(currentPassword) {
    try {
      let user = firebase.auth().currentUser;
      let credential;
      // For email/password
      if (currentPassword) {
        credential = firebase.auth.EmailAuthProvider.credential(
          user.email,
          currentPassword
        );
        await user.reauthenticateAndRetrieveDataWithCredential(credential);
      } else {
        // For login via social networks
        let providerData = user.providerData;
        let provider;
        // If need detect current providerId
        // https://stackoverflow.com/questions/38619628/how-to-determine-if-a-firebase-user-is-signed-in-using-facebook-authentication
        // Not implemented here
        block: {
          for (let provider of providerData) {
            let providerId = provider.providerId;
            if (providerId !== "password") {
              switch (providerId) {
                case providerId === "google.com": {
                  provider = new firebase.auth.GoogleAuthProvider();
                  break block;
                }
                case providerId === "facebook.com": {
                  provider = new firebase.auth.FacebookAuthProvider();
                  break block;
                }
                case providerId === "twitter.com": {
                  provider = new firebase.auth.TwitterAuthProvider();
                  break block;
                }
                case providerId === "github.com": {
                  provider = new firebase.auth.GithubAuthProvider();
                  break block;
                }
              }
            }
          }
        }
        // https://firebase.google.com/docs/reference/js/firebase.User#reauthenticateWithPopup
        // info https://stackoverflow.com/questions/52249546/reauthenticating-firebase-user-with-google-provider-in-react
        await firebase.auth().currentUser.reauthenticateWithPopup(provider);
      }
      return true;
    } catch (error) {
      return error.message;
      // throw new Error("_reauthenticate: " + error.message);
    }
  }
}

customElements.define(
  "ht-toolbar-signin-email-verify-block",
  HTToolbarSigninEmailVerifyBlock
);
