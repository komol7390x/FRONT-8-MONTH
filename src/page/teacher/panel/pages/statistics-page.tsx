import type React from 'react';
import { Card, Col, Row, Statistic } from 'antd';
import { BookOpen, CreditCard } from 'lucide-react';
import { useTeacherDetails } from '../service/useTeacherDetails';
import { useTeacherStatistics } from '../service/useTeacherStatistics';
import { PageLoader } from '../../../../components/page-loader';

export const TeacherStatisticsPage: React.FC = () => {
    const details = useTeacherDetails();
    const teacherId = details.data?.id;
    const stats = useTeacherStatistics(teacherId);

    if (details.isPending || stats.isPending) {
        return (
            <div className="flex justify-center items-center h-64">
                <PageLoader />
            </div>
        );
    }

    const lessonCount = Number(stats.data?.lesson ?? 0);
    const payment = Number(stats.data?.payment ?? 0);

    return (
        <div className="p-2">
            <Row gutter={[20, 20]}>
                <Col xs={24} sm={12} lg={12}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 h-40 bg-white/5 border border-white/10">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="p-2 rounded-lg mb-4 inline-block" style={{ backgroundColor: '#e6f7ff20' }}>
                                    <BookOpen className="text-cyan-300" size={24} />
                                </div>
                                <Statistic
                                    title={<span className="font-medium opacity-80">Lessons</span>}
                                    value={lessonCount}
                                    valueStyle={{ color: '#91d5ff', fontWeight: 'bold', fontSize: '22px' }}
                                />
                            </div>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={12}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 h-40 bg-white/5 border border-white/10">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="p-2 rounded-lg mb-4 inline-block" style={{ backgroundColor: '#fffbe620' }}>
                                    <CreditCard className="text-amber-300" size={24} />
                                </div>
                                <Statistic
                                    title={<span className="font-medium opacity-80">Payment</span>}
                                    value={payment}
                                    valueStyle={{ color: '#ffe58f', fontWeight: 'bold', fontSize: '22px' }}
                                />
                            </div>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};
