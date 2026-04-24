const { get, BASE_URL } = require('../../utils/request');

const CAPTCHA_URL = BASE_URL + '/app/user/login/captcha';

Page({
  data: {
    isLoggedIn: false,
    // 登录表单
    loginPhone: '',
    loginCode: '',
    captchaNodes: [],
    captchaId: '',
    // 新用户注册表单
    showRegisterForm: false,
    registerKey: '',
    registerNickName: '',
    registerSpecialty: '',
    // 个人信息
    studentNo: '',
    specialty: '',
    nickName: '',
    contactPhone: '',
    avatarUrl: '',
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
      url: CAPTCHA_URL + '?width=200&height=80',
      method: 'GET',
      success: (res) => {
        if (res.data && res.data.code === 1000) {
          const { captchaId, data } = res.data.data;
          const captchaNodes = [{
            name: 'img',
            attrs: { src: data, style: 'width:100%;height:100%;display:block;' }
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
    wx.showLoading({ title: '验证中...' });
    wx.request({
      url: BASE_URL + '/app/user/login/phoneCaptcha',
      method: 'POST',
      data: { phone: loginPhone, captchaId, code: loginCode },
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        wx.hideLoading();
        if (res.data && res.data.code === 1000) {
          const result = res.data.data;
          if (result.isNew) {
            // 新用户，弹出注册表单
            this.setData({ showRegisterForm: true, registerKey: result.registerKey });
          } else {
            this._handleLoginSuccess(result.token);
          }
        } else {
          this._loadCaptcha();
          wx.showToast({ title: res.data?.message || '验证失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误，请重试', icon: 'none' });
      }
    });
  },

  onNickNameInput(e) {
    this.setData({ registerNickName: e.detail.value });
  },

  onSpecialtyInput(e) {
    this.setData({ registerSpecialty: e.detail.value });
  },

  onCompleteProfile() {
    const { registerKey, registerNickName, registerSpecialty } = this.data;
    if (!registerNickName) {
      wx.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    if (!registerSpecialty) {
      wx.showToast({ title: '请输入专长方向', icon: 'none' });
      return;
    }
    wx.showLoading({ title: '注册中...' });
    wx.request({
      url: BASE_URL + '/app/user/login/completeProfile',
      method: 'POST',
      data: { registerKey, nickName: registerNickName, specialty: registerSpecialty },
      header: { 'Content-Type': 'application/json' },
      success: (res) => {
        wx.hideLoading();
        if (res.data && res.data.code === 1000 && res.data.data.token) {
          this.setData({ showRegisterForm: false, registerNickName: '', registerSpecialty: '' });
          this._handleLoginSuccess(res.data.data.token);
          wx.showToast({ title: '注册成功', icon: 'success' });
        } else {
          wx.showToast({ title: res.data?.message || '注册失败', icon: 'none' });
        }
      },
      fail: () => {
        wx.hideLoading();
        wx.showToast({ title: '网络错误，请重试', icon: 'none' });
      }
    });
  },

  _handleLoginSuccess(token) {
    wx.setStorageSync('token', token);
    const app = getApp();
    app.globalData.token = token;
    app.globalData.isLoggedIn = true;
    this.setData({ isLoggedIn: true, loginPhone: '', loginCode: '' });
    this._loadProfile();
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
        nickName: data.nickName || '',
        contactPhone: data.contactPhone || '',
        avatarUrl: data.avatarUrl || '',
        avatarText: data.nickName ? data.nickName.charAt(0) : (data.specialty ? data.specialty.charAt(0) : '学'),
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
    if (action === 'info') {
      wx.navigateTo({ url: '/pages/profile-edit/profile-edit' });
    } else if (action === 'leave') {
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
