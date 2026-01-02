
export const TextDashboard = ({ text = '' }: { text: string }) => {
    return (
        <div>
            <div className="flex items-center gap-3 mb-2 bg-black/500">
                <div className="h-8 w-1.5 rounded-full bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.6)]"></div>
                <h1 className="text-xl font-extrabold tracking-tight italic text-cyan-500/50">
                    {text}
                </h1>
            </div>
        </div>
    )
}
