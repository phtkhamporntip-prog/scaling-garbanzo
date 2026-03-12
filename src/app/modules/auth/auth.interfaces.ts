export type TLoginPayload = {
    email: string;
    password: string;
};

export type TProviderName = "google" | "github" | "microsoft" | "oidc";

export type TOAuthProfile = {
    providerAccountId: string;
    email: string;
    name: string;
    image?: string;
    emailVerified?: boolean;
};

export type TAuthTokens = {
    accessToken: string;
    refreshToken: string;
};

export type TBootstrapAdminPayload = {
    secret: string;
    name: string;
    email: string;
    password: string;
    contactNo: string;
    address?: string;
    profileImg?: string;
};
