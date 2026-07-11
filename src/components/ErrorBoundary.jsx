import { Component } from 'react'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          background: '#F5F3EC',
          color: '#0F2E28',
          fontFamily: 'monospace',
          padding: '24px',
        }}>
          <h1 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>
            Something broke — here's why:
          </h1>
          <pre style={{
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            background: 'white',
            padding: '12px',
            borderRadius: '8px',
            fontSize: '13px',
            border: '1px solid #D8D3C4',
          }}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
