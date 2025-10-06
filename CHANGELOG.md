# Changelog - Mobile & UX Improvements

## Changes Implemented

### 1. **Mobile Calendar View - Dot Badges**
- ✅ Changed client calendar view to show a single dot badge with post count instead of media type tags
- ✅ Keeps calendar symmetric and square on mobile
- ✅ Admin view still shows draggable post thumbnails
- **Files Modified:**
  - `src/components/calendar/CalendarDay.tsx`

### 2. **Month Name Abbreviation**
- ✅ Month names now display only first 3 letters (e.g., "Outubro" → "Out")
- ✅ Applied to both month and week views
- **Files Modified:**
  - `src/components/calendar/CalendarHeader.tsx`

### 3. **Insights & Ideas Feature**
- ✅ Added dedicated Insights tab to client navigation
- ✅ Client can create, edit, and delete their own insights
- ✅ Admin can view and comment on insights
- ✅ Notifications sent to admin when client adds insight
- ✅ Full CRUD operations for insights
- **Files Modified:**
  - `src/app/client/[clientId]/layout.tsx` - Added Insights tab
  - `src/app/client/[clientId]/insights/page.tsx` - New insights page
  - `src/components/insights/InsightsPanel.tsx` - Updated with edit/delete
  - `src/app/client/[clientId]/page.tsx` - Removed insights button (now in nav)
- **Database Changes:**
  - `insights_table.sql` - Already exists
  - `notifications_table.sql` - Added "insight" notification type
  - `src/lib/database.types.ts` - Updated types for new notification structure

### 4. **Carousel Swipe on Mobile**
- ✅ Added touch/swipe gestures for carousel navigation
- ✅ Swipe left/right to navigate between images on mobile
- ✅ Minimum swipe distance of 50px to prevent accidental swipes
- **Files Modified:**
  - `src/components/common/PostModal.tsx`

### 5. **Fixed Action Buttons**
- ✅ Approve, Disapprove, and Edit buttons now fixed at bottom of modal
- ✅ Buttons centered for better UX
- ✅ Different layouts for client vs admin
- **Files Modified:**
  - `src/components/common/PostModal.tsx`

### 6. **Fixed Modal Background**
- ✅ Modal background now fixed and doesn't scroll on mobile
- ✅ Prevents background page scrolling when modal is open
- ✅ Added `overscroll-contain` for better mobile behavior
- **Files Modified:**
  - `src/components/common/Modal.tsx`
  - `src/components/common/PostModal.tsx`

### 7. **Contained Logs**
- ✅ Log entries now properly contained within modal
- ✅ Added overflow handling for large log histories
- ✅ Added bottom padding to prevent content hiding behind fixed buttons
- **Files Modified:**
  - `src/components/common/PostModal.tsx`

## Database Schema Updates

### Notifications Table
```sql
-- Updated to support insight notifications
- Added 'insight' to notification types
- Made post_id optional (NULL for insight notifications)
- Changed 'read' to 'is_read' for consistency
- Added default urgency value
```

### Type Updates
- Updated `database.types.ts` to reflect notification schema changes
- Added "insight" type to notification types
- Updated all notification-related code to use `is_read` instead of `read`

## Testing Checklist

- [ ] Test mobile calendar view shows dots instead of tags
- [ ] Verify month abbreviation displays correctly
- [ ] Test insights create/edit/delete functionality
- [ ] Verify admin receives notifications when client adds insight
- [ ] Test carousel swipe on mobile devices
- [ ] Verify modal buttons are fixed at bottom
- [ ] Test modal background doesn't scroll on mobile
- [ ] Verify logs are contained and scrollable within modal
- [ ] Run database migrations for notification table updates
- [ ] Test notification system with new insight type

## Migration Instructions

1. **Update Notifications Table:**
   ```bash
   # Run the updated notifications_table.sql script
   psql -d your_database < notifications_table.sql
   ```

2. **No changes needed for insights table** - already exists

3. **Restart development server** to pick up new types

## Notes

- All changes are backward compatible
- No breaking changes to existing functionality
- Mobile-first approach maintained throughout
- Improved UX for both client and admin users

