import { BaseSocialLogin } from './base';
import type { GoogleLoginOptions, LoginResult, ProviderResponseMap, AuthorizationCode } from './definitions';
export declare class GoogleSocialLogin extends BaseSocialLogin {
    private clientId;
    private hostedDomain?;
    private loginType;
    private redirectUrl?;
    private GOOGLE_TOKEN_REQUEST_URL;
    private readonly GOOGLE_STATE_KEY;
    initialize(clientId: string | null, mode?: 'online' | 'offline', hostedDomain?: string | null, redirectUrl?: string): Promise<void>;
    login<T extends 'google'>(options: GoogleLoginOptions): Promise<{
        provider: T;
        result: ProviderResponseMap[T];
    }>;
    logout(): Promise<void>;
    isLoggedIn(): Promise<{
        isLoggedIn: boolean;
    }>;
    getAuthorizationCode(): Promise<AuthorizationCode>;
    refresh(): Promise<void>;
    handleOAuthRedirect(url: URL): LoginResult | null;
    private accessTokenIsValid;
    private idTokenValid;
    private rawLogoutGoogle;
    private persistStateGoogle;
    private clearStateGoogle;
    private getGoogleState;
    private traditionalOAuth;
}
