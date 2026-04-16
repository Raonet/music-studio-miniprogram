const { get } = require('../../utils/request');

function pad(n) { return String(n).padStart(2, '0'); }

function buildCalendar(year, month, lessonDates) {
  const firstWeekday = new Date(year, month - 1, 1).getDay();
  const offset = (firstWeekday + 6) % 7; // 周一=0 ... 周日=6
  const daysInMonth = new Date(year, month, 0).getDate();
  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  const daysInPrev = new Date(prevYear, prevMonth, 0).getDate();
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const lessonSet = new Set(lessonDates || []);
  const days = [];

  for (let i = offset - 1; i >= 0; i--) {
    days.push({ date: daysInPrev - i, type: 'other', dateStr: '', hasLesson: false, isToday: false });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${pad(month)}-${pad(d)}`;
    days.push({ date: d, type: 'current', dateStr, hasLesson: lessonSet.has(dateStr), isToday: dateStr === todayStr });
  }

  const rem = days.length % 7;
  if (rem !== 0) {
    for (let d = 1; d <= 7 - rem; d++) {
      days.push({ date: d, type: 'other', dateStr: '', hasLesson: false, isToday: false });
    }
  }

  return days;
}

function applyClasses(days, selectedDate) {
  return days.map(function(item) {
    const isSelected = item.dateStr && item.dateStr === selectedDate;
    const isOther = item.type === 'other';
    const isToday = item.isToday && !isSelected;

    let wrapClass = 'cal-date-wrap';
    if (isSelected) wrapClass += ' cal-date-selected-bg';
    else if (isToday) wrapClass += ' cal-date-today-bg';

    let textClass = 'cal-date-text';
    if (isOther) textClass += ' cal-date-dim';
    else if (isSelected) textClass += ' cal-date-active';
    else if (isToday) textClass += ' cal-date-today';

    let dotClass = 'cal-dot';
    if (isSelected) dotClass += ' cal-dot-dim';

    return Object.assign({}, item, { wrapClass, textClass, dotClass });
  });
}

function formatDateLabel(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  const y = parseInt(parts[0]);
  const m = parseInt(parts[1]);
  const d = parseInt(parts[2]);
  const weekNames = ['日', '一', '二', '三', '四', '五', '六'];
  const weekday = new Date(y, m - 1, d).getDay();
  return m + '月' + d + '日  周' + weekNames[weekday];
}

Page({
  data: {
    isLoggedIn: false,
    year: 0,
    month: 0,
    selectedDate: '',
    selectedDateLabel: '',
    weekLabels: ['一', '二', '三', '四', '五', '六', '日'],
    calDays: [],
    lessons: [],
    lessonsByDate: {},
    lessonDates: [],
  },

  _monthCache: {},

  onLoad() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const selectedDate = `${year}-${pad(month)}-${pad(now.getDate())}`;
    const rawDays = buildCalendar(year, month, []);
    const calDays = applyClasses(rawDays, selectedDate);
    this.setData({
      year, month, selectedDate,
      selectedDateLabel: formatDateLabel(selectedDate),
      calDays,
    });
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 });
    }
    const app = getApp();
    const isLoggedIn = app.globalData.isLoggedIn;
    this.setData({ isLoggedIn });
    if (isLoggedIn) {
      this._loadMonth(this.data.year, this.data.month);
    } else {
      this.setData({ calDays: applyClasses(buildCalendar(this.data.year, this.data.month, []), ''), lessons: [] });
    }
  },

  async _loadMonth(year, month) {
    try {
      const data = await get(`/app/music/schedule/month?year=${year}&month=${month}`);
      const lessonDates = data.lessonDates || [];
      const lessonsByDate = data.lessonsByDate || {};
      const rawDays = buildCalendar(year, month, lessonDates);
      const calDays = applyClasses(rawDays, this.data.selectedDate);
      const lessons = lessonsByDate[this.data.selectedDate] || [];
      this.setData({ calDays, lessonsByDate, lessonDates, lessons });
    } catch (e) {
      console.error('加载月历失败', e);
    }
  },

  selectCalDay(e) {
    const date = e.currentTarget.dataset.date;
    const type = e.currentTarget.dataset.type;
    if (type !== 'current' || !date) return;
    const rawDays = buildCalendar(this.data.year, this.data.month, this.data.lessonDates);
    const calDays = applyClasses(rawDays, date);
    const lessons = this.data.lessonsByDate[date] || [];
    this.setData({
      selectedDate: date,
      selectedDateLabel: formatDateLabel(date),
      calDays,
      lessons,
    });
  },

  prevMonth() {
    let { year, month } = this.data;
    month--;
    if (month < 1) { month = 12; year--; }
    const newPrefix = `${year}-${pad(month)}-`;
    const selectedDate = this.data.selectedDate.startsWith(newPrefix) ? this.data.selectedDate : '';
    const rawDays = buildCalendar(year, month, []);
    const calDays = applyClasses(rawDays, selectedDate);
    this.setData({
      year, month, selectedDate,
      selectedDateLabel: formatDateLabel(selectedDate),
      calDays, lessons: [], lessonDates: [], lessonsByDate: {},
    });
    if (this.data.isLoggedIn) {
      this._loadMonth(year, month);
    }
  },

  nextMonth() {
    let { year, month } = this.data;
    month++;
    if (month > 12) { month = 1; year++; }
    const newPrefix = `${year}-${pad(month)}-`;
    const selectedDate = this.data.selectedDate.startsWith(newPrefix) ? this.data.selectedDate : '';
    const rawDays = buildCalendar(year, month, []);
    const calDays = applyClasses(rawDays, selectedDate);
    this.setData({
      year, month, selectedDate,
      selectedDateLabel: formatDateLabel(selectedDate),
      calDays, lessons: [], lessonDates: [], lessonsByDate: {},
    });
    if (this.data.isLoggedIn) {
      this._loadMonth(year, month);
    }
  },
});
