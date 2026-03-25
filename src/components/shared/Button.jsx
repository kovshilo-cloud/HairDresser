export default function Button({ children, variant = 'primary', className = '', ...props }) {
  const base = 'px-4 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = {
    primary: 'bg-rose-500 text-white hover:bg-rose-600',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-500 text-white hover:bg-red-600',
    ghost: 'text-gray-500 hover:text-gray-800',
  }
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
