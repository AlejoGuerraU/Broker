import React from 'react'

interface SelectOption {
  label: string
  value: string
  disabled?: boolean
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[]
}

const baseClassName =
  'h-11 w-full rounded-xl border border-[var(--bg-border)] bg-[#10141A] px-4 text-sm text-[var(--bg-text)] outline-none transition-colors focus:border-[#3A404A] disabled:cursor-not-allowed disabled:opacity-60'

const Index = ({ options, className = '', ...props }: SelectProps) => {
  return (
    <select className={`${baseClassName} ${className}`.trim()} {...props}>
      {options.map((option) => (
        <option key={option.value} value={option.value} disabled={option.disabled}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

export default Index
