export default function Input({ label, type='text', className='', ...props }) {
  return (
    <label className="block">
      {label && <span className="label">{label}</span>}
      <input type={type} className={`input ${className}`} {...props} />
    </label>
  )
}

