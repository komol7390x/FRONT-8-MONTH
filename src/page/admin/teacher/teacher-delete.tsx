import type React from 'react';
import { TeacherList } from './teacher-list';

export const TeacherDelete: React.FC = () => {
    return <TeacherList mode={"delete"} />;
};
