Page({
  data: {
    menuItems: [
      { icon: '/assets/icons/user-gold.svg', label: '个人资料', action: 'info' },
      { icon: '/assets/icons/phone-gold.svg', label: '联系教务', action: 'contact' },
      { icon: '/assets/icons/file-text-gold.svg', label: '请假记录', action: 'leave' },
      { icon: '/assets/icons/info-gold.svg', label: '关于我们', action: 'about' }
    ]
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 4 })
    }
  },

  onMenuTap(e) {
    const action = e.currentTarget.dataset.action
    if (action === 'leave') {
      wx.navigateTo({ url: '/pages/leave-records/leave-records' })
    } else if (action === 'contact') {
      wx.makePhoneCall({ phoneNumber: '400-000-0000' })
    } else {
      wx.showToast({ title: '功能开发中', icon: 'none' })
    }
  },

  handleLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确认退出当前账号？',
      confirmColor: '#C9A84C',
      success(res) {
        if (res.confirm) {
          wx.showToast({ title: '已退出', icon: 'success' })
        }
      }
    })
  }
})
