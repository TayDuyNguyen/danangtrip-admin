import * as yup from "yup";
import type { TFunction } from "i18next";

/**
 * User Creation Validation Schema
 */
export const createUserSchema = (t: TFunction) => yup.object({
    full_name: yup.string()
        .required(t("user:validation.required", { field: t("user:detail.label_full_name") }))
        .max(100, t("user:validation.max_length", { field: t("user:detail.label_full_name"), max: 100 })),

    username: yup.string()
        .required(t("user:validation.required", { field: t("user:detail.label_username") }))
        .max(50, t("user:validation.max_length", { field: t("user:detail.label_username"), max: 50 }))
        .matches(/^[a-z0-9_]+$/, t("user:validation.username_format")),

    email: yup.string()
        .required(t("user:validation.required", { field: t("user:detail.label_email") }))
        .email(t("user:validation.email"))
        .max(100, t("user:validation.max_length", { field: t("user:detail.label_email"), max: 100 })),

    password: yup.string()
        .required(t("user:validation.required", { field: t("user:create.label_password") }))
        .min(8, t("user:validation.min_length", { field: t("user:create.label_password"), min: 8 }))
        .matches(
            /^(?=.*[A-Za-z])(?=.*\d).+$/,
            t("user:validation.password_complexity")
        ),

    password_confirmation: yup.string()
        .required(t("user:validation.required", { field: t("user:create.label_password_confirm") }))
        .oneOf([yup.ref("password")], t("user:validation.password_mismatch")),

    phone: yup.string()
        .optional()
        .nullable()
        .transform((v) => (v === "" || v === undefined ? null : v))
        .test("phone-format", t("user:validation.phone_format"), (v) => {
            if (!v) return true;
            return /^\+?[0-9\s\-.()]{9,20}$/.test(v);
        }),

    birthdate: yup.string()
        .optional()
        .nullable()
        .transform((v) => (v === "" || v === undefined ? null : v)),

    gender: yup.string()
        .optional()
        .nullable()
        .transform((v) => (v === "" || v === undefined ? null : v)),

    city: yup.string()
        .optional()
        .nullable()
        .transform((v) => (v === "" || v === undefined ? null : v))
        .max(100, t("user:validation.max_length", { field: t("user:detail.label_city"), max: 100 })),

    role: yup.string()
        .required()
        .oneOf(["admin", "user"])
        .default("user"),

    status: yup.string()
        .required()
        .oneOf(["active", "banned"])
        .default("active"),
});

export type CreateUserInput = yup.InferType<ReturnType<typeof createUserSchema>>;

/**
 * User Editing Validation Schema
 */
export const editUserSchema = (t: TFunction) => yup.object({
    full_name: yup.string()
        .required(t("user:validation.required", { field: t("user:detail.label_full_name") }))
        .max(100, t("user:validation.max_length", { field: t("user:detail.label_full_name"), max: 100 })),

    email: yup.string()
        .required(t("user:validation.required", { field: t("user:detail.label_email") }))
        .email(t("user:validation.email"))
        .max(100, t("user:validation.max_length", { field: t("user:detail.label_email"), max: 100 })),

    phone: yup.string()
        .optional()
        .nullable()
        .transform((v) => (v === "" || v === undefined ? null : v))
        .test("phone-format", t("user:validation.phone_format"), (v) => {
            if (!v) return true;
            return /^\+?[0-9\s\-.()]{9,20}$/.test(v);
        }),

    birthdate: yup.string()
        .optional()
        .nullable()
        .transform((v) => (v === "" || v === undefined ? null : v)),

    gender: yup.string()
        .optional()
        .nullable()
        .transform((v) => (v === "" || v === undefined ? null : v)),

    city: yup.string()
        .optional()
        .nullable()
        .transform((v) => (v === "" || v === undefined ? null : v))
        .max(100, t("user:validation.max_length", { field: t("user:detail.label_city"), max: 100 })),

    role: yup.string()
        .required()
        .oneOf(["admin", "user"])
        .default("user"),

    status: yup.string()
        .required()
        .oneOf(["active", "banned"])
        .default("active"),
});

export type EditUserInput = yup.InferType<ReturnType<typeof editUserSchema>>;
