import { useStore } from '../../store';
import type { Student } from '../../types';

/** Board / drop-off / absent buttons appropriate to the current trip direction. */
export function StudentActions({ student }: { student: Student }) {
  const { state, dispatch } = useStore();
  const set = (status: Student['status']) => dispatch({ type: 'SET_STATUS', studentId: student.id, status, now: Date.now() });
  const morning = state.trip.direction === 'morning';

  if (student.status === 'absent') {
    return (
      <button className="btn btn-sm btn-outline" onClick={() => set(morning ? 'waiting' : 'at_school')}>
        Undo absent
      </button>
    );
  }
  if (student.status === 'on_bus') {
    return morning ? (
      <button className="btn btn-sm btn-outline" onClick={() => set('waiting')}>
        Undo
      </button>
    ) : (
      <button className="btn btn-sm" onClick={() => set('home')}>
        Drop off
      </button>
    );
  }
  if ((morning && student.status === 'waiting') || (!morning && student.status === 'at_school')) {
    return (
      <div className="row gap-sm">
        <button className="btn btn-sm" onClick={() => set('on_bus')}>
          Board
        </button>
        <button className="btn btn-sm btn-outline" onClick={() => set('absent')}>
          Absent
        </button>
      </div>
    );
  }
  return null;
}
