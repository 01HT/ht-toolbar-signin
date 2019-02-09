import { css } from "lit-element";

export const HTFirebaseStyles = css`<style>
    #firebaseui-auth-container {
        overflow: visible;
        box-shadow: none;
    }

    .firebaseui-container {
        box-shadow:none;
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

    #firebaseui-auth-container .firebaseui-link {
        color: #4285f4;
    }

    .firebaseui-card-footer {
        padding: 0 8px;
    }

    .firebaseui-tos {
        padding: 0 3px;
        margin-bottom: 8px;
    }
</style>`;
