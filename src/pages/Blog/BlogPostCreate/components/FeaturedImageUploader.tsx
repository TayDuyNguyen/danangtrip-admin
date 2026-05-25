import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import { UploadCloud, X, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useBlogUploadMutations } from '@/hooks/useBlogQueries';
import { extractPublicIdFromUrl } from '@/utils/cloudinary';

interface FeaturedImageUploaderProps {
    value?: string | null;
    onChange: (url: string | null) => void;
}

const FeaturedImageUploader = ({ value, onChange }: FeaturedImageUploaderProps) => {
    const { t } = useTranslation('blog');
    const { uploadImageMutation, deleteImageMutation } = useBlogUploadMutations();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Clean up previous image if present
        if (value) {
            const oldPublicId = extractPublicIdFromUrl(value);
            if (oldPublicId) {
                try {
                    await deleteImageMutation.mutateAsync(oldPublicId);
                } catch {
                    // Ignore error to proceed with uploading new image
                }
            }
        }

        try {
            const data = await uploadImageMutation.mutateAsync(file);
            if (data?.url) {
                onChange(data.url);
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
        <div className="space-y-3">
            <div
                onClick={() => !isPending && fileInputRef.current?.click()}
                className={`relative h-44 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${
                    value
                        ? 'border-transparent bg-slate-50 cursor-pointer'
                        : 'border-slate-200 hover:border-[#14b8a6] hover:bg-[#dff7f4] cursor-pointer'
                } ${isPending ? 'pointer-events-none opacity-70' : ''}`}
            >
                {value ? (
                    <>
                        <img src={value} alt="Featured" className="w-full h-full object-cover" />
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
                                    {t('form.media.change')}
                                </button>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemove();
                                    }}
                                    className="p-2 bg-red-500/80 text-white rounded-lg backdrop-blur-md hover:bg-red-600 transition-colors cursor-pointer"
                                >
                                    <X className="w-4.5 h-4.5" />
                                </button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center px-4">
                        {isPending ? (
                            <Loader2 className="w-10 h-10 text-[#14b8a6] animate-spin mx-auto mb-3" />
                        ) : (
                            <UploadCloud className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                        )}
                        <p className="text-sm font-semibold text-slate-600">
                            {t('form.media.upload_drag')}
                        </p>
                        <button
                            type="button"
                            className="mt-2 text-xs font-bold text-[#14b8a6] hover:text-[#0d9488]"
                        >
                            {t('form.media.select_btn')}
                        </button>
                        <p className="text-[10px] text-slate-400 mt-2 leading-relaxed max-w-[220px] mx-auto">
                            {t('form.media.helper')}
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
        </div>
    );
};

export default FeaturedImageUploader;
