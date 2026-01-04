import { Card, Col, Row, Statistic, Spin } from 'antd';
import { ArrowUpRight, Trash2, UserCheck, UserMinus, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TextDashboard } from '../super-admin/components/text-dashboard';
import { useStudentStatistic } from './service/useStudentStatistic';

export const StudentStatistics = () => {
    const { data, isPending } = useStudentStatistic();

    if (isPending) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    const statsData = [
        {
            title: "Barcha Studentlar",
            value: data?.all || 0,
            icon: <Users className="text-blue-500" size={24} />,
            color: '#e6f7ff',
            border: '#91d5ff',
            link: '/super-admin/student/all',
        },
        {
            title: 'Active Studentlar',
            value: data?.active || 0,
            icon: <UserCheck className="text-green-500" size={24} />,
            color: '#f6ffed',
            border: '#b7eb8f',
            link: '/super-admin/student/all',
        },
        {
            title: 'Blocked Studentlar',
            value: data?.inactive || 0,
            icon: <UserMinus className="text-amber-500" size={24} />,
            color: '#fffbe6',
            border: '#ffe58f',
            link: '/super-admin/student/blocked',
        },
        {
            title: "O'chirilganlar",
            value: data?.deleted || 0,
            icon: <Trash2 className="text-red-500" size={24} />,
            color: '#fff1f0',
            border: '#ffa39e',
            link: '/super-admin/student/delete',
        },
    ];

    return (
        <div className="p-2">
            <div className="mb-8 group">
                <TextDashboard text='STUDENT STATISTIKASI' />
            </div>

            <Row gutter={[20, 20]}>
                {statsData.map((item, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Link to={item.link}>
                            <Card className="shadow-sm hover:shadow-md transition-shadow duration-300 h-50 bg-white/5 border border-white/10">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="p-2 rounded-lg mb-4 inline-block" style={{ backgroundColor: item.color + '20' }}>
                                            {item.icon}
                                        </div>
                                        <Statistic
                                            title={<span className="font-medium opacity-80">{item.title}</span>}
                                            value={item.value}
                                            valueStyle={{
                                                color: item.border,
                                                fontWeight: 'bold',
                                                fontSize: '20px',
                                            }}
                                        />
                                    </div>
                                    <div className="text-cyan-500 opacity-50">
                                        <ArrowUpRight size={20} />
                                    </div>
                                </div>
                            </Card>
                        </Link>
                    </Col>
                ))}
            </Row>
        </div>
    );
};
