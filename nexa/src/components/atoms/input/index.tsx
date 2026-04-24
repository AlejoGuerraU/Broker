import React from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  type: React.HTMLInputTypeAttribute
}

const baseClassName =
  'h-11 w-full rounded-xl border border-[var(--bg-border)] bg-[#10141A] px-4 text-sm text-[var(--bg-text)] outline-none transition-colors placeholder:text-[var(--bg-muted)] focus:border-[#3A404A] disabled:cursor-not-allowed disabled:opacity-60'

const Index = ({ type, className = '', ...props }: InputProps) => {
  return <input type={type} className={`${baseClassName} ${className}`.trim()} {...props} />
}

export default Index
