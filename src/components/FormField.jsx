function FormField({ label, ...props }) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-ink/80">{label}</span>
      <input
        {...props}
        className="mt-1.5 w-full rounded-lg border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-ink/35 focus:border-teal outline-none transition-colors"
      />
    </label>
  )
}

export default FormField
