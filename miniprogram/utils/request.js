const BASE_URL = 'http://111.230.47.47/api';

// tabBar 页面列表，退出登录态后这些页面只刷新不跳转
const TAB_BAR_PAGES = [
  'pages/index/index',
  'pages/courses/courses',
  'pages/calendar/calendar',
  'pages/messages/messages',
  'pages/profile/profile',
];

let authFailHandling = false;

function handleAuthFail() {
  if (authFailHandling) return;
  authFailHandling = true;

  wx.removeStorageSync('token');
  const app = getApp();
  if (app && app.globalData) {
    app.globalData.isLoggedIn = false;
    app.globalData.token = null;
    app.globalData.userInfo = null;
  }

  wx.showToast({ title: '登录已失效，请重新登录', icon: 'none' });

  const pages = getCurrentPages();
  const currentPage = pages.length > 0 ? pages[pages.length - 1] : null;
  const isTabBar = currentPage && TAB_BAR_PAGES.indexOf(currentPage.route) >= 0;

  setTimeout(() => {
    if (isTabBar) {
      // tabBar 页（如 profile）：直接走 onShow 重新渲染未登录态
      if (currentPage && typeof currentPage.onShow === 'function') {
        currentPage.onShow();
      }
    } else if (pages.length > 1) {
      // 非 tabBar 页：返回上一页
      wx.navigateBack();
    } else {
      // 没有上一页：跳到 profile tab
      wx.switchTab({ url: '/pages/profile/profile' });
    }
    authFailHandling = false;
  }, 800);
}

/**
 * 统一请求方法，自动携带 Authorization token
 * @param {object} options - { url, method, data, noToken }
 * @returns {Promise}
 */
function request(options) {
  const app = getApp();
  const token = wx.getStorageSync('token');

  const header = {
    'Content-Type': 'application/json',
  };

  if (token && !options.noToken) {
    header['Authorization'] = token;
  }

  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header,
      success(res) {
        const isAuthFail =
          res.statusCode === 401 ||
          (res.data && typeof res.data.message === 'string' && res.data.message.indexOf('登录失效') >= 0);
        if (isAuthFail) {
          handleAuthFail();
          reject({ code: 401, message: '登录已失效，请重新登录' });
          return;
        }
        if (res.data && res.data.code === 1000) {
          resolve(res.data.data);
        } else {
          reject(res.data);
        }
      },
      fail(err) {
        reject(err);
      },
    });
  });
}

function get(url, data) {
  return request({ url, method: 'GET', data });
}

function post(url, data) {
  return request({ url, method: 'POST', data });
}

module.exports = { request, get, post, BASE_URL };
