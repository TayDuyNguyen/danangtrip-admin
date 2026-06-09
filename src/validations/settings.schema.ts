import * as yup from "yup";
import type { TFunction } from "i18next";

export const websiteSettingsSchema = (t: TFunction) => yup.object({
    general: yup.object({
        hotline: yup.string()
            .required(t("settings:validation.hotline_required", { defaultValue: "Support Hotline is required." }))
            .matches(/^(0[35789])[0-9]{8}$|^1900\s?\d{4}$|^1800\s?\d{4}$/, t("settings:validation.hotline_invalid", { defaultValue: "Invalid hotline or Vietnamese phone format." })),
        email: yup.string()
            .required(t("settings:validation.email_required", { defaultValue: "Support Email is required." }))
            .email(t("settings:validation.email_invalid", { defaultValue: "Invalid email address format." })),
        address: yup.string()
            .required(t("settings:validation.address_required", { defaultValue: "Corporate Address is required." })),
        support_hours: yup.string()
            .required(t("settings:validation.support_hours_required", { defaultValue: "Support Hours is required." })),
    }),
    brand: yup.object({
        website_name: yup.string()
            .required(t("settings:validation.website_name_required", { defaultValue: "Website Name is required." })),
        logo: yup.string()
            .required(t("settings:validation.logo_required", { defaultValue: "Brand logo is required." })),
        favicon: yup.string()
            .required(t("settings:validation.favicon_required", { defaultValue: "Browser favicon is required." })),
    }),
    social: yup.object({
        facebook: yup.string().url().nullable().optional().default(""),
        instagram: yup.string().url().nullable().optional().default(""),
        youtube: yup.string().url().nullable().optional().default(""),
        tiktok: yup.string().url().nullable().optional().default(""),
        zalo: yup.string().url().nullable().optional().default(""),
    }),
    payment: yup.object({
        sepay: yup.boolean().required(),
        cod: yup.boolean().required(),
        vnpay: yup.boolean().required(),
        momo: yup.boolean().required(),
        zalopay: yup.boolean().required(),
    }).test(
        "at-least-one-payment",
        t("settings:validation.payment_required", { defaultValue: "At least one payment gateway must be enabled." }),
        (value) => {
            return !!(value?.sepay || value?.cod || value?.vnpay || value?.momo || value?.zalopay);
        }
    ),
    policy: yup.object({
        terms: yup.string().url().nullable().optional().default(""),
        privacy: yup.string().url().nullable().optional().default(""),
        data_protection: yup.string().url().nullable().optional().default(""),
    }),
    seo: yup.object({
        meta_title: yup.string()
            .required(t("settings:validation.meta_title_min", { defaultValue: "Meta title is required." }))
            .min(10, t("settings:validation.meta_title_min", { defaultValue: "Meta title must be at least 10 characters." }))
            .max(100, t("settings:validation.meta_title_max", { defaultValue: "Meta title cannot exceed 100 characters." })),
        meta_description: yup.string()
            .required(t("settings:validation.meta_description_min", { defaultValue: "Meta description is required." }))
            .min(20, t("settings:validation.meta_description_min", { defaultValue: "Meta description must be at least 20 characters." }))
            .max(200, t("settings:validation.meta_description_max", { defaultValue: "Meta description cannot exceed 200 characters." })),
        og_image: yup.string().nullable().optional().default(""),
    }),
});

export type WebsiteSettingsInput = yup.InferType<ReturnType<typeof websiteSettingsSchema>>;
