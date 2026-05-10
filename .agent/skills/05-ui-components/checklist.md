# Checklist: 05-ui-components

- [ ] Đã scan `src/components/ui/` và `src/components/common/` trước khi tạo mới.
- [ ] Mọi component có typed props interface (không `any`, không `FC<>`).
- [ ] Atoms: đặt đúng `src/components/ui/`.
- [ ] Shared molecules (>= 2 features): đặt đúng `src/components/common/`.
- [ ] Feature components: đặt đúng `src/pages/<Feature>/components/`.
- [ ] Loading state: dùng Skeleton (KHÔNG full-page spinner).
- [ ] Empty state: EmptyState component hoặc "No data" message.
- [ ] Error state: handled qua props.
- [ ] Icons: chỉ lucide-react hoặc react-icons — không dùng icon set khác.
- [ ] Không có data fetching trong component — chỉ nhận data qua props.
- [ ] Text strings: nhận qua props đã translated (không gọi `t()` trong atom).
- [ ] Responsive: Tailwind breakpoints, mobile-first.
- [ ] Không có hardcoded colors ngoài design system.
