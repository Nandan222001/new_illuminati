export default function SectionHead({ title, sub, right, size }) {
  return (
    <div className="sec-head">
      <div>
        <h2 className="sec-title" style={size ? { fontSize: size } : undefined}>{title}</h2>
        {sub && <p className="sec-sub">{sub}</p>}
      </div>
      {right}
    </div>
  )
}
