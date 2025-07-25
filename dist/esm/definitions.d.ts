export interface InitializeOptions {
    facebook?: {
        /**
         * Facebook App ID, provided by Facebook for web, in mobile it's set in the native files
         */
        appId: string;
        /**
         * Facebook Client Token, provided by Facebook for web, in mobile it's set in the native files
         */
        clientToken?: string;
    };
    google?: {
        /**
         * The app's client ID, found and created in the Google Developers Console.
         * Required for iOS platform.
         * @example xxxxxx-xxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
         * @since 3.1.0
         */
        iOSClientId?: string;
        /**
         * The app's server client ID, required for offline mode on iOS.
         * Should be the same value as webClientId.
         * Found and created in the Google Developers Console.
         * @example xxxxxx-xxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
         * @since 3.1.0
         */
        iOSServerClientId?: string;
        /**
         * The app's web client ID, found and created in the Google Developers Console.
         * Required for Android and Web platforms.
         * @example xxxxxx-xxxxxxxxxxxxxxxxxx.apps.googleusercontent.com
         * @since 3.1.0
         */
        webClientId?: string;
        /**
         * The login mode, can be online or offline.
         * - online: Returns user profile data and access tokens (default)
         * - offline: Returns only serverAuthCode for backend authentication, no user profile data
         * Note: offline mode requires iOSServerClientId to be set on iOS
         * @example offline
         * @since 3.1.0
         */
        mode?: 'online' | 'offline';
        /**
         * Filter visible accounts by hosted domain
         * @description filter visible accounts by hosted domain
         */
        hostedDomain?: string;
        /**
         * Google Redirect URL, should be your backend url that is configured in your google app
         */
        redirectUrl?: string;
    };
    apple?: {
        /**
         * Apple Client ID, provided by Apple for web and Android
         */
        clientId?: string;
        /**
         * Apple Redirect URL, should be your backend url that is configured in your apple app, only for android
         */
        redirectUrl?: string;
    };
}
export interface FacebookLoginOptions {
    /**
     * Permissions
     * @description select permissions to login with
     */
    permissions: string[];
    /**
     * Is Limited Login
     * @description use limited login for Facebook IOS
     * @default false
     */
    limitedLogin?: boolean;
    /**
     * Nonce
     * @description A custom nonce to use for the login request
     */
    nonce?: string;
}
export interface GoogleLoginOptions {
    /**
     * Specifies the scopes required for accessing Google APIs
     * The default is defined in the configuration.
     * @example ["profile", "email"]
     * @see [Google OAuth2 Scopes](https://developers.google.com/identity/protocols/oauth2/scopes)
     */
    scopes?: string[];
    /**
     * Nonce
     * @description nonce
     */
    nonce?: string;
    /**
     * Force refresh token (only for Android)
     * @description force refresh token
     * @default false
     */
    forceRefreshToken?: boolean;
    /**
     * Force account selection prompt (iOS)
     * @description forces the account selection prompt to appear on iOS
     * @default false
     */
    forcePrompt?: boolean;
    /**
     * Style
     * @description style
     * @default 'standard'
     */
    style?: 'bottom' | 'standard';
}
export interface GoogleLoginResponseOnline {
    accessToken: AccessToken | null;
    idToken: string | null;
    profile: {
        email: string | null;
        familyName: string | null;
        givenName: string | null;
        id: string | null;
        name: string | null;
        imageUrl: string | null;
    };
    responseType: 'online';
}
export interface GoogleLoginResponseOffline {
    serverAuthCode: string;
    responseType: 'offline';
}
export type GoogleLoginResponse = GoogleLoginResponseOnline | GoogleLoginResponseOffline;
export interface AppleProviderOptions {
    /**
     * Scopes
     * @description An array of scopes to request during login
     * @example ["name", "email"]
     * default: ["name", "email"]
     */
    scopes?: string[];
    /**
     * Nonce
     * @description nonce
     */
    nonce?: string;
    /**
     * State
     * @description state
     */
    state?: string;
}
export interface AppleProviderResponse {
    accessToken: AccessToken | null;
    idToken: string | null;
    profile: {
        user: string;
        email: string | null;
        givenName: string | null;
        familyName: string | null;
    };
}
export type LoginOptions = {
    provider: 'facebook';
    options: FacebookLoginOptions;
} | {
    provider: 'google';
    options: GoogleLoginOptions;
} | {
    provider: 'apple';
    options: AppleProviderOptions;
};
export type LoginResult = {
    provider: 'facebook';
    result: FacebookLoginResponse;
} | {
    provider: 'google';
    result: GoogleLoginResponse;
} | {
    provider: 'apple';
    result: AppleProviderResponse;
};
export interface AccessToken {
    applicationId?: string;
    declinedPermissions?: string[];
    expires?: string;
    isExpired?: boolean;
    lastRefresh?: string;
    permissions?: string[];
    token: string;
    refreshToken?: string;
    userId?: string;
}
export interface FacebookLoginResponse {
    accessToken: AccessToken | null;
    idToken: string | null;
    profile: {
        userID: string;
        email: string | null;
        friendIDs: string[];
        birthday: string | null;
        ageRange: {
            min?: number;
            max?: number;
        } | null;
        gender: string | null;
        location: {
            id: string;
            name: string;
        } | null;
        hometown: {
            id: string;
            name: string;
        } | null;
        profileURL: string | null;
        name: string | null;
        imageURL: string | null;
    };
}
export interface AuthorizationCode {
    /**
     * Jwt
     * @description A JSON web token
     */
    jwt?: string;
    /**
     * Access Token
     * @description An access token
     */
    accessToken?: string;
}
export interface AuthorizationCodeOptions {
    /**
     * Provider
     * @description Provider for the authorization code
     */
    provider: 'apple' | 'google' | 'facebook';
}
export interface isLoggedInOptions {
    /**
     * Provider
     * @description Provider for the isLoggedIn
     */
    provider: 'apple' | 'google' | 'facebook';
}
export type ProviderSpecificCall = 'facebook#getProfile' | 'facebook#requestTracking';
export interface FacebookGetProfileOptions {
    /**
     * Fields to retrieve from Facebook profile
     * @example ["id", "name", "email", "picture"]
     */
    fields?: string[];
}
export interface FacebookGetProfileResponse {
    /**
     * Facebook profile data
     */
    profile: {
        id: string | null;
        name: string | null;
        email: string | null;
        first_name: string | null;
        last_name: string | null;
        picture?: {
            data: {
                height: number | null;
                is_silhouette: boolean | null;
                url: string | null;
                width: number | null;
            };
        } | null;
        [key: string]: any;
    };
}
export type FacebookRequestTrackingOptions = Record<string, never>;
export interface FacebookRequestTrackingResponse {
    /**
     * App tracking authorization status
     */
    status: 'authorized' | 'denied' | 'notDetermined' | 'restricted';
}
export type ProviderSpecificCallOptionsMap = {
    'facebook#getProfile': FacebookGetProfileOptions;
    'facebook#requestTracking': FacebookRequestTrackingOptions;
};
export type ProviderSpecificCallResponseMap = {
    'facebook#getProfile': FacebookGetProfileResponse;
    'facebook#requestTracking': FacebookRequestTrackingResponse;
};
export type ProviderResponseMap = {
    facebook: FacebookLoginResponse;
    google: GoogleLoginResponse;
    apple: AppleProviderResponse;
};
export interface SocialLoginPlugin {
    /**
     * Initialize the plugin
     * @description initialize the plugin with the required options
     */
    initialize(options: InitializeOptions): Promise<void>;
    /**
     * Login with the selected provider
     * @description login with the selected provider
     */
    login<T extends LoginOptions['provider']>(options: Extract<LoginOptions, {
        provider: T;
    }>): Promise<{
        provider: T;
        result: ProviderResponseMap[T];
    }>;
    /**
     * Logout
     * @description logout the user
     */
    logout(options: {
        provider: 'apple' | 'google' | 'facebook';
    }): Promise<void>;
    /**
     * IsLoggedIn
     * @description logout the user
     */
    isLoggedIn(options: isLoggedInOptions): Promise<{
        isLoggedIn: boolean;
    }>;
    /**
     * Get the current access token
     * @description get the current access token
     */
    getAuthorizationCode(options: AuthorizationCodeOptions): Promise<AuthorizationCode>;
    /**
     * Refresh the access token
     * @description refresh the access token
     */
    refresh(options: LoginOptions): Promise<void>;
    /**
     * Execute provider-specific calls
     * @description Execute a provider-specific functionality
     */
    providerSpecificCall<T extends ProviderSpecificCall>(options: {
        call: T;
        options: ProviderSpecificCallOptionsMap[T];
    }): Promise<ProviderSpecificCallResponseMap[T]>;
}
