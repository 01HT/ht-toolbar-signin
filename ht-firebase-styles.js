import { html } from "@polymer/lit-element";

export const HTFirebaseStyles = html`<style>
    #firebaseui-auth-container {
        overflow: visible;
        box-shadow: none;
    }

    #firebaseui-auth-container .mdl-button--raised.mdl-button--colored {
        background: var(--accent-color);
    }

    #firebaseui-auth-container .mdl-button--raised.mdl-button--colored:hover {
        background: var(--accent-color);
    }

    #firebaseui-auth-container .mdl-button--primary.mdl-button--primary {
        color: var(--accent-color);
    }

    #firebaseui-auth-container .firebaseui-textfield.mdl-textfield .firebaseui-label::after {
        background: var(--accent-color);
    }
    
    #firebaseui-auth-container .firebaseui-idp-list {
        margin: 24px 0;
    }

    #firebaseui-auth-container .firebaseui-link {
        color: var(--accent-color);
    }
</style>`;
