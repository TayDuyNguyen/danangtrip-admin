import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api';
import { useUserStore } from '@/store';
import { ROUTERS } from '@/routes/routes';
import { useForm } from 'react-hook-form';
import { MdLock, MdEmail } from 'react-icons/md';
import Input from '@/components/input';
import { useFieldFocus } from '@/hooks';
import type { LoginField } from '@/types';
import { yupResolver } from '@hookform/resolvers/yup';
import { loginSchema } from '@/validations';
import type { LoginForm, LoginRequest } from '@/dataHelper';
import { hasRole } from '@/utils/roleUtils';

const Login = () => {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState('');

    const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>({
        resolver: yupResolver(loginSchema),
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
            if(hasRole(res.data.user, 'admin')){
                useUserStore.getState().setUser(res.data.user, res.data.token);
                navigate(ROUTERS.DASHBOARD);
            } else {
                setErr('Bạn không có quyền truy cập vào trang quản trị.');
            }
        } catch (error: any) {
            if (error?.response?.status === 401) {
                setErr('Email hoặc mật khẩu không đúng.');
            } else if (error?.response?.status === 403) {
                setErr('Tài khoản bị khóa. Vui lòng liên hệ admin.');
            } else if (error?.code === 'ERR_NETWORK') {
                setErr('Không thể kết nối đến server. Kiểm tra lại mạng.');
            } else if (error?.response?.status === 500) {
                setErr('Lỗi server. Vui lòng thử lại sau.');
            } else {
                setErr('Đã có lỗi xảy ra. Vui lòng thử lại.');
            }
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
                        Chào mừng bạn<br />trở lại!
                    </h1>
                </div>

                {/* Right panel */}
                <div className="flex flex-1 items-center justify-center p-5 sm:p-8 bg-gray-900">
                    <div className="w-full max-w-md">
                        <div className="flex items-center justify-center mb-6 sm:mb-8 lg:hidden">
                            <span className="font-bold text-cyan-300 text-xl text-shadow-lg text-center">Chào mừng bạn trở lại!</span>
                        </div>

                        <h2 className="text-3xl font-quicksand font-bold uppercase text-white mb-6 text-center text-shadow-xl">
                            ĐĂNG NHẬP
                        </h2>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate autoComplete="off">
                            <Input
                                label="Email"
                                leftIcon={<MdEmail size={20} />}
                                type="email"
                                placeholder='Email'
                                autoComplete="new-email"
                                required
                                isFocused={isFocused('email')}
                                error={errors.email?.message}
                                {...emailReg}
                                onFocus={emailFocus.onFocus}
                                onBlur={(e) => {
                                    emailReg.onBlur(e);
                                    emailFocus.onBlur(e);
                                }}
                            />

                            <Input
                                label="Mật khẩu"
                                leftIcon={<MdLock size={20} />}
                                placeholder="Mật khẩu"
                                autoComplete="new-password"
                                required
                                isPassword
                                showPassword={showPassword}
                                onTogglePassword={() => setShowPassword((v) => !v)}
                                isFocused={isFocused('password')}
                                error={errors.password?.message}
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
                                    Ghi nhớ đăng nhập
                                </label>
                                <a href="#" className="text-sm text-cyan-300 hover:underline">Quên mật khẩu?</a>
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
                                {loading ? 'Đang đăng nhập...' : 'ĐĂNG NHẬP'}
                            </button>
                        </form>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
