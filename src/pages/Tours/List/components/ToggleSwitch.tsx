import { Switch } from '@headlessui/react';
import { clsx } from 'clsx';

interface Props {
    checked: boolean;
    onChange: (checked: boolean) => void;
    color?: 'blue' | 'orange';
    disabled?: boolean;
}

const ToggleSwitch = ({ checked, onChange, color = 'blue', disabled = false }: Props) => {
    // Featured (blue): ON #0066CC
    // Hot (orange): ON #FF6B35
    const activeColor = color === 'blue' ? 'bg-[#0066CC]' : 'bg-[#FF6B35]';

    return (
        <Switch
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className={clsx(
                'relative inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066CC]/20 disabled:cursor-not-allowed disabled:opacity-50 shadow-inner',
                checked ? activeColor : 'bg-[#E2E8F0]'
            )}
        >
            <span
                aria-hidden="true"
                className={clsx(
                    'pointer-events-none inline-block h-[16px] w-[16px] transform rounded-full bg-white shadow-sm ring-0 transition duration-300 ease-in-out',
                    checked ? 'translate-x-[16px]' : 'translate-x-0'
                )}
            />
        </Switch>
    );
};

export default ToggleSwitch;
