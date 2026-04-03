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
            console.log('user',res.data?.user);
            if (!res.data) throw new Error();
            if(hasRole(res.data.user, 'admin')){
                useUserStore.getState().setUser(res.data.user, res.data.token);
                 toast.success(t('login_success'), {description: t('welcome_back')});
                navigate(ROUTES.DASHBOARD);
            } else {
                setErr(t('no_admin_permission'));
                toast.error(t('login_error'), {description: t('no_admin_permission')});
            }
        } catch {
            setErr(t('incorrect_credentials'));
            toast.error(t('incorrect_credentials'), {
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
            <div className="flex w-full max-w-md lg:max-w-4xl lg:w-3/4 xl:w-2/3 h-auto lg:h-[550px] glow-effect rounded-2xl overflow-hidden">
                {/* Left panel */}
                <div
                    className="hidden lg:flex flex-1 bg-linear-to-br from-cyan-500 to-blue-950 flex-col pt-8 pl-5 pr-25 text-white"
                    style={{ clipPath: 'polygon(0 0, 100% 0, 20% 100%, 0% 100%)' }}
                >
                    <h1 className="text-4xl mb-4 font-quicksand font-bold uppercase text-shadow-lg">
                        {t('welcome_back').split(' ').slice(0, 3).join(' ')}<br />{t('welcome_back').split(' ').slice(3).join(' ')}
                    </h1>
                </div>

                {/* Right panel */}
                <div className="flex flex-1 items-center justify-center p-5 sm:p-8 bg-gray-900">
                    <div className="w-full max-w-md">
                        <div className="flex items-center justify-center mb-6 sm:mb-8 lg:hidden">
                            <span className="font-bold text-cyan-300 text-xl text-shadow-lg text-center">{t('welcome_back')}</span>
                        </div>

                        <h2 className="text-3xl font-quicksand font-bold uppercase text-white mb-6 text-center text-shadow-xl">
                            {t('login_title')}
                        </h2>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate autoComplete="off">
                            <Input
                                label={t('email')}
                                leftIcon={<MdEmail size={20} />}
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
                                leftIcon={<MdLock size={20} />}
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
                                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="accent-blue-600"
                                    />
                                    {t('remember_me')}
                                </label>
                                <a href="#" className="text-sm text-cyan-300 hover:underline">{t('forgot_password')}</a>
                            </div>
                            {/* catch error*/}
                            <div>
                                {err && <p className="text-red-500 text-sm text-center">{err}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 bg-linear-to-br 
                                from-cyan-300 to-blue-950  hover:from-cyan-500 hover:to-blue-950 disabled:opacity-60 
                                 text-white font-semibold py-3 rounded-lg transition"
                            >
                                {loading ? t('logging_in') : t('login_btn')}
                            </button>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
