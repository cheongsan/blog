import { AppPropsWithLayout } from "types"
import { Hydrate, QueryClientProvider } from "@tanstack/react-query"
import { Red_Hat_Display } from "next/font/google"
import RootLayout from "./layout"
import "@radix-ui/colors/gray.css"
import "@radix-ui/colors/gray-dark.css"
import "styles/global.css";
import "styles/theme.css"
import "styles/colour.css";
import { queryClient } from "lib/react-query"

// theme.css asked for 'Red Hat Display' by name but nothing ever loaded it, so
// it only rendered on machines that happen to have it installed — every other
// visitor, iOS included, silently got the system sans-serif. Self-hosted here
// via next/font: one variable file covers every weight the site uses.
const redHatDisplay = Red_Hat_Display({
  subsets: ["latin"],
  display: "swap",
})

function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout || ((page) => page)

  return (
    <QueryClientProvider client={queryClient}>
      {/* On :root rather than a wrapper, so Radix portals — dropdowns,
          popovers, tooltips — render in the same face as the page. next/font
          cannot be used in _document, so the variable is set from here. */}
      <style jsx global>{`
        :root {
          --font-red-hat-display: ${redHatDisplay.style.fontFamily};
        }
      `}</style>
      <Hydrate state={pageProps.dehydratedState}>
        <RootLayout>{getLayout(<Component {...pageProps} />)}</RootLayout>
      </Hydrate>
    </QueryClientProvider>
  )
}

export default App
