# Test Report: Chi tiết Tour (Tour Detail)

- **Feature Slug:** `tour-detail`
- **Date:** 2026-05-15
- **Verdict:** ❌ NOT READY (Fails core functional toggles and data presentation)

---

## 1. Summary
The `tour-detail` feature has been implemented with a solid layout and responsive structure. However, it fails several functional and visual gates. Specifically, the "Featured" and "Hot" toggles are broken (API or Permission issue), and several data fields display "No data" placeholders even when the tour object exists. Additionally, critical authentication refresh issues were observed.

---

## 2. Phase 1: Static Gates
| Gate | Status | Evidence |
| :--- | :--- | :--- |
| **Lint** | ✅ PASS | 0 errors, 0 warnings |
| **Typecheck** | ✅ PASS | No TypeScript errors |
| **Build** | ✅ PASS | Vite production build successful |
| **Prepush** | ✅ PASS | All internal quality gates passed |

---

## 3. Phase 2: UI Visual, Copy, and Polish Review
| Check | Status | Findings |
| :--- | :--- | :--- |
| Layout | ✅ PASS | Responsive at Desktop, Tablet, and Mobile. Stacks correctly on small screens. |
| Loading States | ✅ PASS | Skeletons appear during initial load and preserve layout. |
| Empty States | ⚠️ FAIL | **Defect:** Main image and specific date fields show "Không tìm thấy tour nào" placeholder instead of the actual data or a cleaner "N/A". |
| UI Copy | ✅ PASS | Vietnamese labels are consistent. No raw i18n keys found. |
| Visual Polish | ✅ PASS | Alignment and spacing follow the design system. |

---

## 4. Phase 3: Functional Flow Testing
| Flow | Status | Findings |
| :--- | :--- | :--- |
| CRUD / Edit | ✅ PASS | Navigates to Edit page correctly. |
| **Featured Toggle** | ❌ FAIL | **Defect:** Clicking the toggle results in an error toast: "Lỗi khi cập nhật trạng thái nổi bật". |
| **Hot Toggle** | ❌ FAIL | **Defect:** Clicking the toggle results in an error toast. |
| **Navigation** | ⚠️ FAIL | **UX Issue:** "Hủy" from the Edit page redirects to the Tour List, but should return to the Tour Detail page. |
| Data Loading | ✅ PASS | Itinerary and Schedules sections load and display data (though itinerary content is often empty). |

---

## 5. Phase 4: Edge Case Testing
| Scenario | Status | Findings |
| :--- | :--- | :--- |
| Boundary Values | ✅ PASS | Handled 0 bookings and 0 reviews gracefully. |
| **Console Review**| ❌ FAIL | **Defect:** Multiple 401/403 errors on `/api/v1/auth/refresh`. Frequent session invalidation. |

---

## 6. Phase 5: Regression Testing
| Area | Status | Findings |
| :--- | :--- | :--- |
| i18n | ⚠️ SKIPPED | Verified Vietnamese; English toggle was blocked by session expiry during testing. |
| Auth/Permissions | ⚠️ FAIL | Role-based redirection works, but auth refresh logic is unstable. |

---

## 7. Residual Risks & Next Steps
1.  **Fix Mutations:** Investigate why `featuredMutation` and `hotMutation` are failing. Check API endpoint and permissions.
2.  **Fix Data Mapping:** Resolve why certain fields (Thumbnail, Available Dates) are falling back to the "No data" placeholder.
3.  **Authentication:** Fix the refresh token loop causing frequent session loss.
4.  **UX Polish:** Update the navigation logic in the Edit page to return to the previous Detail view on cancel.

---

**Reported by:** Antigravity (QA Agent)
