import { Switch } from '@headlessui/react';
import { clsx } from 'clsx';

interface Props {
    checked: boolean;
    onChange: (checked: boolean) => void;
    color?: 'teal' | 'orange';
    disabled?: boolean;
}

const ToggleSwitch = ({ checked, onChange, color = 'teal', disabled = false }: Props) => {
    // Featured (teal): ON #14B8A6
    // Hot (orange): ON #FF6B35
    const activeColor = color === 'teal' ? 'bg-[#14B8A6]' : 'bg-[#FF6B35]';

    return (
        <Switch
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className={clsx(
                'relative inline-flex h-[20px] w-[36px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[#14B8A6]/20 disabled:cursor-not-allowed disabled:opacity-50 shadow-inner',
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
