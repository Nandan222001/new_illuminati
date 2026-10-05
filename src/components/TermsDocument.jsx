import { TERMS_ACK_INTRO, TERMS_ACK_ITEMS, TERMS_HEADING, TERMS_LEAD, TERMS_PARAGRAPHS, TERMS_VERSION } from '../data/terms'

/**
 * Renders the Terms & Conditions exactly as authored (see src/data/terms.js).
 * Used by the entry gate and by the /rules page so both always show the same
 * wording, in the same order. `compact` tightens the layout for the gate modal.
 */
export default function TermsDocument({ compact = false }) {
  return (
    <div className={`terms-doc${compact ? ' terms-doc-compact' : ''}`}>
      <p className="terms-heading">{TERMS_HEADING}</p>

      {TERMS_LEAD.map((line, i) => (
        <p className="terms-line" key={`lead-${i}`}>{line}</p>
      ))}

      <p className="terms-ack-intro">{TERMS_ACK_INTRO}</p>
      <ul className="terms-ack-list">
        {TERMS_ACK_ITEMS.map((item, i) => (
          <li key={`ack-${i}`}>{item}</li>
        ))}
      </ul>

      {TERMS_PARAGRAPHS.map((line, i) => (
        <p className="terms-line" key={`body-${i}`}>{line}</p>
      ))}

      <p className="terms-foot">Version {TERMS_VERSION}</p>
    </div>
  )
}
