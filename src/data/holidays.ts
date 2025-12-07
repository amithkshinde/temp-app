
// Proxy file for backward compatibility/cache busting
export * from './holiday-data';
// Explicit re-exports if star export fails for some reason or types
export {
    PUBLIC_HOLIDAYS_2025,
    getPublicHolidays,
    MOCK_HOLIDAYS,
    addHoliday,
    USER_HOLIDAY_SELECTIONS,
    toggleUserSelection
} from './holiday-data';
