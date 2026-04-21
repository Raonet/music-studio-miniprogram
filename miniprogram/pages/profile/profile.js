const { get, BASE_URL } = require('../../utils/request');

const CAPTCHA_URL = BASE_URL + '/app/user/login/captcha';

Page({
  data: {
    isLoggedIn: false,
    loginPhone: '',
    loginCode: '',
    captchaNodes: [],
    captchaId: '',
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
    } else {
      this._loadCaptcha();
    }
  },

  _loadCaptcha() {
    wx.request({
      url: CAPTCHA_URL + '?width=240&height=80',
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.code === 1000) {
          const { captchaId, data } = res.data.data;
          // data 是 svg+xml base64，用 rich-text 的 img 节点渲染
          const captchaNodes = [{
            name: 'img',
            attrs: { src: data, style: 'width:200rpx;height:80rpx;display:block;' }
          }];
          this.setData({ captchaId, captchaNodes });
        }
      }
    });
  },

  refreshCaptcha() {
    this._loadCaptcha();
  },

  onPhoneInput(e) {
    this.setData({ loginPhone: e.detail.value });
  },

  onCodeInput(e) {
    this.setData({ loginCode: e.detail.value });
  },

  onLogin() {
    const { loginPhone, loginCode, captchaId } = this.data;
    if (!loginPhone || loginPhone.length !== 11) {
      wx.showToast({ title: '请输入正确的手机号', icon: 'none' });
      return;
    }
    if (!loginCode) {
      wx.showToast({ title: '请输入验证码', icon: 'none' });
      return;
    }
    wx.request({
      url: BASE_URL + '/app/user/login/phoneCaptcha',
      method: 'POST',
      data: { phone: loginPhone, captchaId, code: loginCode },
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        if (res.data && res.data.code === 1000 && res.data.data && res.data.data.token) {
          const token = res.data.data.token;
          wx.setStorageSync('token', token);
          const app = getApp();
          app.globalData.token = token;
          app.globalData.isLoggedIn = true;
          this.setData({ isLoggedIn: true, loginPhone: '', loginCode: '' });
          this._loadProfile();
          wx.showToast({ title: '登录成功', icon: 'success' });
        } else {
          this._loadCaptcha();
          wx.showToast({ title: res.data?.message || '登录失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误，请重试', icon: 'none' });
      }
    });
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
          this._loadCaptcha();
          wx.showToast({ title: '已退出', icon: 'success' });
        }
      }
    });
  }
});
