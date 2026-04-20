import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api';
import { useUserStore } from '@/store';
import { ROUTES } from '@/routes/routes';
import { useForm } from 'react-hook-form';
import { MdLock, MdEmail } from 'react-icons/md';
import Input from '@/components/input';
import { useFieldFocus } from '@/hooks';
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
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: yupResolver(schema),
        defaultValues: {
            email: '',
            password: ''
        }
    });

    const { isFocused, getFocusProps } = useFieldFocus<LoginField>();

    const onSubmit = async (data: LoginRequest) => {
        setLoading(true);
        try {
            const res = await authApi.login(data);
            if (!res.data) throw new Error();
            if (hasRole(res.data.user, 'admin')) {
                useUserStore.getState().setUser(res.data.user, res.data.token);
                toast.success(t('login_success'), { description: t('welcome_back') });
                navigate(ROUTES.DASHBOARD);
            } else {
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
        } finally {
            setLoading(false);
        }
    }

    const emailReg = register('email');
    const emailFocus = getFocusProps('email');

    const passwordReg = register('password');
    const passwordFocus = getFocusProps('password');

    return (
        <div className="flex min-h-screen bg-gray-900 justify-center items-center p-4 sm:p-8">
            <div className="relative flex w-full max-w-md lg:max-w-4xl lg:w-3/4 xl:w-2/3 h-auto lg:h-[550px] shadow-[0_0_40px_rgba(34,211,238,0.1)] rounded-2xl glow-effect">
                
                {/* Animated Border Background */}
                <div className="absolute inset-[-2px] rounded-[18px] overflow-hidden pointer-events-none z-0">
                    <div 
                        className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 animate-[spin_4s_linear_infinite]" 
                        style={{ backgroundImage: 'conic-gradient(from 0deg, transparent 0 240deg, rgba(34,211,238,0.3) 300deg, #22d3ee 360deg)' }}
                    />
                </div>

                {/* Main Content Container */}
                <div className="relative z-10 flex w-full h-full rounded-2xl overflow-hidden bg-gray-900 border border-gray-800/50">
                {/* Left panel - gradient background */}
                <div
                    className="hidden lg:flex flex-1 bg-linear-to-br from-cyan-500 to-blue-950 flex-col pt-12 pl-8 pr-16 text-white relative"
                    style={{ clipPath: "polygon(0 0, 100% 0, 60% 100%, 0% 100%)" }}
                >
                    <h1 className="text-4xl mb-4 font-quicksand font-bold uppercase tracking-wide leading-tight">
                        {t('welcome_back')}
                    </h1>
                    <p className="text-cyan-100 text-lg opacity-80">
                        {t('login_title')}
                    </p>
                </div>

                {/* Right panel - form */}
                <div className="flex flex-1 items-center justify-center p-5 sm:p-8 bg-gray-900">
                    <div className="w-full max-w-md">
                        {/* Mobile title */}
                        <div className="flex items-center justify-center mb-6 sm:mb-8 lg:hidden">
                            <span className="font-bold text-cyan-300 text-xl text-center uppercase tracking-wider">
                                {t('login_title')}
                            </span>
                        </div>

                        <h2 className="hidden lg:block text-3xl font-quicksand font-bold uppercase text-white mb-8 text-center lg:text-left tracking-tight">
                            {t('login_title')}
                        </h2>

                        {err && (
                            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                                {err}
                            </div>
                        )}

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate autoComplete="off">
                            <Input
                                label={t('email')}
                                leftIcon={<MdEmail className="w-5 h-5 text-cyan-400/70" />}
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
                                leftIcon={<MdLock className="w-5 h-5 text-cyan-400/70" />}
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
                                <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer hover:text-white transition-colors duration-200">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="accent-cyan-500 w-4 h-4 rounded border-gray-600 focus:ring-cyan-500/20"
                                    />
                                    {t('remember_me')}
                                </label>
                                <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300 hover:underline transition-all">
                                    {t('forgot_password')}
                                </a>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-linear-to-br from-cyan-400 to-blue-600 hover:from-cyan-500 hover:to-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-lg shadow-cyan-500/25 uppercase tracking-wider"
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
