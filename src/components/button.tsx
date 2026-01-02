import { PlusOutlined } from '@ant-design/icons'
import { Button } from "antd";

export const ButtonIcon = ({ text = '', bg = '#ffffff' }: { text: string, bg: string }) => {
    return (
        <div>
            <Button
                type="primary"
                icon={<PlusOutlined />}
                size='middle'
                className={`
        transition-all duration-150 
        active:scale-95 
        active:bg-[${bg}] 
        active:shadow-[0_0_20px_rgba(33,223,74,0.6)]
        border-none
      `}
                style={{
                    backgroundColor: bg,
                    borderColor: bg,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height:'34px'
                }}
            >
                {text}
            </Button>
        </div>
    )
}
