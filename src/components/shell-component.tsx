import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { HeadContent, Scripts } from "@tanstack/react-router"
import { Suspense } from "react"
import { LoadingPage } from "@/components/pages/loading-page"

const queryClient = new QueryClient({
  defaultOptions: { queries: { experimental_prefetchInRender: true } },
})

type Props = { children: React.ReactNode }

export function ShellComponent(props: Props) {
  return (
    <html lang={"ja"}>
      <head>
        <HeadContent />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <Suspense fallback={<LoadingPage />}>{props.children}</Suspense>
        </QueryClientProvider>
        <Scripts />
      </body>
    </html>
  )
}
