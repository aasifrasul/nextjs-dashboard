import React from 'react';

interface BadgeProps {
    count: number;
    maxCount?: number;
    showZero?: boolean;
    dot?: boolean;
    size?: 'small' | 'medium' | 'large';
    color?: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'gray';
    position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    className?: string;
    children?: React.ReactNode;
    onClick?: () => void;
}

export const Badge: React.FC<BadgeProps> = ({
    count,
    maxCount = 99,
    showZero = false,
    dot = false,
    size = 'medium',
    color = 'red',
    position = 'top-right',
    className = '',
    children,
    onClick,
}) => {
    // Don't show badge if count is 0 and showZero is false
    const shouldShowBadge = count > 0 || (count === 0 && showZero);

    // Format count display
    const displayCount = count > maxCount ? `${maxCount}+` : count.toString();

    // Size classes
    const sizeClasses = {
        small: 'h-4 w-4 text-xs min-w-4',
        medium: 'h-5 w-5 text-xs min-w-5',
        large: 'h-6 w-6 text-sm min-w-6',
    };

    // Color classes
    const colorClasses = {
        red: 'bg-red-500 text-white',
        blue: 'bg-blue-500 text-white',
        green: 'bg-green-500 text-white',
        yellow: 'bg-yellow-500 text-black',
        purple: 'bg-purple-500 text-white',
        gray: 'bg-gray-500 text-white',
    };

    // Position classes
    const positionClasses = {
        'top-right': '-top-2 -right-2',
        'top-left': '-top-2 -left-2',
        'bottom-right': '-bottom-2 -right-2',
        'bottom-left': '-bottom-2 -left-2',
    };

    // Dot specific classes
    const dotClasses = {
        small: 'h-2 w-2',
        medium: 'h-3 w-3',
        large: 'h-4 w-4',
    };

    const badgeClasses = `
    absolute
    ${dot ? dotClasses[size] : sizeClasses[size]}
    ${colorClasses[color]}
    ${positionClasses[position]}
    ${dot ? 'rounded-full' : 'rounded-full flex items-center justify-center font-medium'}
    ${onClick ? 'cursor-pointer hover:opacity-80' : ''}
    ${className}
    z-10
    transition-all duration-200
    ${shouldShowBadge ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
  `.trim().replace(/\s+/g, ' ');

    if (children) {
        return (
            <div className="relative inline-block">
                {children}
                {shouldShowBadge && (
                    <span
                        className={badgeClasses}
                        onClick={onClick}
                        title={`${count} notification${count !== 1 ? 's' : ''}`}
                    >
                        {!dot && displayCount}
                    </span>
                )}
            </div>
        );
    }

    // Standalone badge
    return shouldShowBadge ? (
        <span
            className={`${dot ? dotClasses[size] : sizeClasses[size]} ${colorClasses[color]} ${dot ? 'rounded-full' : 'rounded-full flex items-center justify-center font-medium'} ${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
            onClick={onClick}
            title={`${count} notification${count !== 1 ? 's' : ''}`}
        >
            {!dot && displayCount}
        </span>
    ) : null;
};

// Example usage component
const BadgeExamples: React.FC = () => {
    const [count, setCount] = React.useState(5);
    const [showNotifications, setShowNotifications] = React.useState(false);

    return (
        <div className="p-8 space-y-8">
            <div className="space-y-4">
                <h2 className="text-2xl font-bold">Badge Component Examples</h2>

                {/* Counter controls */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setCount(Math.max(0, count - 1))}
                        className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                        -
                    </button>
                    <span className="font-medium">Count: {count}</span>
                    <button
                        onClick={() => setCount(count + 1)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Basic badges with icons */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">With Icons</h3>
                <div className="flex gap-6">
                    <Badge count={count}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM21 12c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10z" />
                        </svg>
                    </Badge>

                    <Badge count={count} color="blue">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </Badge>

                    <Badge count={count} color="green">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                        </svg>
                    </Badge>
                </div>
            </div>

            {/* Different sizes */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Different Sizes</h3>
                <div className="flex gap-6 items-center">
                    <Badge count={count} size="small">
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    </Badge>
                    <Badge count={count} size="medium">
                        <div className="w-10 h-10 bg-gray-200 rounded"></div>
                    </Badge>
                    <Badge count={count} size="large">
                        <div className="w-12 h-12 bg-gray-200 rounded"></div>
                    </Badge>
                </div>
            </div>

            {/* Different colors */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Different Colors</h3>
                <div className="flex gap-4">
                    {(['red', 'blue', 'green', 'yellow', 'purple', 'gray'] as const).map((color) => (
                        <Badge key={color} count={count} color={color}>
                            <div className="w-8 h-8 bg-gray-200 rounded"></div>
                        </Badge>
                    ))}
                </div>
            </div>

            {/* Dot badges */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Dot Badges</h3>
                <div className="flex gap-6">
                    <Badge count={count} dot>
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    </Badge>
                    <Badge count={count} dot color="blue">
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    </Badge>
                    <Badge count={count} dot color="green">
                        <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    </Badge>
                </div>
            </div>

            {/* Interactive badge */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Interactive Badge</h3>
                <div className="relative">
                    <Badge
                        count={count}
                        onClick={() => setShowNotifications(!showNotifications)}
                        color="blue"
                    >
                        <button className="p-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                            Notifications
                        </button>
                    </Badge>

                    {showNotifications && (
                        <div className="absolute top-12 left-0 bg-white border rounded-lg shadow-lg p-4 w-64 z-20">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <h4 className="font-semibold">Notifications</h4>
                                    <button
                                        onClick={() => setShowNotifications(false)}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        ×
                                    </button>
                                </div>
                                <div className="text-sm text-gray-600">
                                    You have {count} unread notifications
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Standalone badges */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Standalone Badges</h3>
                <div className="flex gap-4">
                    <Badge count={5} />
                    <Badge count={99} />
                    <Badge count={1000} maxCount={999} />
                    <Badge count={0} showZero />
                </div>
            </div>
        </div>
    );
};

export default BadgeExamples;