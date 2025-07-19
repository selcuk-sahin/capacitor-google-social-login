import { BaseSocialLogin } from './base';
import type { AppleProviderOptions, AuthorizationCode, LoginResult } from './definitions';
export declare class AppleSocialLogin extends BaseSocialLogin {
    private clientId;
    private redirectUrl;
    private scriptLoaded;
    private scriptUrl;
    initialize(clientId: string | null, redirectUrl: string | null | undefined): Promise<void>;
    login(options: AppleProviderOptions): Promise<LoginResult>;
    logout(): Promise<void>;
    isLoggedIn(): Promise<{
        isLoggedIn: boolean;
    }>;
    getAuthorizationCode(): Promise<AuthorizationCode>;
    refresh(): Promise<void>;
    private loadAppleScript;
}
