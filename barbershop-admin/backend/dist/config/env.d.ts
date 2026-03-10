export declare const env: {
    NODE_ENV: "development" | "production" | "test";
    PORT: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    JWT_REFRESH_SECRET: string;
    JWT_REFRESH_EXPIRES_IN: string;
    CORS_ORIGIN: string;
    RATE_LIMIT_WINDOW_MS: string;
    RATE_LIMIT_MAX_REQUESTS: string;
    LOG_LEVEL: "error" | "warn" | "info" | "debug";
    SMTP_HOST?: string | undefined;
    SMTP_PORT?: string | undefined;
    SMTP_SECURE?: "true" | "false" | undefined;
    SMTP_USER?: string | undefined;
    SMTP_PASS?: string | undefined;
    SMTP_FROM_EMAIL?: string | undefined;
    SMTP_FROM_NAME?: string | undefined;
    WITHDRAWAL_NOTIFY_EMAIL?: string | undefined;
    WITHDRAWAL_TIMEZONE?: string | undefined;
    SUPPORT_PHONE?: string | undefined;
};
//# sourceMappingURL=env.d.ts.map