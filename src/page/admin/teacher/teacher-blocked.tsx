import type React from 'react';
import { TeacherList } from './teacher-list';

export const TeacherBlocked: React.FC = () => {
    return <TeacherList mode={"blocked"} />;
};
