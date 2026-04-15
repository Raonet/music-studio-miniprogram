const ALL_LESSONS = {
  '2026-04-14': [
    { id: 1, time: '10:00-11:00', course: '钢琴基础课', teacher: '王老师', teacherAvatar: '王', room: 'A101 教室', status: '待上课' }
  ],
  '2026-04-16': [
    { id: 2, time: '15:00-16:00', course: '钢琴进阶课', teacher: '李老师', teacherAvatar: '李', room: 'B205 教室', status: '待上课' }
  ],
  '2026-04-17': [
    { id: 3, time: '18:30-19:15', course: '乐理课', teacher: '张老师', teacherAvatar: '张', room: 'C302 教室', status: '待上课' }
  ],
  '2026-04-19': [
    { id: 4, time: '10:00-11:00', course: '钢琴基础课', teacher: '王老师', teacherAvatar: '王', room: 'A101 教室', status: '待上课' }
  ],
  '2026-04-22': [
    { id: 5, time: '15:00-16:00', course: '钢琴进阶课', teacher: '李老师', teacherAvatar: '李', room: 'B205 教室', status: '待上课' }
  ],
  '2026-04-26': [
    { id: 6, time: '10:00-11:00', course: '钢琴基础课', teacher: '王老师', teacherAvatar: '王', room: 'A101 教室', status: '待上课' },
    { id: 7, time: '14:00-14:45', course: '乐理课', teacher: '张老师', teacherAvatar: '张', room: 'C302 教室', status: '待上课' }
  ]
}

function pad(n) { return String(n).padStart(2, '0') }

function buildCalendar(year, month) {
  const firstWeekday = new Date(year, month - 1, 1).getDay()
  const offset = (firstWeekday + 6) % 7  // 周一=0 ... 周日=6

  const daysInMonth = new Date(year, month, 0).getDate()

  const prevYear = month === 1 ? year - 1 : year
  const prevMonth = month === 1 ? 12 : month - 1
  const daysInPrev = new Date(prevYear, prevMonth, 0).getDate()

  const now = new Date()
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`

  const days = []

  for (let i = offset - 1; i >= 0; i--) {
    days.push({ date: daysInPrev - i, type: 'other', dateStr: '', hasLesson: false, isToday: false })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${pad(month)}-${pad(d)}`
    days.push({ date: d, type: 'current', dateStr, hasLesson: !!ALL_LESSONS[dateStr], isToday: dateStr === todayStr })
  }

  const rem = days.length % 7
  if (rem !== 0) {
    for (let d = 1; d <= 7 - rem; d++) {
      days.push({ date: d, type: 'other', dateStr: '', hasLesson: false, isToday: false })
    }
  }

  return days
}

// 根据 selectedDate 给每个 day 加上预计算的 class 字符串
function applyClasses(days, selectedDate) {
  return days.map(function(item) {
    var isSelected = item.dateStr && item.dateStr === selectedDate
    var isOther = item.type === 'other'
    var isToday = item.isToday && !isSelected

    var wrapClass = 'cal-date-wrap'
    if (isSelected) wrapClass += ' cal-date-selected-bg'
    else if (isToday) wrapClass += ' cal-date-today-bg'

    var textClass = 'cal-date-text'
    if (isOther) textClass += ' cal-date-dim'
    else if (isSelected) textClass += ' cal-date-active'
    else if (isToday) textClass += ' cal-date-today'

    var dotClass = 'cal-dot'
    if (isSelected) dotClass += ' cal-dot-dim'

    return Object.assign({}, item, { wrapClass: wrapClass, textClass: textClass, dotClass: dotClass })
  })
}

function formatDateLabel(dateStr) {
  if (!dateStr) return ''
  var parts = dateStr.split('-')
  var y = parseInt(parts[0])
  var m = parseInt(parts[1])
  var d = parseInt(parts[2])
  var weekNames = ['日', '一', '二', '三', '四', '五', '六']
  var weekday = new Date(y, m - 1, d).getDay()
  return m + '月' + d + '日  周' + weekNames[weekday]
}

Page({
  data: {
    year: 0,
    month: 0,
    selectedDate: '',
    selectedDateLabel: '',
    weekLabels: ['一', '二', '三', '四', '五', '六', '日'],
    calDays: [],
    lessons: []
  },

  onLoad: function() {
    var now = new Date()
    var year = now.getFullYear()
    var month = now.getMonth() + 1
    var selectedDate = year + '-' + pad(month) + '-' + pad(now.getDate())
    var rawDays = buildCalendar(year, month)
    var calDays = applyClasses(rawDays, selectedDate)
    var lessons = ALL_LESSONS[selectedDate] || []
    this.setData({
      year: year,
      month: month,
      selectedDate: selectedDate,
      selectedDateLabel: formatDateLabel(selectedDate),
      calDays: calDays,
      lessons: lessons
    })
  },

  onShow: function() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
  },

  selectCalDay: function(e) {
    var date = e.currentTarget.dataset.date
    var type = e.currentTarget.dataset.type
    if (type !== 'current' || !date) return
    var rawDays = buildCalendar(this.data.year, this.data.month)
    var calDays = applyClasses(rawDays, date)
    var lessons = ALL_LESSONS[date] || []
    this.setData({
      selectedDate: date,
      selectedDateLabel: formatDateLabel(date),
      calDays: calDays,
      lessons: lessons
    })
  },

  prevMonth: function() {
    var year = this.data.year
    var month = this.data.month - 1
    if (month < 1) { month = 12; year-- }
    var newPrefix = year + '-' + pad(month) + '-'
    var selectedDate = this.data.selectedDate.indexOf(newPrefix) === 0 ? this.data.selectedDate : ''
    var rawDays = buildCalendar(year, month)
    var calDays = applyClasses(rawDays, selectedDate)
    var lessons = selectedDate ? (ALL_LESSONS[selectedDate] || []) : []
    this.setData({
      year: year,
      month: month,
      selectedDate: selectedDate,
      selectedDateLabel: formatDateLabel(selectedDate),
      calDays: calDays,
      lessons: lessons
    })
  },

  nextMonth: function() {
    var year = this.data.year
    var month = this.data.month + 1
    if (month > 12) { month = 1; year++ }
    var newPrefix = year + '-' + pad(month) + '-'
    var selectedDate = this.data.selectedDate.indexOf(newPrefix) === 0 ? this.data.selectedDate : ''
    var rawDays = buildCalendar(year, month)
    var calDays = applyClasses(rawDays, selectedDate)
    var lessons = selectedDate ? (ALL_LESSONS[selectedDate] || []) : []
    this.setData({
      year: year,
      month: month,
      selectedDate: selectedDate,
      selectedDateLabel: formatDateLabel(selectedDate),
      calDays: calDays,
      lessons: lessons
    })
  }
})
