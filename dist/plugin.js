var capacitorCapacitorUpdater = (function (exports, core) {
    'use strict';

    const SocialLogin = core.registerPlugin('SocialLogin', {
        web: () => Promise.resolve().then(function () { return web; }).then((m) => new m.SocialLoginWeb()),
    });

    class BaseSocialLogin extends core.WebPlugin {
        constructor() {
            super();
        }
        parseJwt(token) {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64)
                .split('')
                .map((c) => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            })
                .join(''));
            return JSON.parse(jsonPayload);
        }
        async loadScript(src) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.async = true;
                script.onload = () => {
                    resolve();
                };
                script.onerror = reject;
                document.body.appendChild(script);
            });
        }
    }
    BaseSocialLogin.OAUTH_STATE_KEY = 'social_login_oauth_pending';

    class AppleSocialLogin extends BaseSocialLogin {
        constructor() {
            super(...arguments);
            this.clientId = null;
            this.redirectUrl = null;
            this.scriptLoaded = false;
            this.scriptUrl = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
        }
        async initialize(clientId, redirectUrl) {
            this.clientId = clientId;
            this.redirectUrl = redirectUrl || null;
            if (clientId) {
                await this.loadAppleScript();
            }
        }
        async login(options) {
            if (!this.clientId) {
                throw new Error('Apple Client ID not set. Call initialize() first.');
            }
            if (!this.scriptLoaded) {
                throw new Error('Apple Sign-In script not loaded.');
            }
            return new Promise((resolve, reject) => {
                var _a;
                AppleID.auth.init({
                    clientId: this.clientId,
                    scope: ((_a = options.scopes) === null || _a === void 0 ? void 0 : _a.join(' ')) || 'name email',
                    redirectURI: this.redirectUrl || window.location.href,
                    state: options.state,
                    nonce: options.nonce,
                    usePopup: true,
                });
                AppleID.auth
                    .signIn()
                    .then((res) => {
                    var _a, _b, _c, _d, _e;
                    const result = {
                        profile: {
                            user: res.user || '',
                            email: ((_a = res.user) === null || _a === void 0 ? void 0 : _a.email) || null,
                            givenName: ((_c = (_b = res.user) === null || _b === void 0 ? void 0 : _b.name) === null || _c === void 0 ? void 0 : _c.firstName) || null,
                            familyName: ((_e = (_d = res.user) === null || _d === void 0 ? void 0 : _d.name) === null || _e === void 0 ? void 0 : _e.lastName) || null,
                        },
                        accessToken: {
                            token: res.authorization.id_token || '',
                        },
                        idToken: res.authorization.code || null,
                    };
                    resolve({ provider: 'apple', result });
                })
                    .catch((error) => {
                    reject(error);
                });
            });
        }
        async logout() {
            // Apple doesn't provide a logout method for web
            console.log('Apple logout: Session should be managed on the client side');
        }
        async isLoggedIn() {
            // Apple doesn't provide a method to check login status on web
            console.log('Apple login status should be managed on the client side');
            return { isLoggedIn: false };
        }
        async getAuthorizationCode() {
            // Apple authorization code should be obtained during login
            console.log('Apple authorization code should be stored during login');
            throw new Error('Apple authorization code not available');
        }
        async refresh() {
            // Apple doesn't provide a refresh method for web
            console.log('Apple refresh not available on web');
        }
        async loadAppleScript() {
            if (this.scriptLoaded)
                return;
            return this.loadScript(this.scriptUrl).then(() => {
                this.scriptLoaded = true;
            });
        }
    }

    class FacebookSocialLogin extends BaseSocialLogin {
        constructor() {
            super(...arguments);
            this.appId = null;
            this.scriptLoaded = false;
        }
        async initialize(appId) {
            this.appId = appId;
            if (appId) {
                await this.loadFacebookScript();
                FB.init({
                    appId: this.appId,
                    version: 'v17.0',
                    xfbml: true,
                    cookie: true,
                });
            }
        }
        async login(options) {
            if (!this.appId) {
                throw new Error('Facebook App ID not set. Call initialize() first.');
            }
            return new Promise((resolve, reject) => {
                FB.login((response) => {
                    if (response.status === 'connected') {
                        FB.api('/me', { fields: 'id,name,email,picture' }, (userInfo) => {
                            var _a, _b;
                            const result = {
                                accessToken: {
                                    token: response.authResponse.accessToken,
                                    userId: response.authResponse.userID,
                                },
                                profile: {
                                    userID: userInfo.id,
                                    name: userInfo.name,
                                    email: userInfo.email || null,
                                    imageURL: ((_b = (_a = userInfo.picture) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.url) || null,
                                    friendIDs: [],
                                    birthday: null,
                                    ageRange: null,
                                    gender: null,
                                    location: null,
                                    hometown: null,
                                    profileURL: null,
                                },
                                idToken: null,
                            };
                            resolve({ provider: 'facebook', result });
                        });
                    }
                    else {
                        reject(new Error('Facebook login failed'));
                    }
                }, { scope: options.permissions.join(',') });
            });
        }
        async logout() {
            return new Promise((resolve) => {
                FB.logout(() => resolve());
            });
        }
        async isLoggedIn() {
            return new Promise((resolve) => {
                FB.getLoginStatus((response) => {
                    resolve({ isLoggedIn: response.status === 'connected' });
                });
            });
        }
        async getAuthorizationCode() {
            return new Promise((resolve, reject) => {
                FB.getLoginStatus((response) => {
                    var _a;
                    if (response.status === 'connected') {
                        resolve({ jwt: ((_a = response.authResponse) === null || _a === void 0 ? void 0 : _a.accessToken) || '' });
                    }
                    else {
                        reject(new Error('No Facebook authorization code available'));
                    }
                });
            });
        }
        async refresh(options) {
            await this.login(options);
        }
        async loadFacebookScript() {
            if (this.scriptLoaded)
                return;
            return this.loadScript('https://connect.facebook.net/en_US/sdk.js').then(() => {
                this.scriptLoaded = true;
            });
        }
    }

    class GoogleSocialLogin extends BaseSocialLogin {
        constructor() {
            super(...arguments);
            this.clientId = null;
            this.loginType = 'online';
            this.GOOGLE_TOKEN_REQUEST_URL = 'https://www.googleapis.com/oauth2/v3/tokeninfo';
            this.GOOGLE_STATE_KEY = 'capgo_social_login_google_state';
        }
        async initialize(clientId, mode, hostedDomain, redirectUrl) {
            this.clientId = clientId;
            if (mode) {
                this.loginType = mode;
            }
            this.hostedDomain = hostedDomain;
            this.redirectUrl = redirectUrl;
        }
        async login(options) {
            if (!this.clientId) {
                throw new Error('Google Client ID not set. Call initialize() first.');
            }
            let scopes = options.scopes || [];
            if (scopes.length > 0) {
                // If scopes are provided, directly use the traditional OAuth flow
                if (!scopes.includes('https://www.googleapis.com/auth/userinfo.email')) {
                    scopes.push('https://www.googleapis.com/auth/userinfo.email');
                }
                if (!scopes.includes('https://www.googleapis.com/auth/userinfo.profile')) {
                    scopes.push('https://www.googleapis.com/auth/userinfo.profile');
                }
                if (!scopes.includes('openid')) {
                    scopes.push('openid');
                }
            }
            else {
                scopes = [
                    'https://www.googleapis.com/auth/userinfo.email',
                    'https://www.googleapis.com/auth/userinfo.profile',
                    'openid',
                ];
            }
            const nonce = options.nonce || Math.random().toString(36).substring(2);
            // If scopes are provided, directly use the traditional OAuth flow
            return this.traditionalOAuth({
                scopes,
                nonce,
                hostedDomain: this.hostedDomain,
            });
        }
        async logout() {
            if (this.loginType === 'offline') {
                return Promise.reject("Offline login doesn't store tokens. logout is not available");
            }
            // eslint-disable-next-line
            const state = this.getGoogleState();
            if (!state)
                return;
            await this.rawLogoutGoogle(state.accessToken);
        }
        async isLoggedIn() {
            if (this.loginType === 'offline') {
                return Promise.reject("Offline login doesn't store tokens. isLoggedIn is not available");
            }
            // eslint-disable-next-line
            const state = this.getGoogleState();
            if (!state)
                return { isLoggedIn: false };
            try {
                const isValidAccessToken = await this.accessTokenIsValid(state.accessToken);
                const isValidIdToken = this.idTokenValid(state.idToken);
                if (isValidAccessToken && isValidIdToken) {
                    return { isLoggedIn: true };
                }
                else {
                    try {
                        await this.rawLogoutGoogle(state.accessToken, false);
                    }
                    catch (e) {
                        console.error('Access token is not valid, but cannot logout', e);
                    }
                    return { isLoggedIn: false };
                }
            }
            catch (e) {
                return Promise.reject(e);
            }
        }
        async getAuthorizationCode() {
            if (this.loginType === 'offline') {
                return Promise.reject("Offline login doesn't store tokens. getAuthorizationCode is not available");
            }
            // eslint-disable-next-line
            const state = this.getGoogleState();
            if (!state)
                throw new Error('No Google authorization code available');
            try {
                const isValidAccessToken = await this.accessTokenIsValid(state.accessToken);
                const isValidIdToken = this.idTokenValid(state.idToken);
                if (isValidAccessToken && isValidIdToken) {
                    return { accessToken: state.accessToken, jwt: state.idToken };
                }
                else {
                    try {
                        await this.rawLogoutGoogle(state.accessToken, false);
                    }
                    catch (e) {
                        console.error('Access token is not valid, but cannot logout', e);
                    }
                    throw new Error('No Google authorization code available');
                }
            }
            catch (e) {
                return Promise.reject(e);
            }
        }
        async refresh() {
            // For Google, we can prompt for re-authentication
            return Promise.reject('Not implemented');
        }
        handleOAuthRedirect(url) {
            const paramsRaw = url.searchParams;
            const code = paramsRaw.get('code');
            if (code && paramsRaw.has('scope')) {
                return {
                    provider: 'google',
                    result: {
                        serverAuthCode: code,
                        responseType: 'offline',
                    },
                };
            }
            const hash = url.hash.substring(1);
            console.log('handleOAuthRedirect', url.hash);
            if (!hash)
                return null;
            console.log('handleOAuthRedirect ok');
            const params = new URLSearchParams(hash);
            const accessToken = params.get('access_token');
            const idToken = params.get('id_token');
            if (accessToken && idToken) {
                localStorage.removeItem(BaseSocialLogin.OAUTH_STATE_KEY);
                const profile = this.parseJwt(idToken);
                return {
                    provider: 'google',
                    result: {
                        accessToken: {
                            token: accessToken,
                        },
                        idToken,
                        profile: {
                            email: profile.email || null,
                            familyName: profile.family_name || null,
                            givenName: profile.given_name || null,
                            id: profile.sub || null,
                            name: profile.name || null,
                            imageUrl: profile.picture || null,
                        },
                        responseType: 'online',
                    },
                };
            }
            return null;
        }
        async accessTokenIsValid(accessToken) {
            const url = `${this.GOOGLE_TOKEN_REQUEST_URL}?access_token=${encodeURIComponent(accessToken)}`;
            try {
                // Make the GET request using fetch
                const response = await fetch(url);
                // Check if the response is successful
                if (!response.ok) {
                    console.log(`Invalid response from ${this.GOOGLE_TOKEN_REQUEST_URL}. Response not successful. Status code: ${response.status}. Assuming that the token is not valid`);
                    return false;
                }
                // Get the response body as text
                const responseBody = await response.text();
                if (!responseBody) {
                    console.error(`Invalid response from ${this.GOOGLE_TOKEN_REQUEST_URL}. Response body is null`);
                    throw new Error(`Invalid response from ${this.GOOGLE_TOKEN_REQUEST_URL}. Response body is null`);
                }
                // Parse the response body as JSON
                let jsonObject;
                try {
                    jsonObject = JSON.parse(responseBody);
                }
                catch (e) {
                    console.error(`Invalid response from ${this.GOOGLE_TOKEN_REQUEST_URL}. Response body is not valid JSON. Error: ${e}`);
                    throw new Error(`Invalid response from ${this.GOOGLE_TOKEN_REQUEST_URL}. Response body is not valid JSON. Error: ${e}`);
                }
                // Extract the 'expires_in' field
                const expiresInStr = jsonObject['expires_in'];
                if (expiresInStr === undefined || expiresInStr === null) {
                    console.error(`Invalid response from ${this.GOOGLE_TOKEN_REQUEST_URL}. Response JSON does not include 'expires_in'.`);
                    throw new Error(`Invalid response from ${this.GOOGLE_TOKEN_REQUEST_URL}. Response JSON does not include 'expires_in'.`);
                }
                // Parse 'expires_in' as an integer
                let expiresInInt;
                try {
                    expiresInInt = parseInt(expiresInStr, 10);
                    if (isNaN(expiresInInt)) {
                        throw new Error(`'expires_in' is not a valid integer`);
                    }
                }
                catch (e) {
                    console.error(`Invalid response from ${this.GOOGLE_TOKEN_REQUEST_URL}. 'expires_in': ${expiresInStr} is not a valid integer. Error: ${e}`);
                    throw new Error(`Invalid response from ${this.GOOGLE_TOKEN_REQUEST_URL}. 'expires_in': ${expiresInStr} is not a valid integer. Error: ${e}`);
                }
                // Determine if the access token is valid based on 'expires_in'
                return expiresInInt > 5;
            }
            catch (error) {
                console.error(error);
                throw error;
            }
        }
        idTokenValid(idToken) {
            try {
                const parsed = this.parseJwt(idToken);
                const currentTime = Math.ceil(Date.now() / 1000) + 5; // Convert current time to seconds since epoch
                return parsed.exp && currentTime < parsed.exp;
            }
            catch (e) {
                return false;
            }
        }
        async rawLogoutGoogle(accessToken, tokenValid = null) {
            if (tokenValid === null) {
                tokenValid = await this.accessTokenIsValid(accessToken);
            }
            if (tokenValid === true) {
                try {
                    await fetch(`https://accounts.google.com/o/oauth2/revoke?token=${encodeURIComponent(accessToken)}`);
                    this.clearStateGoogle();
                }
                catch (e) {
                    // ignore
                }
                return;
            }
            else {
                this.clearStateGoogle();
                return;
            }
        }
        persistStateGoogle(accessToken, idToken) {
            try {
                window.localStorage.setItem(this.GOOGLE_STATE_KEY, JSON.stringify({ accessToken, idToken }));
            }
            catch (e) {
                console.error('Cannot persist state google', e);
            }
        }
        clearStateGoogle() {
            try {
                window.localStorage.removeItem(this.GOOGLE_STATE_KEY);
            }
            catch (e) {
                console.error('Cannot clear state google', e);
            }
        }
        getGoogleState() {
            try {
                const state = window.localStorage.getItem(this.GOOGLE_STATE_KEY);
                if (!state)
                    return null;
                const { accessToken, idToken } = JSON.parse(state);
                return { accessToken, idToken };
            }
            catch (e) {
                console.error('Cannot get state google', e);
                return null;
            }
        }
        async traditionalOAuth({ scopes, hostedDomain, nonce, }) {
            const uniqueScopes = [...new Set([...(scopes || []), 'openid'])];
            const params = new URLSearchParams(Object.assign(Object.assign({ client_id: this.clientId, redirect_uri: this.redirectUrl || window.location.origin + window.location.pathname, response_type: this.loginType === 'offline' ? 'code' : 'token id_token', scope: uniqueScopes.join(' ') }, (nonce && { nonce })), { include_granted_scopes: 'true', state: 'popup' }));
            if (hostedDomain !== undefined) {
                params.append('hd', hostedDomain);
            }
            const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
            const width = 500;
            const height = 600;
            const left = window.screenX + (window.outerWidth - width) / 2;
            const top = window.screenY + (window.outerHeight - height) / 2;
            localStorage.setItem(BaseSocialLogin.OAUTH_STATE_KEY, 'true');
            const popup = window.open(url, 'Google Sign In', `width=${width},height=${height},left=${left},top=${top},popup=1`);
            let popupClosedInterval;
            let timeoutHandle;
            // This may never return...
            return new Promise((resolve, reject) => {
                if (!popup) {
                    reject(new Error('Failed to open popup'));
                    return;
                }
                const handleMessage = (event) => {
                    var _a, _b, _c;
                    if (event.origin !== window.location.origin || ((_b = (_a = event.data) === null || _a === void 0 ? void 0 : _a.source) === null || _b === void 0 ? void 0 : _b.startsWith('angular')))
                        return;
                    if (((_c = event.data) === null || _c === void 0 ? void 0 : _c.type) === 'oauth-response') {
                        window.removeEventListener('message', handleMessage);
                        clearInterval(popupClosedInterval);
                        if (this.loginType === 'online') {
                            const { accessToken, idToken } = event.data;
                            if (accessToken && idToken) {
                                const profile = this.parseJwt(idToken);
                                this.persistStateGoogle(accessToken.token, idToken);
                                resolve({
                                    provider: 'google',
                                    result: {
                                        accessToken: {
                                            token: accessToken.token,
                                        },
                                        idToken,
                                        profile: {
                                            email: profile.email || null,
                                            familyName: profile.family_name || null,
                                            givenName: profile.given_name || null,
                                            id: profile.sub || null,
                                            name: profile.name || null,
                                            imageUrl: profile.picture || null,
                                        },
                                        responseType: 'online',
                                    },
                                });
                            }
                        }
                        else {
                            const { serverAuthCode } = event.data;
                            resolve({
                                provider: 'google',
                                result: {
                                    responseType: 'offline',
                                    serverAuthCode,
                                },
                            });
                        }
                    }
                    // Don't reject for non-OAuth messages, just ignore them
                };
                window.addEventListener('message', handleMessage);
                // Timeout after 5 minutes
                timeoutHandle = setTimeout(() => {
                    clearTimeout(timeoutHandle);
                    window.removeEventListener('message', handleMessage);
                    popup.close();
                    reject(new Error('OAuth timeout'));
                }, 300000);
                popupClosedInterval = setInterval(() => {
                    if (popup.closed) {
                        clearInterval(popupClosedInterval);
                        reject(new Error('Popup closed'));
                    }
                }, 1000);
            });
        }
    }

    class SocialLoginWeb extends core.WebPlugin {
        constructor() {
            var _a;
            super();
            this.googleProvider = new GoogleSocialLogin();
            this.appleProvider = new AppleSocialLogin();
            this.facebookProvider = new FacebookSocialLogin();
            // Set up listener for OAuth redirects if we have a pending OAuth flow
            if (localStorage.getItem(SocialLoginWeb.OAUTH_STATE_KEY)) {
                console.log('OAUTH_STATE_KEY found');
                const result = this.handleOAuthRedirect();
                if (result) {
                    (_a = window.opener) === null || _a === void 0 ? void 0 : _a.postMessage(Object.assign({ type: 'oauth-response' }, result.result), window.location.origin);
                    window.close();
                }
            }
        }
        handleOAuthRedirect() {
            const url = new URL(window.location.href);
            return this.googleProvider.handleOAuthRedirect(url);
        }
        async initialize(options) {
            var _a, _b, _c;
            const initPromises = [];
            if ((_a = options.google) === null || _a === void 0 ? void 0 : _a.webClientId) {
                initPromises.push(this.googleProvider.initialize(options.google.webClientId, options.google.mode, options.google.hostedDomain, options.google.redirectUrl));
            }
            if ((_b = options.apple) === null || _b === void 0 ? void 0 : _b.clientId) {
                initPromises.push(this.appleProvider.initialize(options.apple.clientId, options.apple.redirectUrl));
            }
            if ((_c = options.facebook) === null || _c === void 0 ? void 0 : _c.appId) {
                initPromises.push(this.facebookProvider.initialize(options.facebook.appId));
            }
            await Promise.all(initPromises);
        }
        async login(options) {
            switch (options.provider) {
                case 'google':
                    return this.googleProvider.login(options.options);
                case 'apple':
                    return this.appleProvider.login(options.options);
                case 'facebook':
                    return this.facebookProvider.login(options.options);
                default:
                    throw new Error(`Login for ${options.provider} is not implemented on web`);
            }
        }
        async logout(options) {
            switch (options.provider) {
                case 'google':
                    return this.googleProvider.logout();
                case 'apple':
                    return this.appleProvider.logout();
                case 'facebook':
                    return this.facebookProvider.logout();
                default:
                    throw new Error(`Logout for ${options.provider} is not implemented`);
            }
        }
        async isLoggedIn(options) {
            switch (options.provider) {
                case 'google':
                    return this.googleProvider.isLoggedIn();
                case 'apple':
                    return this.appleProvider.isLoggedIn();
                case 'facebook':
                    return this.facebookProvider.isLoggedIn();
                default:
                    throw new Error(`isLoggedIn for ${options.provider} is not implemented`);
            }
        }
        async getAuthorizationCode(options) {
            switch (options.provider) {
                case 'google':
                    return this.googleProvider.getAuthorizationCode();
                case 'apple':
                    return this.appleProvider.getAuthorizationCode();
                case 'facebook':
                    return this.facebookProvider.getAuthorizationCode();
                default:
                    throw new Error(`getAuthorizationCode for ${options.provider} is not implemented`);
            }
        }
        async refresh(options) {
            switch (options.provider) {
                case 'google':
                    return this.googleProvider.refresh();
                case 'apple':
                    return this.appleProvider.refresh();
                case 'facebook':
                    return this.facebookProvider.refresh(options.options);
                default:
                    throw new Error(`Refresh for ${options.provider} is not implemented`);
            }
        }
        async providerSpecificCall(options) {
            throw new Error(`Provider specific call for ${options.call} is not implemented`);
        }
    }
    SocialLoginWeb.OAUTH_STATE_KEY = 'social_login_oauth_pending';

    var web = /*#__PURE__*/Object.freeze({
        __proto__: null,
        SocialLoginWeb: SocialLoginWeb
    });

    exports.SocialLogin = SocialLogin;

    return exports;

})({}, capacitorExports);
//# sourceMappingURL=plugin.js.map
