import { useRef } from 'react';
import type { ChangeEvent } from 'react';
import type { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Plus, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTourUploadMutations } from '@/hooks/useTourQueries';
import { TextInput } from '@/components/ui/TextInput';
import type { CreateTourInput } from '@/validations/tour.schema';
import { extractPublicIdFromUrl } from '@/utils/cloudinary';

interface ImageGalleryProps {
    setValue: UseFormSetValue<CreateTourInput>;
    watch: UseFormWatch<CreateTourInput>;
}

const ImageGallery = ({ setValue, watch }: ImageGalleryProps) => {
    const { t } = useTranslation('tour');
    const { uploadThumbnailMutation, uploadGalleryMutation, deleteImageMutation } = useTourUploadMutations();

    // Mapping of image URL to public_id for deletion support
    const imageMetadataRef = useRef<Record<string, string>>({});

    const thumbnail = watch('thumbnail');
    const images = watch('images') || [];

    const thumbInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const handleThumbnailUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const input = e.target;
        if (!file) return;

        try {
            // Delete old thumbnail if exists (Item 1.2 in checklist)
            if (thumbnail) {
                const oldPublicId = imageMetadataRef.current[thumbnail] || extractPublicIdFromUrl(thumbnail);
                if (oldPublicId) {
                    try {
                        await deleteImageMutation.mutateAsync(oldPublicId);
                        delete imageMetadataRef.current[thumbnail];
                    } catch {
                        // Silent fail for cleanup is okay
                    }
                }
            }

            const data = await uploadThumbnailMutation.mutateAsync(file);
            if (!data?.url) throw new Error('empty url');
            
            if (data.public_id) {
                imageMetadataRef.current[data.url] = data.public_id;
            }

            setValue('thumbnail', data.url, { shouldValidate: true, shouldDirty: true });
        } catch {
            /* toast handled in mutation onError */
        } finally {
            input.value = '';
        }
    };

    const handleGalleryUpload = async (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const input = e.target;
        if (files.length === 0) return;

        try {
            const results = await uploadGalleryMutation.mutateAsync(files);
            
            // Track public_ids
            results.forEach(r => {
                if (r.url && r.public_id) {
                    imageMetadataRef.current[r.url] = r.public_id;
                }
            });

            const newUrls = results.map(r => r.url);
            setValue('images', [...images, ...newUrls], { shouldValidate: true, shouldDirty: true });
        } catch {
            /* toast handled in mutation onError */
        } finally {
            input.value = '';
        }
    };

    const removeImage = async (index: number) => {
        const urlToRemove = images[index];
        if (!urlToRemove) return;
        
        const publicId = imageMetadataRef.current[urlToRemove] || extractPublicIdFromUrl(urlToRemove);

        if (publicId) {
            // Item 1.3: Ensure removal is synced with state update
            await deleteImageMutation.mutateAsync(publicId);
            delete imageMetadataRef.current[urlToRemove];
        }

        const newImages = images.filter((_, i) => i !== index);
        setValue('images', newImages, { shouldDirty: true });
    };

    const removeThumbnail = async () => {
        if (!thumbnail) return;
        const publicId = imageMetadataRef.current[thumbnail] || extractPublicIdFromUrl(thumbnail);
        
        if (publicId) {
            await deleteImageMutation.mutateAsync(publicId);
            delete imageMetadataRef.current[thumbnail];
        }
        
        setValue('thumbnail', '', { shouldDirty: true });
    };

    const thumbPending = uploadThumbnailMutation.isPending;
    const galleryPending = uploadGalleryMutation.isPending;

    return (
        <div className="space-y-8">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                    {t('form.media.thumbnail')} <span className="text-red-500">*</span>
                </label>
                <div
                    onClick={() => !thumbPending && thumbInputRef.current?.click()}
                    className={`relative w-full aspect-video md:w-80 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${
                        thumbnail
                            ? 'border-transparent cursor-pointer'
                            : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                    } ${thumbPending ? 'pointer-events-none opacity-70' : ''}`}
                >
                    {thumbnail ? (
                        <>
                            <img src={thumbnail} alt={t('form.media.thumbnail_alt')} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            thumbInputRef.current?.click();
                                        }}
                                        className="text-white text-xs font-semibold px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg border border-white/30 hover:bg-white/40 transition-colors"
                                    >
                                        {t('form.media.change_image')}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeThumbnail();
                                        }}
                                        className="p-2 bg-red-500/80 text-white rounded-lg backdrop-blur-md hover:bg-red-600 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center px-6">
                            {thumbPending ? (
                                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
                            ) : (
                                <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            )}
                            <p className="text-sm font-medium text-slate-600">{t('form.media.upload_hint')}</p>
                            <p className="text-xs text-slate-400 mt-1">{t('form.media.formats_hint')}</p>
                        </div>
                    )}
                    <input
                        ref={thumbInputRef}
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleThumbnailUpload}
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                    {t('form.media.gallery')}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {images.map((url, index) =>
                        url ? (
                            <div key={`${url}-${index}`} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                                <img
                                    src={url}
                                    alt={t('form.media.gallery_item_alt', { index: index + 1 })}
                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                />
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeImage(index);
                                    }}
                                    className="absolute top-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ) : null
                    )}
                    <div
                        onClick={() => !galleryPending && galleryInputRef.current?.click()}
                        className={`aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all text-slate-400 ${galleryPending ? 'pointer-events-none opacity-70' : ''}`}
                    >
                        {galleryPending ? (
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        ) : (
                            <>
                                <Plus className="w-6 h-6 mb-1" />
                                <span className="text-[10px] font-medium uppercase tracking-wider">{t('form.media.add_image')}</span>
                            </>
                        )}
                        <input
                            ref={galleryInputRef}
                            type="file"
                            className="hidden"
                            multiple
                            accept="image/*"
                            onChange={handleGalleryUpload}
                        />
                    </div>
                </div>
            </div>

            <div data-tour-field="video_url">
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                    {t('form.media.video_url')}
                </label>
                <div className="relative">
                    <TextInput
                        type="url"
                        value={watch('video_url') ?? ''}
                        onChange={(e) =>
                            setValue('video_url', e.target.value.trim() || null, {
                                shouldValidate: true,
                                shouldDirty: true
                            })
                        }
                        placeholder={t('form.media.video_placeholder')}
                        className="text-sm"
                    />
                </div>
            </div>
        </div>
    );
};

export default ImageGallery;
