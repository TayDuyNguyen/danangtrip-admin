import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/routes/routes';
import { useForm } from 'react-hook-form';
import { MdLock, MdEmail } from 'react-icons/md';
import Input from '@/components/input';
import { useFieldFocus, useLoginQuery } from '@/hooks';
import { useUserStore } from '@/store';
import type { LoginField } from '@/types';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '@/validations';
import type { LoginForm, LoginRequest } from '@/dataHelper';
import { hasRole } from '@/utils/roleUtils';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { AxiosError } from 'axios';
import type { ErrorResponse } from '@/types';

const Login = () => {
    const navigate = useNavigate();
    const { t } = useTranslation('login');
    const schema = useMemo(() => loginSchema(t), [t]);
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [err, setErr] = useState('');

    const loginMutation = useLoginQuery();

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: yupResolver(schema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const { isFocused, getFocusProps } = useFieldFocus<LoginField>();

    const onSubmit = async (data: LoginRequest) => {
        setErr('');
        try {
            const res = await loginMutation.mutateAsync(data);
            if (!res.data) throw new Error();

            if (hasRole(res.data.user, 'admin')) {
                // Store logic is already handled in mutation's onSuccess (as per useAuthQuery.ts)
                toast.success(t('login_success'), { description: t('welcome_back') });
                navigate(ROUTES.DASHBOARD);
            } else {
                // Clear tokens and store to avoid unauthorized session persistence
                useUserStore.getState().logout();
                setErr(t('no_admin_permission'));
                toast.error(t('login_error'), { description: t('no_admin_permission') });
            }
        } catch (error) {
            const err = error as AxiosError<ErrorResponse>;
            const errData = err.response?.data;
            const serverMsg = errData?.errors
                ? Object.values(errData.errors).flat().join(', ')
                : (errData?.message || t('incorrect_credentials'));

            setErr(serverMsg);
            toast.error(serverMsg, {
                description: t('check_again'),
            });
        }
    }

    const loading = loginMutation.isPending;

    const emailReg = register('email');
    const emailFocus = getFocusProps('email');

    const passwordReg = register('password');
    const passwordFocus = getFocusProps('password');

    return (
        <div className="flex min-h-screen bg-white justify-center items-center p-4 sm:p-8">
            <div className="relative flex w-full max-w-md lg:max-w-4xl lg:w-3/4 xl:w-2/3 h-auto lg:h-[550px] shadow-[0_20px_40px_rgba(0,0,0,0.06)] rounded-3xl glow-effect">
                
                {/* Animated Border Background */}
                <div className="absolute inset-[-2px] rounded-3xl overflow-hidden pointer-events-none z-0">
                    <div 
                        className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 animate-[spin_4s_linear_infinite]" 
                        style={{ backgroundImage: 'conic-gradient(from 0deg, transparent 0 240deg, rgba(20,184,166,0.24) 300deg, #14b8a6 360deg)' }}
                    />
                </div>

                {/* Main Content Container */}
                <div className="relative z-10 flex w-full h-full rounded-3xl overflow-hidden bg-white border border-slate-100">
                {/* Left panel - gradient background */}
                <div
                    className="hidden lg:flex flex-1 bg-linear-to-br from-[#14b8a6] to-slate-900 flex-col pt-12 pl-8 pr-16 text-white relative"
                    style={{ clipPath: "polygon(0 0, 100% 0, 60% 100%, 0% 100%)" }}
                >
                    <h1 className="text-4xl mb-4 font-quicksand font-bold uppercase tracking-wide leading-tight">
                        {t('welcome_back')}
                    </h1>
                    <p className="text-white/80 text-lg opacity-80">
                        {t('login_title')}
                    </p>
                </div>

                {/* Right panel - form */}
                <div className="flex flex-1 items-center justify-center p-5 sm:p-8 bg-white">
                    <div className="w-full max-w-md">
                        {/* Mobile title */}
                        <div className="flex items-center justify-center mb-6 sm:mb-8 lg:hidden">
                            <span className="font-bold text-[#14b8a6] text-xl text-center uppercase tracking-wider">
                                {t('login_title')}
                            </span>
                        </div>

                        <h2 className="hidden lg:block text-3xl font-sans font-bold uppercase text-slate-900 mb-8 text-center lg:text-left tracking-tight">
                            {t('login_title')}
                        </h2>

                        {err && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md text-red-400 text-sm text-center">
                                {err}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate autoComplete="off">
                            <Input
                                label={t('email')}
                                leftIcon={<MdEmail className="w-5 h-5 text-[#14b8a6]/70" />}
                                type="email"
                                placeholder={t('email')}
                                autoComplete="new-email"
                                required
                                isFocused={isFocused('email')}
                                error={errors.email?.message ? t(errors.email.message) : ''}
                                {...emailReg}
                                onFocus={emailFocus.onFocus}
                                onBlur={(e) => {
                                    emailReg.onBlur(e);
                                    emailFocus.onBlur(e);
                                }}
                            />

                            <Input
                                label={t('password')}
                                leftIcon={<MdLock className="w-5 h-5 text-[#14b8a6]/70" />}
                                placeholder={t('password')}
                                autoComplete="new-password"
                                required
                                isPassword
                                showPassword={showPassword}
                                onTogglePassword={() => setShowPassword((v) => !v)}
                                isFocused={isFocused('password')}
                                error={errors.password?.message ? t(errors.password.message) : ''}
                                {...passwordReg}
                                onFocus={passwordFocus.onFocus}
                                onBlur={(e) => {
                                    passwordReg.onBlur(e);
                                    passwordFocus.onBlur(e);
                                }}
                            />

                            <div className="flex items-center justify-between">
                                <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer hover:text-slate-900 transition-colors duration-200">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="accent-[#14b8a6] w-4 h-4 rounded border-slate-300 focus:ring-[#14b8a6]/20"
                                    />
                                    {t('remember_me')}
                                </label>
                                <a href="#" className="text-sm text-[#14b8a6] hover:text-[#0f766e] hover:underline transition-all">
                                    {t('forgot_password')}
                                </a>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-[#14b8a6] hover:bg-[#0f766e] disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-full border border-transparent transition-all duration-300 shadow-sm shadow-[#14b8a6]/25 uppercase tracking-wider"
                            >
                                {loading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                        {t('logging_in')}
                                    </>
                                ) : (
                                    t('login_btn')
                                )}
                            </button>
                        </form>
                    </div>
                </div>
                </div> {/* End of Main Content Container */}
            </div>
        </div>
    );
};

export default Login;
