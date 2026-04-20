export const useAuth = () => {
    // Note: Partner credit, user vault, and Web3 features are currently dormant.
    // Development priority is ensuring Stripe checkout functionality is robust
    // and generating revenue before adding external authentication / token credits.
    // To reactivate Web3 features, set VITE_ENABLE_WEB3=true in the environment.

    const isWeb3Enabled = import.meta.env && import.meta.env.VITE_ENABLE_WEB3 === 'true';
    if (isWeb3Enabled) {
        console.warn("Web3 features are dormant. Mock web3 session intentionally prevented.");
    }

    return {
        userSession: null
    };
};
