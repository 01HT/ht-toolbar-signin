"use strict";
import { LitElement, html } from "@polymer/lit-element";
import "@polymer/paper-icon-button";
import "@polymer/paper-button";
import "@polymer/iron-dropdown";
import "@polymer/paper-styles/default-theme.js";

class HTToolabarSignin extends LitElement {
  _render({ signedIn, photoURL }) {
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

        paper-button:hover {
          background:#f0f0f0;
          transition: background-color .2s,color .2s;
        }

        #dropdown {
          box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14),
          0 1px 10px 0 rgba(0, 0, 0, 0.12),
          0 2px 4px -1px rgba(0, 0, 0, 0.4);
          width: 270px;
          overflow: hidden;
          background: #fff;
        }
      </style>
      <div id="container">
        ${
          signedIn
            ? html`<paper-icon-button src$=${photoURL} on-click="${e => {
                e.preventDefault();
                this.open();
              }}"></paper-icon-button>`
            : html`<paper-button on-click="${e => {
                e.preventDefault();
                this.signIn();
              }}">Войти</paper-button>`
        }

        <iron-dropdown id="dropdown" horizontal-align="right" vertical-align="top" vertical-offset="36" on-click="close">
          <div slot="dropdown-content">
              <slot></slot>
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

  get dropdown() {
    return this.shadowRoot.querySelector("#dropdown");
  }

  open() {
    if (this.dropdown.style.display === "") {
      this.dropdown.close();
    } else {
      this.dropdown.open();
    }
  }

  close() {
    this.dropdown.close();
  }
}

customElements.define(HTToolabarSignin.is, HTToolabarSignin);
