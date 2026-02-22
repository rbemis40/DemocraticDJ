interface Colors {
    [color: string]: string;
}

export interface AppTheme {
    colors: Colors;
}

export const mainTheme: AppTheme = {
    colors: {
        pinkHighlight: "#E8A3FF",
        pinkGlow: "#BA1FEE",

        cyanHighlight: "#C5FBFF",
        cyanGlow: "#17F0FF",

        uiContainerBg: "#2d284f",
    }
};