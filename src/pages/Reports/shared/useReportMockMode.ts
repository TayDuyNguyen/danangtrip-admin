import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { REPORTS_MOCK_PARAM } from './reports.constants';

export function useReportMockMode() {
    const { t } = useTranslation('reports_common');
    const [searchParams, setSearchParams] = useSearchParams();

    const isMockMode = searchParams.get(REPORTS_MOCK_PARAM) === '1';

    const setIsMockMode = useCallback(
        (value: boolean | ((prev: boolean) => boolean)) => {
            const nextMode = typeof value === 'function' ? value(isMockMode) : value;
            setSearchParams((prev) => {
                const next = new URLSearchParams(prev);
                if (nextMode) next.set(REPORTS_MOCK_PARAM, '1');
                else next.delete(REPORTS_MOCK_PARAM);
                return next;
            });
        },
        [isMockMode, setSearchParams]
    );

    const toggleMockMode = useCallback(() => {
        const nextMode = !isMockMode;
        toast.success(
            nextMode ? t('mock.toast_switched_mock') : t('mock.toast_switched_real')
        );
        setIsMockMode(nextMode);
    }, [isMockMode, setIsMockMode, t]);

    const enableMockMode = useCallback(() => {
        if (isMockMode) return;
        setIsMockMode(true);
        toast.success(t('mock.toast_switched_mock'));
    }, [isMockMode, setIsMockMode, t]);

    return {
        isMockMode,
        setIsMockMode,
        toggleMockMode,
        enableMockMode,
    };
}

/** Shows a one-time warning when API fails and mock mode is off */
export function useReportApiErrorToast(isRealError: boolean, isMockMode: boolean) {
    const { t } = useTranslation('reports_common');
    const warnedRef = useRef(false);

    useEffect(() => {
        if (isRealError && !isMockMode && !warnedRef.current) {
            warnedRef.current = true;
            toast.warning(t('mock.toast_to_mock'));
        }
        if (!isRealError) {
            warnedRef.current = false;
        }
    }, [isRealError, isMockMode, t]);
}

export default useReportMockMode;
