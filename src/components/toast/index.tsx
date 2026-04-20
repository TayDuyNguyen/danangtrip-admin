import { Toaster as SonnerToast, type ToasterProps } from 'sonner';

export const Toaster= ({...props}: ToasterProps) => {
    return (
        <SonnerToast
        position='bottom-right' // bottom-right, bottom-left, top-right, top-left, top-center, bottom-center
        richColors // màu sắc theo loại toast
        closeButton // nút đóng
        duration={4000} // thời gian hiển thị
        expand={false} // false = chỉ hiển thị 1 cái, true = hiển thị tất cá
        visibleToasts={5} // số toast tối đa hiện thị cùng lúc
        className="sonner-toast"
        toastOptions={{
            className: 'rounded-xl shadow-xl border border-gray-200 dark:border-gray-700',
            style: {
                padding: '16px 20px'
            }
        }}
            {...props}
        />
    );
}
