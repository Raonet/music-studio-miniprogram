const { get, post } = require('../../utils/request');

Page({
  data: {
    courses: [],
    courseIndex: -1,
    selectedCourse: '',
    selectedDate: '',
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
    this._loadCourses();
  },

  async _loadCourses() {
    try {
      const data = await get('/app/music/course/list');
      if (Array.isArray(data) && data.length > 0) {
        const courses = data.map(c => `${c.name} - ${c.teacherName || '待定'}`);
        this.setData({ courses });
      }
    } catch (e) {
      // 加载失败时保留空列表，用户仍可手动输入
    }
  },

  onCourseChange(e) {
    const idx = e.detail.value;
    this.setData({ courseIndex: idx, selectedCourse: this.data.courses[idx] }, () => this.checkCanSubmit());
  },

  onDateChange(e) {
    this.setData({ selectedDate: e.detail.value }, () => this.checkCanSubmit());
  },

  onReasonInput(e) {
    this.setData({ reason: e.detail.value }, () => this.checkCanSubmit());
  },

  checkCanSubmit() {
    const { selectedCourse, selectedDate, reason } = this.data;
    this.setData({ canSubmit: !!(selectedCourse && selectedDate && reason.trim()) });
  },

  async handleSubmit() {
    if (!this.data.canSubmit || this.data.submitting) return;

    // 从 selectedCourse 提取课程名（去掉 "- 老师名" 部分）
    const courseName = this.data.selectedCourse.split(' - ')[0];

    this.setData({ submitting: true });
    try {
      await post('/app/music/leave/submit', {
        courseName,
        leaveDate: this.data.selectedDate,
        reason: this.data.reason,
      });
      wx.showToast({ title: '申请已提交', icon: 'success' });
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    } catch (e) {
      wx.showToast({ title: e?.message || '提交失败，请重试', icon: 'none' });
    } finally {
      this.setData({ submitting: false });
    }
  },
});
