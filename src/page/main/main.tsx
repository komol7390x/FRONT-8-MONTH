import logos from '../../assets/img/logo.png'
import img from '../../assets/img/insurance.png'
import { Link } from 'react-router-dom'
import { Button, Modal } from 'antd'
import { config } from '../../config/config'
import { useState } from 'react'

export const MainPage = () => {
    const buildDate = import.meta.env.VITE_BUILD_TIME || "Hozircha ma'lumot yo'q";
    const [infoOpen, setInfoOpen] = useState(false)
    return (
        <div>
            <div className="min-h-screen shadow-2xl flex justify-center items-center p-4 sm:p-6 md:p-8">
                <div className="w-full max-w-lg p-6 sm:p-8 md:p-10 flex flex-col shadow-2xl rounded-2xl sm:rounded-3xl justify-center items-center text-center">
                    <div className='w-32 sm:w-40 md:w-50'><img src={logos} alt='logo' className="w-full h-auto" /></div>
                    <h3 className='text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mt-6 sm:mt-8 md:mt-10'>Online Full-stack course</h3>
                    <p className='text-base sm:text-lg text-gray-600 mt-2'>Xush kelibsiz!</p>
                    <p className="text-sm sm:text-base text-gray-500 max-w-md px-2">
                        Agar platformamizdan  <a
                            href={config.TELEGRAM_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-blue-500 hover:underline"
                        >
                            Talaba
                        </a>{" "} sifatida foydalanmoqchi bo'lsangiz Telegram botga oting
                    </p>
                    <a
                        href={config.TELEGRAM_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full max-w-md"
                    >                        <button
                        className="flex items-center my-6 sm:my-8 justify-center gap-2 w-full px-4 sm:px-6 h-12 sm:h-14 text-base sm:text-lg font-semibold text-white 
                                bg-linear-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 
                                rounded-md shadow-lg hover:shadow-xl transition-all duration-300 
                                disabled:opacity-50 disabled:pointer-events-none outline-none focus-visible:ring-4 focus-visible:ring-blue-300">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            </svg>
                            <span className="hidden sm:inline">Telegram Bot'ga o'tish</span>
                            <span className="sm:hidden">Telegram Bot</span>
                        </button>
                    </a>
                    <div className='flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 md:gap-12 items-center w-full px-4 sm:px-6 md:px-10 pb-4 sm:pb-5'>
                        <Link to="/admin" className="w-full sm:w-auto">
                            <Button
                                style={{
                                    background: 'linear-gradient(to right, #cc2a2a, #e9de4a)',
                                    color: 'white',
                                    height: '44px',
                                    width: '100%',
                                    padding: '0 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                                    transition: 'all 0.3s ease',
                                }}
                                className="sm:w-auto"
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.boxShadow = '0 6px 10px rgba(204, 42, 42, 0.5)')
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)')
                                }
                            >
                                ADMIN
                            </Button>
                        </Link>

                        <Link to="/teacher/login" className="w-full sm:w-auto">
                            <Button
                                style={{
                                    background: 'linear-gradient(to right, #4dd454, #14b8a6)',
                                    color: 'white',
                                    height: '44px',
                                    width: '100%',
                                    padding: '0 20px',
                                    borderRadius: '8px',
                                    border: 'none',
                                    fontWeight: 600,
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                                    transition: 'all 0.3s ease',
                                }}
                                className="sm:w-auto"
                                onMouseEnter={(e) =>
                                    (e.currentTarget.style.boxShadow = '0 6px 10px rgba(43, 177, 41, 0.822)')
                                }
                                onMouseLeave={(e) =>
                                    (e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)')
                                }
                            >
                                TEACHER
                            </Button>
                        </Link>

                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mt-2 px-2">Bot orqali darslarni ko'rishingiz, band qilishingiz va boshqarishingiz mumkin</p>
                    <Button type="link" onClick={() => setInfoOpen(true)}>
                        Info
                    </Button>

                    <Modal
                        open={infoOpen}
                        onCancel={() => setInfoOpen(false)}
                        footer={null}
                        title="Info (Tekshiruv / Sozlash uchun)"
                    >
                        <p className="text-sm text-gray-600 mb-3">
                            Quyidagi qiymatlar deploy/telegram WebApp ochilishi va backend bilan ulanishni tekshirish uchun kerak.
                        </p>
                        <div className="space-y-2">
                            <div className="flex items-start justify-between gap-3">
                                <div className="text-sm font-medium text-gray-800">BACKEND_URL</div>
                                <div className="text-sm text-blue-600 break-all text-right">{config.BACKEND_URL}</div>
                            </div>
                            <div className="flex items-start justify-between gap-3">
                                <div className="text-sm font-medium text-gray-800">FRONTEND_URL</div>
                                <div className="text-sm text-blue-600 break-all text-right">{config.FRONTEND_URL}</div>
                            </div>
                            <div className="flex items-start justify-between gap-3">
                                <div className="text-sm font-medium text-gray-800">Server Update Time</div>
                                <div className="text-sm text-blue-600 break-all text-right">{buildDate}</div>
                            </div>
                            <div className="flex items-start justify-between gap-3">
                                <div className="text-sm font-medium text-gray-800">Telegram</div>
                                <div className="text-sm text-blue-600 break-all text-right">{config.TELEGRAM_URL}</div>
                            </div>
                        </div>
                    </Modal>
                    <div className="pt-4 border-t border-gray-200 w-full mt-4 sm:mt-5"></div>
                    <div className='flex gap-2 sm:gap-3 items-center justify-center'>
                        <div className='w-4 sm:w-5'>
                            <img src={img} alt="" className="w-full h-auto" />
                        </div>
                        <Link to={'/privacy-policy  '}><p className='text-blue-700 text-xs sm:text-sm hover:underline cursor-pointer transition-all duration-300'>Maxfiylik Siyosati</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

