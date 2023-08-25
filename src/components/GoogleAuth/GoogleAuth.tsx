import "./GoogleAuth.css";

import React from "react";

export const GoogleAuthLogin = ({ onClick }: { onClick: () => void }) => {
    return (
        <div className="google-btn" onClick={onClick}>
            <div className="google-icon-wrapper">
                <img
                    className="google-icon-svg"
                    src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                    alt="Google"
                />
            </div>
            <p className="btn-text">
                <b>Sign in with Google</b>
            </p>
        </div>
    );
};
export const GoogleAuthSignUp = ({ onClick }: { onClick: () => void }) => {
    return (
        <div className="google-btn" onClick={onClick}>
            <div className="google-icon-wrapper">
                <img
                    className="google-icon-svg"
                    src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg"
                    alt="Google"
                />
            </div>
            <p className="btn-text">
                <b>Sign up with Google</b>
            </p>
        </div>
    );
};
