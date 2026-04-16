const { get } = require('../../utils/request');

Page({
  data: {
    isLoggedIn: false,
    studentNo: '',
    specialty: '',
    avatarText: '',
    totalLessons: 0,
    usedLessons: 0,
    remainingLessons: 0,
    package: null,
    packageProgress: 0,
    menuItems: [
      { icon: '/assets/icons/user-gold.svg', label: '个人资料', action: 'info' },
      { icon: '/assets/icons/phone-gold.svg', label: '联系教务', action: 'contact' },
      { icon: '/assets/icons/file-text-gold.svg', label: '请假记录', action: 'leave' },
      { icon: '/assets/icons/info-gold.svg', label: '关于我们', action: 'about' }
    ]
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 4 });
    }
    const app = getApp();
    const isLoggedIn = app.globalData.isLoggedIn;
    this.setData({ isLoggedIn });
    if (isLoggedIn) {
      this._loadProfile();
    }
  },

  async _loadProfile() {
    try {
      const data = await get('/app/music/student/profile');
      const pkg = data.package;
      const progress = pkg && pkg.totalLessons > 0
        ? Math.round(pkg.usedLessons / pkg.totalLessons * 100)
        : 0;
      this.setData({
        studentNo: data.studentNo || '',
        specialty: data.specialty || '',
        avatarText: data.specialty ? data.specialty.charAt(0) : '学',
        totalLessons: data.totalLessons,
        usedLessons: data.usedLessons,
        remainingLessons: data.remainingLessons,
        package: pkg,
        packageProgress: progress,
      });
    } catch (e) {
      console.error('加载个人信息失败', e);
    }
  },

  onLogin(e) {
    if (e.detail.errMsg !== 'getPhoneNumber:ok') {
      wx.showToast({ title: '授权失败，请重试', icon: 'none' });
      return;
    }
    const phoneCode = e.detail.code;
    wx.login({
      success: (loginRes) => {
        if (!loginRes.code) {
          wx.showToast({ title: '登录失败，请重试', icon: 'none' });
          return;
        }
        const jsCode = loginRes.code;
        wx.request({
          url: 'http://127.0.0.1:8001/app/user/login/miniPhoneNew',
          method: 'POST',
          data: { jsCode, phoneCode },
          header: { 'Content-Type': 'application/json' },
          success: (res) => {
            if (res.data && res.data.code === 1000 && res.data.data && res.data.data.token) {
              const token = res.data.data.token;
              wx.setStorageSync('token', token);
              const app = getApp();
              app.globalData.token = token;
              app.globalData.isLoggedIn = true;
              this.setData({ isLoggedIn: true });
              this._loadProfile();
              wx.showToast({ title: '登录成功', icon: 'success' });
            } else {
              wx.showToast({ title: res.data?.message || '登录失败', icon: 'none' });
            }
          },
          fail: () => {
            wx.showToast({ title: '网络错误，请重试', icon: 'none' });
          }
        });
      }
    });
  },

  onMenuTap(e) {
    const action = e.currentTarget.dataset.action;
    if (action === 'leave') {
      wx.navigateTo({ url: '/pages/leave-records/leave-records' });
    } else if (action === 'contact') {
      wx.makePhoneCall({ phoneNumber: '400-000-0000' });
    } else {
      wx.showToast({ title: '功能开发中', icon: 'none' });
    }
  },

  handleLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确认退出当前账号？',
      confirmColor: '#C9A84C',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('token');
          const app = getApp();
          app.globalData.token = null;
          app.globalData.isLoggedIn = false;
          app.globalData.userInfo = null;
          this.setData({ isLoggedIn: false });
          wx.showToast({ title: '已退出', icon: 'success' });
        }
      }
    });
  }
});
