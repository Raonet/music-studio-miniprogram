const allRecords = [
  { id: 1, date: '2026-04-14 14:00', course: '钢琴基础课', teacher: '王老师', duration: '60分钟', status: '已上课', statusKey: 'completed' },
  { id: 2, date: '2026-04-12 15:00', course: '乐理课', teacher: '李老师', duration: '45分钟', status: '已上课', statusKey: 'completed' },
  { id: 3, date: '2026-04-10 10:00', course: '钢琴进阶课', teacher: '张老师', duration: '60分钟', status: '已上课', statusKey: 'completed' },
  { id: 4, date: '2026-04-08 16:00', course: '钢琴基础课', teacher: '王老师', duration: '60分钟', status: '已请假', statusKey: 'leave' },
  { id: 5, date: '2026-04-06 14:00', course: '乐理课', teacher: '李老师', duration: '45分钟', status: '已上课', statusKey: 'completed' },
  { id: 6, date: '2026-04-04 15:00', course: '钢琴进阶课', teacher: '张老师', duration: '60分钟', status: '待补课', statusKey: 'makeup' }
]

Page({
  data: {
    tabs: ['全部', '已上课', '已请假', '待补课'],
    activeTab: '全部',
    filteredRecords: allRecords
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
  },

  setTab(e) {
    const tab = e.currentTarget.dataset.tab
    const filtered = tab === '全部' ? allRecords : allRecords.filter(r => r.status === tab)
    this.setData({ activeTab: tab, filteredRecords: filtered })
  }
})
