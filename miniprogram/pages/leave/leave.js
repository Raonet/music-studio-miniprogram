Page({
  data: {
    courses: ['钢琴基础课 - 王老师', '钢琴进阶课 - 李老师', '乐理课 - 张老师'],
    courseIndex: -1,
    selectedCourse: '',
    selectedDate: '',
    reason: '',
    canSubmit: false,
    policies: [
      '请假需提前24小时申请，否则将扣除课时',
      '每月仅可请假2次，超出次数将视为旷课',
      '请假成功后，课时将自动保留，可在有效期内补课',
      '如遇紧急情况，请联系教务老师说明'
    ]
  },

  onCourseChange(e) {
    const idx = e.detail.value
    this.setData({ courseIndex: idx, selectedCourse: this.data.courses[idx] }, () => this.checkCanSubmit())
  },

  onDateChange(e) {
    this.setData({ selectedDate: e.detail.value }, () => this.checkCanSubmit())
  },

  onReasonInput(e) {
    this.setData({ reason: e.detail.value }, () => this.checkCanSubmit())
  },

  checkCanSubmit() {
    const { selectedCourse, selectedDate, reason } = this.data
    this.setData({ canSubmit: !!(selectedCourse && selectedDate && reason.trim()) })
  },

  handleSubmit() {
    if (!this.data.canSubmit) return
    wx.showToast({ title: '申请已提交', icon: 'success' })
  }
})
