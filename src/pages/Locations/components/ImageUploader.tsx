import { forwardRef, useImperativeHandle, useRef } from 'react';
import type { ChangeEvent } from 'react';
import type { UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Plus, X, Image as ImageIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocationUploadMutations } from '@/hooks/useLocationQueries';
import { TextInput } from '@/components/ui/TextInput';
import type { CreateLocationInput } from '@/validations/location.schema';

interface ImageUploaderProps {
    setValue: UseFormSetValue<CreateLocationInput>;
    watch: UseFormWatch<CreateLocationInput>;
    thumbnailError?: string;
    videoUrlError?: string;
}

export interface ImageUploaderHandle {
    uploadPendingImages: (data: CreateLocationInput) => Promise<CreateLocationInput>;
    clearPendingImages: () => void;
}

const ImageUploader = forwardRef<ImageUploaderHandle, ImageUploaderProps>(
    ({ setValue, watch, thumbnailError, videoUrlError }, ref) => {
    const { t } = useTranslation('location');
    const { uploadThumbnailMutation, uploadGalleryMutation } = useLocationUploadMutations();
    const pendingThumbnailRef = useRef<{ previewUrl: string; file: File } | null>(null);
    const pendingGalleryRef = useRef<Array<{ previewUrl: string; file: File }>>([]);

    const thumbnail = watch('thumbnail');
    const images = watch('images') || [];

    const thumbInputRef = useRef<HTMLInputElement>(null);
    const galleryInputRef = useRef<HTMLInputElement>(null);

    const revokePreview = (previewUrl?: string | null) => {
        if (previewUrl?.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
    };

    const clearPendingImages = () => {
        revokePreview(pendingThumbnailRef.current?.previewUrl);
        pendingThumbnailRef.current = null;
        pendingGalleryRef.current.forEach((item) => revokePreview(item.previewUrl));
        pendingGalleryRef.current = [];
    };

    useImperativeHandle(ref, () => ({
        uploadPendingImages: async (data) => {
            let nextThumbnail = data.thumbnail;
            let nextImages = [...(data.images || [])];

            if (pendingThumbnailRef.current && data.thumbnail === pendingThumbnailRef.current.previewUrl) {
                const uploaded = await uploadThumbnailMutation.mutateAsync(pendingThumbnailRef.current.file);
                if (!uploaded?.url) throw new Error('empty thumbnail url');
                nextThumbnail = uploaded.url;
            }

            const pendingByPreview = new Map(pendingGalleryRef.current.map((item) => [item.previewUrl, item.file]));
            const pendingPreviewUrls = nextImages.filter((url): url is string => !!url && pendingByPreview.has(url));

            if (pendingPreviewUrls.length > 0) {
                const uploadedImages = await uploadGalleryMutation.mutateAsync(
                    pendingPreviewUrls.map((url) => pendingByPreview.get(url) as File)
                );
                const uploadedByPreview = new Map(
                    pendingPreviewUrls.map((previewUrl, index) => [previewUrl, uploadedImages[index]?.url])
                );

                nextImages = nextImages
                    .map((url) => (url ? uploadedByPreview.get(url) || url : url))
                    .filter((url): url is string => !!url && !url.startsWith('blob:'));
            }

            return {
                ...data,
                thumbnail: nextThumbnail,
                images: nextImages,
            };
        },
        clearPendingImages,
    }));

    const handleThumbnailUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        const input = e.target;
        if (!file) return;

        revokePreview(pendingThumbnailRef.current?.previewUrl);
        const previewUrl = URL.createObjectURL(file);
        pendingThumbnailRef.current = { previewUrl, file };
        setValue('thumbnail', previewUrl, { shouldValidate: true, shouldDirty: true });
        input.value = '';
    };

    const handleGalleryUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        const input = e.target;
        if (files.length === 0) return;

        const pendingImages = files.map((file) => ({
            previewUrl: URL.createObjectURL(file),
            file,
        }));

        pendingGalleryRef.current = [...pendingGalleryRef.current, ...pendingImages];
        setValue('images', [...images, ...pendingImages.map((item) => item.previewUrl)], { shouldValidate: true, shouldDirty: true });
        input.value = '';
    };

    const removeImage = (index: number) => {
        const urlToRemove = images[index];
        if (!urlToRemove) return;

        if (urlToRemove.startsWith('blob:')) {
            revokePreview(urlToRemove);
            pendingGalleryRef.current = pendingGalleryRef.current.filter((item) => item.previewUrl !== urlToRemove);
        }

        const newImages = images.filter((_, i) => i !== index);
        setValue('images', newImages, { shouldDirty: true });
    };

    const removeThumbnail = () => {
        if (!thumbnail) return;

        if (thumbnail.startsWith('blob:')) {
            revokePreview(thumbnail);
        }

        pendingThumbnailRef.current = null;
        setValue('thumbnail', '', { shouldDirty: true });
    };

    return (
        <div className="space-y-8">
            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                    {t('form.media.thumbnail')} <span className="text-red-500">*</span>
                </label>
                <div
                    onClick={() => thumbInputRef.current?.click()}
                    className={`relative w-full aspect-video md:w-80 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center transition-all overflow-hidden ${
                        thumbnail
                            ? 'border-transparent cursor-pointer'
                            : 'border-slate-200 hover:border-[#14b8a6] hover:bg-[#dff7f4] cursor-pointer'
                    }`}
                >
                    {thumbnail ? (
                        <>
                            <img src={thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
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
                                        Change
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
                            <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm font-medium text-slate-600">Click to upload thumbnail</p>
                            <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
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
                {thumbnailError && (
                    <p className="text-xs text-red-500 font-bold mt-2">{thumbnailError}</p>
                )}
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
                                    alt={`Gallery ${index + 1}`}
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
                        onClick={() => galleryInputRef.current?.click()}
                        className="aspect-square rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-[#14b8a6] hover:bg-[#dff7f4] transition-all text-slate-400"
                    >
                        <Plus className="w-6 h-6 mb-1" />
                        <span className="text-[10px] font-medium uppercase tracking-wider">Add Image</span>
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

            <div data-location-field="video_url">
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
                {videoUrlError && (
                    <p className="text-xs text-red-500 font-medium mt-1">{videoUrlError}</p>
                )}
            </div>
        </div>
    );
});

ImageUploader.displayName = 'ImageUploader';

export default ImageUploader;
