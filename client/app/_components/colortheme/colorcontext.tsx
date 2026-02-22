import { DefinedColors, mainTheme } from "@/app/_theme/maintheme";
import { Context, createContext } from "react";

export const ColorContext: Context<DefinedColors> = createContext(mainTheme);