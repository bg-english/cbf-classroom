import { useState } from 'react'
import TopBar from './TopBar'
import MomentCanvas from './MomentCanvas'

/**
 * ClassroomFrame — the main classroom UI shell.
 * Phase 0: Top bar + canvas area + moment navigation.
 * Future phases add: student strip, AI witness, whiteboard, video.
 */

const MOMENTS = [
  { id: 1, key: 'subject',    label: 'Apertura',    short: '1',  color: '#C0504D', section: 'subject'    },
  { id: 2, key: 'motivation', label: 'Presentación',short: '2',  color: '#4BACC6', section: 'motivation'  },
  { id: 3, key: 'activity',   label: 'Desarrollo',  short: '3',  color: '#9BBB59', section: 'activity'   },
  { id: 4, key: 'skill',      label: 'Aplicación',  short: '4',  color: '#8064A2', section: 'skill'      },
  { id: 5, key: 'closing',    label: 'Cierre',      short: '5',  color: '#F79646', section: 'closing'    },
]

export default function ClassroomFrame({ teacher, resolved, onChangeClass, onSignOut }) {
  const [activeMoment, setActiveMoment] = useState(0) // index into MOMENTS

  const { assignment, plan, todayKey, dayContent, combinedGrade } = resolved
  const moment = MOMENTS[activeMoment]

  const sectionContent = dayContent?.sections?.[moment.section] || null

  function goNext() {
    setActiveMoment(m => Math.min(m + 1, MOMENTS.length - 1))
  }

  function goPrev() {
    setActiveMoment(m => Math.max(m - 1, 0))
  }

  // Keyboard navigation
  function handleKey(e) {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); goNext() }
    if (e.key === 'ArrowLeft') { e.preventDefault(); goPrev() }
    if (e.key >= '1' && e.key <= '5') setActiveMoment(Number(e.key) - 1)
  }

  return (
    <div
      className="cc-frame"
      tabIndex={0}
      onKeyDown={handleKey}
      style={{ outline: 'none' }}
    >
      <TopBar
        teacher={teacher}
        assignment={assignment}
        combinedGrade={combinedGrade}
        plan={plan}
        todayKey={todayKey}
        moments={MOMENTS}
        activeMoment={activeMoment}
        onSelectMoment={setActiveMoment}
        onChangeClass={onChangeClass}
        onSignOut={onSignOut}
      />

      <MomentCanvas
        moment={moment}
        sectionContent={sectionContent}
        plan={plan}
        dayContent={dayContent}
        onNext={goNext}
        onPrev={goPrev}
        isFirst={activeMoment === 0}
        isLast={activeMoment === MOMENTS.length - 1}
      />
    </div>
  )
}
