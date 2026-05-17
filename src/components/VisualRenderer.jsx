/**
 * VisualRenderer — renders AI-generated visual formats using pure CSS/SVG.
 * No external chart libraries needed.
 *
 * Supported types: mind-map, bar-chart, comparison-table, timeline,
 *                  hierarchy, flow-steps, key-concepts
 */
export default function VisualRenderer({ visual, accent }) {
  if (!visual?.type || !visual?.data) return null

  const Renderer = RENDERERS[visual.type]
  if (!Renderer) return null

  return (
    <div className="vr-container" style={{ '--vr-accent': accent }}>
      {visual.data.title && <h3 className="vr-title">{visual.data.title}</h3>}
      <Renderer data={visual.data} accent={accent} />
    </div>
  )
}

/** Mind Map — center node with radiating branches */
function MindMap({ data, accent }) {
  const branches = data.branches || []
  const total = branches.length
  if (!total) return null

  return (
    <div className="vr-mindmap">
      <div className="vr-mm-center" style={{ background: accent }}>
        {data.center}
      </div>
      <div className="vr-mm-branches">
        {branches.map((branch, i) => {
          const angle = (360 / total) * i - 90
          const hue = (360 / total) * i
          const branchColor = `hsl(${hue}, 60%, 50%)`
          return (
            <div key={i} className="vr-mm-branch" style={{ '--branch-angle': `${angle}deg`, '--branch-color': branchColor }}>
              <div className="vr-mm-branch-label">{branch.label}</div>
              {branch.children?.length > 0 && (
                <div className="vr-mm-children">
                  {branch.children.map((child, j) => (
                    <span key={j} className="vr-mm-child">{child}</span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** Bar Chart — horizontal bars with labels and values */
function BarChart({ data, accent }) {
  const items = data.items || []
  if (!items.length) return null
  const max = Math.max(...items.map(i => i.value || 0), 1)

  return (
    <div className="vr-barchart">
      {items.map((item, i) => {
        const pct = ((item.value || 0) / max) * 100
        const color = item.color || accent
        return (
          <div key={i} className="vr-bar-row">
            <span className="vr-bar-label">{item.label}</span>
            <div className="vr-bar-track">
              <div
                className="vr-bar-fill"
                style={{ width: `${pct}%`, background: color }}
              />
            </div>
            <span className="vr-bar-value">{item.value}{item.unit || ''}</span>
          </div>
        )
      })}
      {data.source && <div className="vr-source">{data.source}</div>}
    </div>
  )
}

/** Comparison Table — side-by-side comparison */
function ComparisonTable({ data }) {
  const headers = data.headers || []
  const rows = data.rows || []
  if (!headers.length || !rows.length) return null

  return (
    <div className="vr-comparison">
      <table className="vr-comp-table">
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} className={i === 0 ? 'vr-comp-criteria' : 'vr-comp-header'}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} className={j === 0 ? 'vr-comp-criteria' : ''}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/** Timeline — vertical or horizontal sequence of events */
function Timeline({ data }) {
  const events = data.events || []
  if (!events.length) return null

  return (
    <div className="vr-timeline">
      {events.map((event, i) => (
        <div key={i} className="vr-tl-item">
          <div className="vr-tl-marker">
            <span className="vr-tl-dot" />
            {i < events.length - 1 && <span className="vr-tl-line" />}
          </div>
          <div className="vr-tl-content">
            {event.date && <span className="vr-tl-date">{event.date}</span>}
            <span className="vr-tl-label">{event.label}</span>
            {event.description && <p className="vr-tl-desc">{event.description}</p>}
          </div>
        </div>
      ))}
    </div>
  )
}

/** Hierarchy — tree structure (org chart / taxonomy) */
function Hierarchy({ data, accent }) {
  const root = data.root
  if (!root) return null

  function renderNode(node, depth = 0) {
    const hue = depth * 40
    const bg = depth === 0 ? accent : `hsl(${hue + 200}, 55%, 92%)`
    const color = depth === 0 ? '#fff' : `hsl(${hue + 200}, 55%, 25%)`
    return (
      <div key={node.label} className="vr-hier-node-wrap">
        <div className="vr-hier-node" style={{ background: bg, color }}>
          {node.label}
        </div>
        {node.children?.length > 0 && (
          <div className="vr-hier-children">
            {node.children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return <div className="vr-hierarchy">{renderNode(root)}</div>
}

/** Flow Steps — sequential process with arrows */
function FlowSteps({ data, accent }) {
  const steps = data.steps || []
  if (!steps.length) return null

  return (
    <div className="vr-flowsteps">
      {steps.map((step, i) => (
        <div key={i} className="vr-flow-item">
          <div className="vr-flow-card" style={{ borderTopColor: accent }}>
            <span className="vr-flow-num" style={{ background: accent }}>{i + 1}</span>
            <span className="vr-flow-label">{step.label}</span>
            {step.detail && <p className="vr-flow-detail">{step.detail}</p>}
          </div>
          {i < steps.length - 1 && (
            <div className="vr-flow-arrow" style={{ color: accent }}>→</div>
          )}
        </div>
      ))}
    </div>
  )
}

/** Key Concepts — visual cards with icons/emojis */
function KeyConcepts({ data, accent }) {
  const concepts = data.concepts || []
  if (!concepts.length) return null

  return (
    <div className={`vr-concepts vr-concepts-${Math.min(concepts.length, 4)}`}>
      {concepts.map((c, i) => (
        <div key={i} className="vr-concept-card" style={{ borderTopColor: accent }}>
          {c.icon && <span className="vr-concept-icon">{c.icon}</span>}
          <h4 className="vr-concept-title">{c.title}</h4>
          <p className="vr-concept-desc">{c.description}</p>
        </div>
      ))}
    </div>
  )
}

const RENDERERS = {
  'mind-map': MindMap,
  'bar-chart': BarChart,
  'comparison-table': ComparisonTable,
  'timeline': Timeline,
  'hierarchy': Hierarchy,
  'flow-steps': FlowSteps,
  'key-concepts': KeyConcepts,
}
