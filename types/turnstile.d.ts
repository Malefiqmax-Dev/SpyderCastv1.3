interface TurnstileRenderOptions {
  sitekey: string
  callback: (token: string) => void
  theme?: "light" | "dark" | "auto"
}

interface Turnstile {
  render: (container: HTMLElement, options: TurnstileRenderOptions) => string
}

declare global {
  interface Window {
    turnstile?: Turnstile
  }
}

export {}
