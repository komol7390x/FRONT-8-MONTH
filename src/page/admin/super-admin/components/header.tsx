import { Badge } from 'antd'
import { Bell } from 'lucide-react'

export const AdminHeader = () => {
    return (
        <div className='flex justify-between items-center pt-5'>
            <div className="text-lg font-medium text-slate-800">
                Dashboard Panel
            </div>
            <div className="flex items-center gap-4">
                {/* Headerga kerakli elementlarni (masalan, qidiruv yoki til tanlash) shu yerga qo'ying */}
                <Badge count={5} dot>
                    <Bell size={20} className="text-slate-500 cursor-pointer" />
                </Badge>
            </div>
        </div>
    )
}
