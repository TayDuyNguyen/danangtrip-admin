/**
 * Loading component — các kiểu spinner thuần CSS/Tailwind
 * Giữ nguyên interface cũ để không cần sửa chỗ nào đang dùng
 */
interface LoadingProp {
    type?: 'blank' | 'balls' | 'bars' | 'bubbles' | 'cubes' | 'cylon' | 'spin' | 'spinningBubbles' | 'spokes';
    color?: string;
    delay?: number;
    height?: number;
    width?: number;
    className?: string;
}

const Spinner = ({ color, size }: { color: string; size: number }) => (
    <div
        className="rounded-full border-4 border-transparent animate-spin"
        style={{
            width: size,
            height: size,
            borderBottomColor: color,
        }}
    />
);

const Bars = ({ color, size }: { color: string; size: number }) => (
    <div className="flex items-end gap-1" style={{ height: size }}>
        {[0, 0.15, 0.3].map((delay, i) => (
            <div
                key={i}
                className="w-2 animate-bounce rounded-sm"
                style={{ height: size * 0.8, backgroundColor: color, animationDelay: `${delay}s` }}
            />
        ))}
    </div>
);

const Dots = ({ color, size }: { color: string; size: number }) => (
    <div className="flex items-center gap-2">
        {[0, 0.2, 0.4].map((delay, i) => (
            <div
                key={i}
                className="rounded-full animate-bounce"
                style={{
                    width: size * 0.25,
                    height: size * 0.25,
                    backgroundColor: color,
                    animationDelay: `${delay}s`,
                }}
            />
        ))}
    </div>
);

export const LoadingReact = ({
    type = 'spokes',
    color = '#3b82f6',
    height = 50,
    width = 50,
    className,
}: LoadingProp) => {
    const size = Math.min(height, width);

    const renderSpinner = () => {
        switch (type) {
            case 'bars':
            case 'cylon':
                return <Bars color={color} size={size} />;
            case 'balls':
            case 'bubbles':
            case 'cubes':
            case 'spinningBubbles':
                return <Dots color={color} size={size} />;
            case 'blank':
                return null;
            // spin | spokes | default
            default:
                return <Spinner color={color} size={size} />;
        }
    };

    return (
        <div className={`flex items-center justify-center ${className ?? ''}`}>
            {renderSpinner()}
        </div>
    );
};

export default LoadingReact;
