import { Card, Col, Row, Statistic } from 'antd';
import { Users, UserCheck, UserMinus, Trash2, ArrowUpRight } from 'lucide-react';
import { useGetStatistic } from "./service/usegetStatistic";
import { Link } from 'react-router-dom';
import { TextDashboard } from '../components/text-dashboard';
import { PageLoader } from '../../../../components/page-loader';

export const StatisticsAdmin = () => {
    const { data, isPending } = useGetStatistic();

    if (isPending) {
        return (
            <div className="flex justify-center items-center h-64">
                <PageLoader />
            </div>
        );
    }
    console.log(data);

    const statsData = [
        {
            title: 'Barcha Adminlar',
            value: data?.all || 0,
            icon: <Users className="text-blue-500" size={24} />,
            color: '#e6f7ff',
            border: '#91d5ff',
            link: '/super-admin/admin/list'
        },
        {
            title: 'Active Adminlar',
            value: data?.active || 0,
            icon: <UserCheck className="text-green-500" size={24} />,
            color: '#f6ffed',
            border: '#b7eb8f',
            link: '/super-admin/admin/list'
        },
        {
            title: 'Blocked Adminlar',
            value: data?.blocked || 0,
            icon: <UserMinus className="text-amber-500" size={24} />,
            color: '#fffbe6',
            border: '#ffe58f',
            link: '/super-admin/admin/blocked'
        },
        {
            title: "O'chirilganlar",
            value: data?.deleted || 0,
            icon: <Trash2 className="text-red-500" size={24} />,
            color: '#fff1f0',
            border: '#ffa39e',
            link: '/super-admin/admin/delete'
        }
    ];

    return (
        <div className="p-2">
            <div className="mb-8 group">
                <TextDashboard text='ADMIN STATISTIKASI' />
            </div>

            <Row gutter={[20, 20]}>
                {statsData.map((item, index) => (
                    <Col xs={24} sm={12} lg={6} key={index}>
                        <Link to={item.link}>
                            <Card
                                className="shadow-sm hover:shadow-md transition-shadow duration-300 h-50 bg-white/5 border border-white/10"
                            >
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
                                                fontSize: '20px'
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

            {/* Pastki qismda qo'shimcha ma'lumotlar bloki (Ixtiyoriy) */}
            <div className="mt-auto w-full pt-10">
                <div className="p-5 rounded-2xl bg-linear-to-r from-cyan-500/10 to-transparent border border-white/5 backdrop-blur-sm shadow-lg shadow-cyan-500/5">
                    <div className="flex items-center gap-4">
                        <div className="relative flex h-2 w-2 shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </div>

                        <div className="flex justify-between items-center w-full gap-4">
                            <p className="text-slate-400 text-xs sm:text-sm whitespace-nowrap">
                                Ma'lumotlar oxirgi marta yangilandi:
                                <span className="text-cyan-400 font-mono ml-2">
                                    {new Date().toLocaleTimeString()}
                                </span>
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="hidden sm:inline text-[10px] text-white/20 uppercase tracking-widest">
                                    System Status:
                                </span>
                                <span className="text-[10px] text-cyan-500/80 font-bold uppercase tracking-widest border border-cyan-500/30 px-2 py-0.5 rounded">
                                    Live Data
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};