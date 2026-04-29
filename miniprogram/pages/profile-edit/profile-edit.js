const { get, post, BASE_URL } = require('../../utils/request');

Page({
  data: {
    // 表单数据
    nickName: '',
    contactPhone: '',
    gender: 0,
    avatarUrl: '',
    specialty: '',          // 逗号分隔的多选值，如 "钢琴,小提琴"
    specialtyArr: [],       // 当前已选 value 数组
    // 字典
    specialtyOptions: [],   // [{ label, value }]
    genderOptions: [
      { label: '保密', value: 0 },
      { label: '男', value: 1 },
      { label: '女', value: 2 },
    ],
    saving: false,
  },

  onLoad() {
    const app = getApp();
    if (!app.globalData.isLoggedIn) {
      wx.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => wx.navigateBack(), 1500);
      return;
    }
    this._loadData();
  },

  async _loadData() {
    wx.showLoading({ title: '加载中...' });
    try {
      const [profile, dictRes] = await Promise.all([
        get('/app/music/student/profile'),
        new Promise((resolve) => {
          wx.request({
            url: BASE_URL + '/app/dict/info/data',
            method: 'POST',
            data: { types: ['musicSpecialty'] },
            header: { 'Content-Type': 'application/json' },
            success: (res) => resolve(res.data?.data || {}),
            fail: () => resolve({}),
          });
        }),
      ]);

      const specialtyOptions = (dictRes['musicSpecialty'] || []).map(item => ({
        label: item.name,
        value: item.name,
      }));

      const specialtyArr = profile.specialty
        ? profile.specialty.split(',').map(s => s.trim()).filter(Boolean)
        : [];

      this.setData({
        nickName: profile.nickName || '',
        contactPhone: profile.contactPhone || '',
        gender: profile.gender ?? 0,
        avatarUrl: profile.avatarUrl || '',
        specialty: profile.specialty || '',
        specialtyArr,
        specialtyOptions,
      });
    } catch (e) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    } finally {
      wx.hideLoading();
    }
  },

  onNickNameInput(e) {
    this.setData({ nickName: e.detail.value });
  },

  onPhoneInput(e) {
    this.setData({ contactPhone: e.detail.value });
  },

  onGenderChange(e) {
    this.setData({ gender: this.data.genderOptions[e.detail.value].value });
  },

  onSpecialtyToggle(e) {
    const val = e.currentTarget.dataset.value;
    const arr = [...this.data.specialtyArr];
    const idx = arr.indexOf(val);
    if (idx >= 0) {
      arr.splice(idx, 1);
    } else {
      arr.push(val);
    }
    this.setData({ specialtyArr: arr, specialty: arr.join(',') });
  },

  chooseAvatar() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles[0].tempFilePath;
        wx.uploadFile({
          url: BASE_URL + '/base/comm/upload',
          filePath: tempFilePath,
          name: 'file',
          header: { Authorization: wx.getStorageSync('token') },
          success: (uploadRes) => {
            const data = JSON.parse(uploadRes.data);
            if (data.code === 1000 && data.data?.url) {
              this.setData({ avatarUrl: data.data.url });
            } else {
              wx.showToast({ title: '上传失败', icon: 'none' });
            }
          },
          fail: () => wx.showToast({ title: '上传失败', icon: 'none' }),
        });
      },
    });
  },

  async onSave() {
    const { nickName, contactPhone, gender, avatarUrl, specialty, saving } = this.data;
    if (saving) return;
    if (!nickName) {
      wx.showToast({ title: '请输入姓名', icon: 'none' });
      return;
    }
    this.setData({ saving: true });
    try {
      await post('/app/music/student/updateProfile', {
        nickName, contactPhone, gender, avatarUrl, specialty,
      });
      wx.showToast({ title: '保存成功', icon: 'success' });
      // 通知上一页刷新
      const pages = getCurrentPages();
      const profilePage = pages.find(p => p.route === 'pages/profile/profile');
      if (profilePage) profilePage._loadProfile();
      setTimeout(() => wx.navigateBack(), 800);
    } catch (e) {
      wx.showToast({ title: e?.message || '保存失败', icon: 'none' });
    } finally {
      this.setData({ saving: false });
    }
  },
});
