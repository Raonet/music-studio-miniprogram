Component({
  data: {
    selected: 0,
    tabs: [
      {
        label: '首页', path: '/pages/home/home',
        iconActive: '/assets/icons/home-gold.svg',
        iconInactive: '/assets/icons/home-gray.svg'
      },
      {
        label: '课程表', path: '/pages/schedule/schedule',
        iconActive: '/assets/icons/calendar-gold.svg',
        iconInactive: '/assets/icons/calendar-gray.svg'
      },
      {
        label: '课时', path: '/pages/history/history',
        iconActive: '/assets/icons/clock-gold.svg',
        iconInactive: '/assets/icons/clock-gray.svg'
      },
      {
        label: '消息', path: '/pages/messages/messages',
        iconActive: '/assets/icons/message-square-gold.svg',
        iconInactive: '/assets/icons/message-square-gray.svg'
      },
      {
        label: '我的', path: '/pages/profile/profile',
        iconActive: '/assets/icons/user-gold.svg',
        iconInactive: '/assets/icons/user-gray.svg'
      }
    ]
  },
  methods: {
    switchTab(e) {
      const { path, index } = e.currentTarget.dataset
      this.setData({ selected: index })
      wx.switchTab({ url: path })
    }
  }
})
