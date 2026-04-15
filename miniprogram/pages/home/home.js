// 下节课：2026-04-16 15:00（月份0-indexed，所以4月=3）
var NEXT_LESSON_TIME = new Date(2026, 3, 16, 15, 0, 0).getTime()

Page({
  data: {
    statusBarHeight: 0,
    showReminderModal: false,
    nextLessonTime: NEXT_LESSON_TIME,
    recentLessons: [
      { id: 1, date: '2026-04-14', type: '钢琴基础课', teacher: '王老师', duration: '60分钟' },
      { id: 2, date: '2026-04-12', type: '乐理课', teacher: '李老师', duration: '45分钟' },
      { id: 3, date: '2026-04-10', type: '钢琴进阶课', teacher: '张老师', duration: '60分钟' }
    ]
  },

  onLoad() {
    const info = wx.getSystemInfoSync()
    this.setData({ statusBarHeight: info.statusBarHeight })
  },

  onReady() {
    this.drawProgressRing()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
  },

  drawProgressRing() {
    const query = wx.createSelectorQuery()
    query.select('#progressCanvas').fields({ node: true, size: true }).exec((res) => {
      if (!res[0]) return
      const canvas = res[0].node
      const ctx = canvas.getContext('2d')
      const dpr = wx.getSystemInfoSync().pixelRatio
      canvas.width = 192 * dpr
      canvas.height = 192 * dpr
      ctx.scale(dpr, dpr)

      const cx = 96, cy = 96, r = 76, lw = 12
      const progress = 0.6

      // Background circle
      ctx.beginPath()
      ctx.arc(cx, cy, r, 0, 2 * Math.PI)
      ctx.strokeStyle = '#2E2D35'
      ctx.lineWidth = lw
      ctx.stroke()

      // Progress arc
      const gradient = ctx.createLinearGradient(0, 0, 192, 192)
      gradient.addColorStop(0, '#E2C07A')
      gradient.addColorStop(1, '#C9A84C')
      ctx.beginPath()
      ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * progress)
      ctx.strokeStyle = gradient
      ctx.lineWidth = lw
      ctx.lineCap = 'round'
      ctx.stroke()
    })
  },

  showReminder() {
    this.setData({ showReminderModal: true })
  },

  hideReminder() {
    this.setData({ showReminderModal: false })
  },

  goSchedule() { wx.switchTab({ url: '/pages/schedule/schedule' }) },
  goLeave() { wx.navigateTo({ url: '/pages/leave/leave' }) },
  goHistory() { wx.switchTab({ url: '/pages/history/history' }) },
  goMessages() { wx.switchTab({ url: '/pages/messages/messages' }) }
})
