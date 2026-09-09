export default function SectionHead({ title, sub, right, size }) {
  return (
    <div className="sec-head">
      <div>
        <div className="sec-title" style={size ? { fontSize: size } : undefined}>{title}</div>
        {sub && <div className="sec-sub">{sub}</div>}
      </div>
      {right}
    </div>
  )
}
