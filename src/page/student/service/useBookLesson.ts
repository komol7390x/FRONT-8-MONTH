import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { request } from '../../../config/request';
import { message, Modal } from 'antd';

interface BookLessonParams {
    studentId: number;
    lessonId: number;
    startTime: number;
    finishTime: number;
}

export const useBookLesson = () => {
    const client = useQueryClient();
    return useMutation({
        mutationFn: async ({ studentId, lessonId, startTime, finishTime }: BookLessonParams) => {
            // Based on user input: /lesson-template/booked-by-student/21?lessonId=21212
            // POST body: { startTime, finishTime }
            const res = await request.post(`/lesson-template/booked-by-student/${studentId}`, {
                startTime,
                finishTime
            }, {
                params: { lessonId }
            });
            return res.data;
        },
        onSuccess: (data: any) => {
            const meetLink = data?.data?.meetLink || data?.meetLink;
            if (meetLink) {
                Modal.info({
                    title: 'Lesson Booked Successfully',
                    content: React.createElement('div', null,
                        React.createElement('p', { className: 'mb-2' }, 'Your lesson has been booked!'),
                        React.createElement('p', { className: 'mb-2 font-semibold' }, 'Meeting Link:'),
                        React.createElement('a', {
                            href: meetLink,
                            target: '_blank',
                            rel: 'noopener noreferrer',
                            className: 'text-blue-600 break-all'
                        }, meetLink)
                    ),
                    onOk: () => {
                        // Close window if in Telegram Web App
                        if ((window as any).Telegram?.WebApp) {
                            (window as any).Telegram.WebApp.close();
                        }
                    }
                });
            } else {
                message.success('Lesson booked successfully');
            }
            client.invalidateQueries({ queryKey: ['student-schedule'] });
        },
        onError: (error: any) => {
            message.error(error?.response?.data?.message || 'Failed to book lesson');
        }
    });
};
