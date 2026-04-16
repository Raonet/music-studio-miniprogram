const { get } = require('../../utils/request');

const TAB_STATUS_MAP = {
  '审批中': 'pending',
  '已批准': 'approved',
  '已拒绝': 'rejected',
};

Page({
  data: {
    isLoggedIn: false,
    tabs: ['全部', '审批中', '已批准', '已拒绝'],
    activeTab: '全部',
    filteredRecords: [],
  },

  onShow() {
    const app = getApp();
    const isLoggedIn = app.globalData.isLoggedIn;
    this.setData({ isLoggedIn });
    if (isLoggedIn) {
      this._loadRecords();
    } else {
      this.setData({ filteredRecords: [] });
    }
  },

  async _loadRecords(statusFilter) {
    try {
      const statusKey = statusFilter ? TAB_STATUS_MAP[statusFilter] : undefined;
      const url = statusKey
        ? `/app/music/leave/records?status=${statusKey}`
        : '/app/music/leave/records';
      const records = await get(url);
      this.setData({ filteredRecords: records || [] });
    } catch (e) {
      console.error('加载请假记录失败', e);
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
