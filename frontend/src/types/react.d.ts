import * as React from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elemName: string]: any
    }
  }
  
  interface Window {
    navigateToSectionById?: (id: string) => void
  }
} 