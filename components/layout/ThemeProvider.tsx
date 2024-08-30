"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
    return (
        <NextThemesProvider {...props}>
            <ThemeWrapper>{children}</ThemeWrapper>
        </NextThemesProvider>
    )
}

function ThemeWrapper({ children }: { children: React.ReactNode }) {
    const { resolvedTheme } = useTheme()

    React.useEffect(() => {
        const htmlElement = document.documentElement

        if (resolvedTheme === "dark") {
            htmlElement.classList.add("dark-theme", "dark-mode")
        } else {
            htmlElement.classList.remove("dark-theme", "dark-mode")
        }
    }, [resolvedTheme])

    return <>{children}</>
}
