import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBlogUploadMutations } from '@/hooks/useBlogQueries';
import { extractPublicIdFromUrl } from '@/utils/cloudinary';

interface SettingImageUploaderProps {
    value?: string | null;
    onChange: (url: string | null) => void;
    helperText?: string;
    aspectRatioClass?: string;
}

const SettingImageUploader = ({ 
    value, 
    onChange, 
    helperText = '',
    aspectRatioClass = 'h-32'
}: SettingImageUploaderProps) => {
    const { t } = useTranslation('settings');
    const { uploadImageMutation, deleteImageMutation } = useBlogUploadMutations();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const data = await uploadImageMutation.mutateAsync(file);
            if (data?.url) {
                const oldUrl = value;
                onChange(data.url);

                // Clean up previous image AFTER successful upload
                if (oldUrl) {
                    const oldPublicId = extractPublicIdFromUrl(oldUrl);
                    if (oldPublicId) {
                        try {
                            await deleteImageMutation.mutateAsync(oldPublicId);
                        } catch {
                            // Ignore error to proceed silently
                        }
                    }
                }
            }
        } catch {
            // Error toast handled in query mutation
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const handleRemove = async () => {
        if (!value) return;

        const publicId = extractPublicIdFromUrl(value);
        if (publicId) {
            try {
                await deleteImageMutation.mutateAsync(publicId);
            } catch {
                // Ignore error to complete UI removal
            }
        }
        onChange(null);
    };

    const isPending = uploadImageMutation.isPending || deleteImageMutation.isPending;

    return (
        <div className="space-y-2" data-testid="settings-image-uploader">
            <div
                onClick={() => !isPending && fileInputRef.current?.click()}
                className={`relative w-full ${aspectRatioClass} rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${
                    value
                        ? 'border-transparent bg-slate-50 cursor-pointer'
                        : 'border-slate-200 hover:border-[#14b8a6] hover:bg-[#dff7f4] cursor-pointer'
                } ${isPending ? 'pointer-events-none opacity-70' : ''}`}
            >
                {value ? (
                    <>
                        <img src={value} alt="Setting Media" className="w-full h-full object-contain p-2 bg-slate-100" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity duration-200">
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        fileInputRef.current?.click();
                                    }}
                                    className="text-white text-xs font-semibold px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg border border-white/30 hover:bg-white/40 transition-colors cursor-pointer"
                                >
                                    {t('actions.change_image', { defaultValue: 'Change' })}
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove();
                                    }}
                                    className="p-2 bg-red-500/80 text-white rounded-lg backdrop-blur-md hover:bg-red-600 transition-colors cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center px-4">
                        {isPending ? (
                            <Loader2 className="w-8 h-8 text-[#14b8a6] animate-spin mx-auto mb-2" />
                        ) : (
                            <UploadCloud className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        )}
                        <p className="text-xs font-semibold text-slate-500">
                            {t('actions.upload')}
                        </p>
                    </div>
                )}
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />
            </div>
            {helperText && (
                <p className="text-[11px] text-slate-400 font-medium leading-relaxed">{helperText}</p>
            )}
        </div>
    );
};

export default SettingImageUploader;
