export default function FieldGroup({ label, children, hint }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <label style={{ fontSize:12, color:'rgba(255,255,255,0.5)',
        textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:6 }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:5 }}>{hint}</p>}
    </div>
  )
}
