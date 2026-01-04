import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateTeacher } from './service/useCreateTeacher';

export const TeacherCreate: React.FC = () => {
    const navigate = useNavigate();
    const { mutate: createTeacher, isPending } = useCreateTeacher();

    const [form, setForm] = useState({
        fullname: '',
        email: '',
        phoneNumber: '',
        password: '',
        expirence: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createTeacher(
            {
                fullname: form.fullname,
                email: form.email,
                phoneNumber: form.phoneNumber,
                password: form.password,
                expirence: Number(form.expirence) || 0,
            },
            {
                onSuccess: () => {
                    navigate('/super-admin/teacher/confirm', {
                        state: { email: form.email, phoneNumber: form.phoneNumber },
                    });
                },
            } as any,
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">Create Teacher</h1>
                    </div>

                    <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                value={form.fullname}
                                onChange={(e) => setForm((p) => ({ ...p, fullname: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                                placeholder="Ali Valiyev"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={form.email}
                                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                                placeholder="teacher@mail.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                value={form.phoneNumber}
                                onChange={(e) => setForm((p) => ({ ...p, phoneNumber: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                                placeholder="+998901234567"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                value={form.password}
                                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                                placeholder="@Komol12345"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Expirence (years)</label>
                            <input
                                type="number"
                                min={0}
                                value={form.expirence}
                                onChange={(e) => setForm((p) => ({ ...p, expirence: Number(e.target.value) }))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-200"
                                placeholder="3"
                                required
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => navigate('/super-admin/teacher/all')}
                                className="flex-1 px-4 py-2.5 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:bg-green-300 disabled:cursor-not-allowed transition-colors"
                            >
                                {isPending ? 'Creating...' : 'Create & Continue'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};
