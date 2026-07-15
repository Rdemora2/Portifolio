import "react"

/* eslint-disable @typescript-eslint/no-unused-vars -- declaration merging must preserve React's generic names */
declare module "react" {
  interface FormHTMLAttributes<T> {
    toolname?: string
    tooldescription?: string
    toolautosubmit?: boolean
  }

  interface InputHTMLAttributes<T> {
    toolparamdescription?: string
  }

  interface SelectHTMLAttributes<T> {
    toolparamdescription?: string
  }

  interface TextareaHTMLAttributes<T> {
    toolparamdescription?: string
  }
}
