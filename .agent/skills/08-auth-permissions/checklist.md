# Checklist: 08-auth-permissions

- [ ] Route mới wrap ProtectedRoute trong `src/routes/`.
- [ ] Unauthorized access → redirect /login.
- [ ] Role-based UI: conditional render (KHÔNG CSS hide).
- [ ] Dùng useUserStore từ `src/store/useUserStore.ts` — không tạo store mới.
- [ ] Token attachment: KHÔNG duplicate logic trong API module (đã có trong axiosClient).
- [ ] Logout: useUserStore.getState().logout() → redirect /login.
- [ ] Manual test: access feature without auth → redirect đúng.
- [ ] Auth review tạo đúng path: `.agent/artifacts/auth/...`.
