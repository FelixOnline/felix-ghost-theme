declare module "@tryghost/admin-api" {
    interface GhostAdminAPIOptions {
        url: string;
        key: string;
        version: "v5.0" | string;
    }

    interface ThemeUploadOptions {
        file: string;
    }

    interface Theme {
        name: string;
        package?: {
            name: string;
            version: string;
        };
        active: boolean;
        [key: string]: any;
    }

    interface GhostAPIError {
        message: string;
        context?: string;
        type?: string;
        // ... other potential error fields
    }

    interface GhostAPIFullError {
        response?: {
            data?: {
                errors?: GhostAPIError[];
            };
        };
        message?: string; // For non-API specific errors or fallback
        [key: string]: any;
    }


    class GhostAdminAPI {
        constructor(options: GhostAdminAPIOptions);

        themes: {
            upload: (options: { file: string }) => Promise<Theme | undefined>;
            activate: (themeName: string) => Promise<Theme | undefined>;
        };
    }

    export = GhostAdminAPI;
}