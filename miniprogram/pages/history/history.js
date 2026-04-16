const { get } = require('../../utils/request');

const TAB_STATUS_MAP = {
  '已上课': 'completed',
  '已请假': 'leave',
  '待补课': 'makeup',
};

Page({
  data: {
    isLoggedIn: false,
    tabs: ['全部', '已上课', '已请假', '待补课'],
    activeTab: '全部',
    filteredRecords: [],
    allRecords: [],
    usedLessons: 0,
    totalHours: 0,
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 });
    }
    const app = getApp();
    const isLoggedIn = app.globalData.isLoggedIn;
    this.setData({ isLoggedIn });
    if (isLoggedIn) {
      this._loadRecords();
    } else {
      this.setData({ filteredRecords: [], allRecords: [], usedLessons: 0, totalHours: 0 });
    }
  },

  async _loadRecords(statusFilter) {
    try {
      const statusKey = statusFilter ? TAB_STATUS_MAP[statusFilter] : undefined;
      const url = statusKey
        ? `/app/music/lesson/records?status=${statusKey}`
        : '/app/music/lesson/records';
      const data = await get(url);
      this.setData({
        allRecords: data.records || [],
        filteredRecords: data.records || [],
        usedLessons: data.summary?.usedLessons || 0,
        totalHours: data.summary?.totalHours || 0,
      });
    } catch (e) {
      console.error('加载课时记录失败', e);
    }
  },

  setTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
    if (!this.data.isLoggedIn) return;
    if (tab === '全部') {
      this._loadRecords();
    } else {
      this._loadRecords(tab);
    }
  },
});
