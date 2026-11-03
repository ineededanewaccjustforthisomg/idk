const DAY_SECONDS = 86400;
const WEEK_SECONDS = 604800;
const MONTH_SECONDS = 2592000;

module.exports = class ServerTime {
    static getTodayTimeLeft() {
        const now = new Date();
        const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
        return DAY_SECONDS - Math.floor((now - dayStart) / 1000);
    }
    
    static getWeekTimeLeft() {
        const now = new Date();
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - (now.getDay() + 6) % 7);
    
        return WEEK_SECONDS - Math.floor((now - weekStart) / 1000);
    }
    
    static getMonthTimeLeft() {
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
        return MONTH_SECONDS - Math.floor((now - monthStart) / 1000);
    }

    static getDaySeconds() {
        return DAY_SECONDS;
    }

    static getWeekSeconds() {
        return WEEK_SECONDS;
    }

    static getMonthSeconds() {
        return MONTH_SECONDS;
    }
}