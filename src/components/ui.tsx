import { initials } from '../lib/format';
import type { Student, StudentStatus } from '../types';

export function Avatar({ name, color, size = 40 }: { name: string; color?: string; size?: number }) {
  return (
    <span className="avatar" style={{ background: color ?? '#1b2a4a', width: size, height: size, fontSize: size * 0.4 }}>
      {initials(name)}
    </span>
  );
}

const STATUS_LABEL: Record<StudentStatus, string> = {
  waiting: 'Waiting at stop',
  on_bus: 'On the bus',
  at_school: 'At school',
  home: 'Dropped off',
  absent: 'Absent today',
};

export function StatusBadge({ status }: { status: StudentStatus }) {
  return <span className={`badge badge-${status}`}>{STATUS_LABEL[status]}</span>;
}

export function StudentName({ student }: { student: Student }) {
  return (
    <>
      {student.firstName} {student.lastName}
    </>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="empty">{children}</p>;
}
