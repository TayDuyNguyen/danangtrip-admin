# Checklist: 07-interactions

- [ ] Form dùng react-hook-form + yupResolver — không validate thủ công.
- [ ] Yup schema nhận `t: TFunction` — không hardcode messages.
- [ ] Submit: onSuccess → toast.success + close modal + invalidateQueries.
- [ ] Delete confirm: conditional render dialog (KHÔNG window.confirm).
- [ ] Search: debounce 300ms trước khi update query.
- [ ] Pagination: sync với URL search params.
- [ ] Filter: sync với URL search params + Reset All hoạt động.
- [ ] Export: button disabled + spinner khi loading.
- [ ] Mọi action có success toast + error toast.
- [ ] Loading state: button disabled + spinner khi mutation pending.
- [ ] i18n: cập nhật cả vi và en locale files cùng lúc.
- [ ] Không có hardcoded user-facing strings.
