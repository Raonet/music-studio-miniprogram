Component({
  properties: {
    title: { type: String, value: '' },
    showBack: { type: Boolean, value: true }
  },
  data: {
    statusBarHeight: 0
  },
  lifetimes: {
    attached() {
      const info = wx.getSystemInfoSync()
      this.setData({ statusBarHeight: info.statusBarHeight })
    }
  },
  methods: {
    goBack() {
      wx.navigateBack()
    }
  }
})
