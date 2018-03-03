"use strict";
import { LitElement, html } from "../@polymer/lit-element/lit-element.js";
import "../@polymer/iron-iconset-svg/iron-iconset-svg.js";
import "../@polymer/paper-icon-button/paper-icon-button.js";
import "../@polymer/paper-button/paper-button.js";
import "../@polymer/paper-styles/default-theme.js";

class HTToolabarSignin extends LitElement {
  render({ signedIn, photoURL }) {
    return html`
      <style>
        :host {
            display: block;
            position: relative;
            box-sizing: border-box;
        }

        #container {
          display:flex;
        }
        
        paper-icon-button {
            color: var(--secondary-text-color);
            width: 32px;
            height: 32px;
            border-radius: 50%;
            overflow: hidden;
            padding:0;
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

        paper-button:hover {
          background:#f0f0f0;
          transition: background-color .2s,color .2s;
        }

        [hidden] {
          display: none;
        }
      </style>
      <iron-iconset-svg size="24" name="ht-toolbar-signin-icons">
          <svg>
              <defs>
                <g id="account-circle">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"></path>
                </g>
              </defs>
          </svg>
      </iron-iconset-svg>
      <div id="container">
        <paper-button hidden?=${signedIn} on-click="${e => {
      e.preventDefault();
      this.signIn();
    }}">Войти</paper-button>
        
        <paper-icon-button src$=${photoURL} hidden?=${!signedIn} on-click="${e => {
      e.preventDefault();
      this.signOut();
    }}"></paper-icon-button>
      </div>
`;
  }

  static get is() {
    return "ht-toolbar-signin";
  }

  static get properties() {
    return {
      signedIn: Boolean,
      photoURL: String
    };
  }

  signIn() {
    this.dispatchEvent(
      new CustomEvent("signin", {
        bubbles: false
      })
    );
  }

  signOut() {
    this.dispatchEvent(
      new CustomEvent("signout", {
        bubbles: false
      })
    );
  }
}

customElements.define(HTToolabarSignin.is, HTToolabarSignin);
