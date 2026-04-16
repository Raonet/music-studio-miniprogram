const BASE_URL = 'http://127.0.0.1:8001';

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
        if (res.statusCode === 401) {
          // Token 失效，清除登录态并刷新页面
          wx.removeStorageSync('token');
          if (app) {
            app.globalData.isLoggedIn = false;
            app.globalData.token = null;
            app.globalData.userInfo = null;
          }
          // 通知当前页面刷新
          const pages = getCurrentPages();
          if (pages.length > 0) {
            const currentPage = pages[pages.length - 1];
            if (typeof currentPage.onShow === 'function') {
              currentPage.onShow();
            }
          }
          reject({ code: 401, message: '请先登录' });
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
