export function BentoCard({ title, icon, children, colSpan = "col-span-12" }) {
    return (
        <div className={`bg-white rounded-2xl p-5 shadow-sm border border-gray-100 h-full ${colSpan}`}>
            <div className="flex items-center gap-2 mb-4 border-b pb-3">
                <div className="p-1.5 bg-gray-50 rounded-lg">{icon}</div>
                <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">{title}</h3>
            </div>
            {children}
        </div>
    )
}

export function InputGroup({ label, name, val, onChange, type="text", placeholder="" }) {
  return (
    <div>
        <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">{label}</label>
        <input 
            type={type} name={name} value={val || ''} 
            onChange={onChange} placeholder={placeholder} 
            className="w-full border p-2.5 rounded-lg text-sm text-gray-800 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
        />
    </div>
  )
}