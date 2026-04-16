const { get } = require('../../utils/request');

Page({
  data: {
    isLoggedIn: false,
    statusBarHeight: 0,
    showReminderModal: false,
    nextLessonTime: 0,
    nextLesson: null,
    recentLessons: [],
    remainingLessons: 0,
    totalLessons: 0,
    packageProgress: 0,
    expireDate: '',
    greeting: '你好',
  },

  onLoad() {
    const info = wx.getSystemInfoSync();
    const h = new Date().getHours();
    const greeting = h < 12 ? '上午好' : h < 18 ? '下午好' : '晚上好';
    this.setData({ statusBarHeight: info.statusBarHeight, greeting });
  },

  onReady() {
    this.drawProgressRing();
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 });
    }
    const app = getApp();
    const isLoggedIn = app.globalData.isLoggedIn;
    this.setData({ isLoggedIn });
    if (isLoggedIn) {
      this._loadData();
    } else {
      this.setData({
        nextLesson: null,
        nextLessonTime: 0,
        recentLessons: [],
        remainingLessons: 0,
        totalLessons: 0,
      });
    }
  },

  async _loadData() {
    try {
      const [next, recent, profile] = await Promise.all([
        get('/app/music/schedule/next').catch(() => null),
        get('/app/music/schedule/recent?limit=3').catch(() => []),
        get('/app/music/student/profile').catch(() => null),
      ]);

      const updates = {};

      if (next) {
        updates.nextLesson = next;
        updates.nextLessonTime = next.lessonTime;
      }

      if (Array.isArray(recent)) {
        updates.recentLessons = recent;
      }

      if (profile) {
        updates.remainingLessons = profile.remainingLessons || 0;
        updates.totalLessons = profile.totalLessons || 0;
        updates.expireDate = profile.package?.expireDate || '';
        updates.packageProgress = profile.totalLessons > 0
          ? Math.round(profile.usedLessons / profile.totalLessons * 100)
          : 0;
      }

      this.setData(updates);
      this.drawProgressRing();
    } catch (e) {
      console.error('首页数据加载失败', e);
    }
  },

  drawProgressRing() {
    const progress = this.data.packageProgress / 100 || 0;
    const query = wx.createSelectorQuery();
    query.select('#progressCanvas').fields({ node: true, size: true }).exec((res) => {
      if (!res[0]) return;
      const canvas = res[0].node;
      const ctx = canvas.getContext('2d');
      const dpr = wx.getSystemInfoSync().pixelRatio;
      canvas.width = 192 * dpr;
      canvas.height = 192 * dpr;
      ctx.scale(dpr, dpr);

      const cx = 96, cy = 96, r = 76, lw = 12;

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, 2 * Math.PI);
      ctx.strokeStyle = '#2E2D35';
      ctx.lineWidth = lw;
      ctx.stroke();

      if (progress > 0) {
        const gradient = ctx.createLinearGradient(0, 0, 192, 192);
        gradient.addColorStop(0, '#E2C07A');
        gradient.addColorStop(1, '#C9A84C');
        ctx.beginPath();
        ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * progress);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = lw;
        ctx.lineCap = 'round';
        ctx.stroke();
      }
    });
  },

  showReminder() {
    if (!this.data.nextLesson) return;
    this.setData({ showReminderModal: true });
  },

  hideReminder() {
    this.setData({ showReminderModal: false });
  },

  goSchedule() { wx.switchTab({ url: '/pages/schedule/schedule' }); },
  goLeave() { wx.navigateTo({ url: '/pages/leave/leave' }); },
  goHistory() { wx.switchTab({ url: '/pages/history/history' }); },
  goMessages() { wx.switchTab({ url: '/pages/messages/messages' }); }
});
