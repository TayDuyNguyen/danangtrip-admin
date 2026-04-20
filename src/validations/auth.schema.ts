import type { TFunction } from "i18next";
import * as yup from "yup";

/**
 * Auth-related validation schemas
 */
export const loginSchema = (t: TFunction) => yup.object({
    email: yup.string().email(t("validation.email_invalid")).required(t("validation.email_required")),
    password: yup.string().required(t("validation.password_required")).min(6, t("validation.password_min")),
});
