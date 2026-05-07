const { get, post } = require('../../utils/request');

Page({
  data: {
    schedules: [],       // 原始排课数据
    scheduleLabels: [],  // 展示用的拼接字符串
    scheduleIndex: -1,
    selectedSchedule: null,
    reason: '',
    canSubmit: false,
    submitting: false,
    policies: [
      '请假需提前24小时申请，否则将扣除课时',
      '每月仅可请假2次，超出次数将视为旷课',
      '请假成功后，课时将自动保留，可在有效期内补课',
      '如遇紧急情况，请联系教务老师说明'
    ]
  },

  onLoad() {
    this._loadUpcoming();
  },

  async _loadUpcoming() {
    try {
      const data = await get('/app/music/schedule/upcoming');
      if (Array.isArray(data) && data.length > 0) {
        this.setData({
          schedules: data,
          scheduleLabels: data.map(s => s.label),
        });
      }
    } catch (e) {
      wx.showToast({ title: '加载课程失败', icon: 'none' });
    }
  },

  onScheduleChange(e) {
    const idx = parseInt(e.detail.value);
    const selected = this.data.schedules[idx];
    this.setData({ scheduleIndex: idx, selectedSchedule: selected }, () => this.checkCanSubmit());
  },

  onReasonInput(e) {
    this.setData({ reason: e.detail.value }, () => this.checkCanSubmit());
  },

  checkCanSubmit() {
    const { selectedSchedule, reason } = this.data;
    this.setData({ canSubmit: !!(selectedSchedule && reason.trim()) });
  },

  async handleSubmit() {
    if (!this.data.canSubmit || this.data.submitting) return;

    const { selectedSchedule, reason } = this.data;
    this.setData({ submitting: true });
    try {
      await post('/app/music/leave/submit', {
        scheduleId: selectedSchedule.id,
        courseName: selectedSchedule.courseName,
        leaveDate: selectedSchedule.leaveDate,
        reason,
      });
      wx.showToast({ title: '申请已提交', icon: 'success' });
      setTimeout(() => wx.navigateBack(), 1500);
    } catch (e) {
      wx.showToast({ title: e?.message || '提交失败，请重试', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
