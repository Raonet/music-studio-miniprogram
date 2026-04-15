const allRecords = [
  { id: 1, course: '钢琴基础课', leaveDate: '2026-04-08', reason: '身体不适，发烧', submittedAt: '2026-04-07', status: '已批准', statusKey: 'approved' },
  { id: 2, course: '乐理课', leaveDate: '2026-04-15', reason: '家庭事务，需要处理', submittedAt: '2026-04-13', status: '审批中', statusKey: 'pending' },
  { id: 3, course: '钢琴进阶课', leaveDate: '2026-03-22', reason: '出差在外，无法到场', submittedAt: '2026-03-20', status: '已批准', statusKey: 'approved' },
  { id: 4, course: '钢琴基础课', leaveDate: '2026-03-10', reason: '考试周，学业紧张', submittedAt: '2026-03-09', status: '已拒绝', statusKey: 'rejected' }
]

Page({
  data: {
    tabs: ['全部', '审批中', '已批准', '已拒绝'],
    activeTab: '全部',
    filteredRecords: allRecords
  },

  setTab(e) {
    const tab = e.currentTarget.dataset.tab
    const filtered = tab === '全部' ? allRecords : allRecords.filter(r => r.status === tab)
    this.setData({ activeTab: tab, filteredRecords: filtered })
  }
})
