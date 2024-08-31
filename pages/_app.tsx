import { AppPropsWithLayout } from "types"
import { Hydrate, QueryClientProvider } from "@tanstack/react-query"
import RootLayout from "./layout"
import "@radix-ui/colors/gray.css"
import "@radix-ui/colors/gray-dark.css"
import "styles/global.css";
import "styles/theme.css"
import "styles/colour.css";
import { queryClient } from "lib/react-query"

function App({ Component, pageProps }: AppPropsWithLayout) {
  const getLayout = Component.getLayout || ((page) => page)

  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <RootLayout>{getLayout(<Component {...pageProps} />)}</RootLayout>
      </Hydrate>
    </QueryClientProvider>
  )
}

export default App
