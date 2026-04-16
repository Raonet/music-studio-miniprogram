App({
  globalData: {
    isLoggedIn: false,
    token: null,
    userInfo: null,
  },

  onLaunch() {
    const token = wx.getStorageSync('token');
    if (token) {
      this.globalData.token = token;
      this.globalData.isLoggedIn = true;
    }
  },
});
