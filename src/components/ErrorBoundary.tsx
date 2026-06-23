import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  errorMessage: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, errorMessage: '' }
  }

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }

  componentDidCatch(error: unknown, info: { componentStack: string }) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReset = () => {
    this.setState({ hasError: false, errorMessage: '' })
    this.props.onReset?.()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="text-4xl" aria-hidden="true">
            ⚠️
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Something went wrong</h2>
          <p className="max-w-sm text-gray-600">{this.state.errorMessage}</p>
          <button
            onClick={this.handleReset}
            className="rounded-lg bg-purple-600 px-6 py-3 font-medium text-white hover:bg-purple-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2"
          >
            Start over
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
