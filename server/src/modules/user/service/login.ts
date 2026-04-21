import { Config, Inject, Provide } from '@midwayjs/core';
import { BaseService, CoolCommException } from '@cool-midway/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Equal, Repository } from 'typeorm';
import { UserInfoEntity } from '../entity/info';
import { UserWxService } from './wx';
import * as jwt from 'jsonwebtoken';
import { UserWxEntity } from '../entity/wx';
import { BaseSysLoginService } from '../../base/service/sys/login';
import { UserSmsService } from './sms';
import { v1 as uuid } from 'uuid';
import * as md5 from 'md5';
import { PluginService } from '../../plugin/service/info';
import axios from 'axios';
import { CachingFactory, MidwayCache } from '@midwayjs/cache-manager';
import { MusicStudentEntity } from '../../music/entity/student';
import { BaseSysRoleEntity } from '../../base/entity/sys/role';
import { BaseSysDepartmentEntity } from '../../base/entity/sys/department';
import { BaseSysUserEntity } from '../../base/entity/sys/user';
import { BaseSysUserRoleEntity } from '../../base/entity/sys/user_role';

/**
 * 登录
 */
@Provide()
export class UserLoginService extends BaseService {
  @InjectEntityModel(UserInfoEntity)
  userInfoEntity: Repository<UserInfoEntity>;

  @InjectEntityModel(UserWxEntity)
  userWxEntity: Repository<UserWxEntity>;

  @Inject()
  userWxService: UserWxService;

  @Config('module.user.jwt')
  jwtConfig;

  @Inject()
  baseSysLoginService: BaseSysLoginService;

  @Inject()
  pluginService: PluginService;

  @Inject()
  userSmsService: UserSmsService;

  @InjectEntityModel(MusicStudentEntity)
  musicStudentEntity: Repository<MusicStudentEntity>;

  @InjectClient(CachingFactory, 'default')
  midwayCache: MidwayCache;

  @InjectEntityModel(BaseSysRoleEntity)
  sysRoleEntity: Repository<BaseSysRoleEntity>;

  @InjectEntityModel(BaseSysDepartmentEntity)
  sysDepartmentEntity: Repository<BaseSysDepartmentEntity>;

  @InjectEntityModel(BaseSysUserEntity)
  sysUserEntity: Repository<BaseSysUserEntity>;

  @InjectEntityModel(BaseSysUserRoleEntity)
  sysUserRoleEntity: Repository<BaseSysUserRoleEntity>;

  /**
   * 发送手机验证码
   * @param phone
   * @param captchaId
   * @param code
   */
  async smsCode(phone, captchaId, code) {
    // 1、检查图片验证码  2、发送短信验证码
    const check = await this.baseSysLoginService.captchaCheck(captchaId, code);
    if (!check) {
      throw new CoolCommException('图片验证码错误');
    }
    await this.userSmsService.sendSms(phone);
  }

  /**
   *  手机验证码登录
   * @param phone
   * @param smsCode
   */
  async phoneVerifyCode(phone, smsCode) {
    // 1、检查短信验证码  2、登录
    const check = await this.userSmsService.checkCode(phone, smsCode);
    if (check) {
      return await this.phone(phone);
    } else {
      throw new CoolCommException('验证码错误');
    }
  }

  /**
   * 小程序手机号登录
   * @param code
   * @param encryptedData
   * @param iv
   */
  async miniPhone(code, encryptedData, iv) {
    const phone = await this.userWxService.miniPhone(code, encryptedData, iv);
    if (phone) {
      return await this.phone(phone);
    } else {
      throw new CoolCommException('获得手机号失败，请检查配置');
    }
  }

  /**
   * 手机号一键登录
   * @param access_token
   * @param openid
   */
  async uniPhone(access_token, openid, appId) {
    const instance: any = await this.pluginService.getInstance('uniphone');
    const phone = await instance.getPhone(access_token, openid, appId);
    if (phone) {
      return await this.phone(phone);
    } else {
      throw new CoolCommException('获得手机号失败，请检查配置');
    }
  }

  /**
   * 手机号 + 图片验证码登录，新用户返回 registerKey 要求补充信息
   */
  async phoneCaptcha(phone: string, captchaId: string, code: string) {
    const check = await this.baseSysLoginService.captchaCheck(captchaId, code);
    if (!check) {
      throw new CoolCommException('验证码错误');
    }
    const user = await this.userInfoEntity.findOneBy({ phone: Equal(phone) });
    if (!user) {
      // 新用户：缓存手机号 10 分钟，返回 registerKey
      const registerKey = uuid();
      await this.midwayCache.set(`register:${registerKey}`, phone, 10 * 60 * 1000);
      return { isNew: true, registerKey };
    }
    return { isNew: false, ...(await this.token({ id: user.id })) };
  }

  /**
   * 新用户完善信息并注册
   */
  async completeProfile(registerKey: string, nickName: string, specialty: string) {
    const phone = await this.midwayCache.get(`register:${registerKey}`);
    if (!phone) {
      throw new CoolCommException('注册已过期，请重新获取验证码');
    }
    let user: any = await this.userInfoEntity.findOneBy({ phone: Equal(phone as string) });
    if (!user) {
      // 1. 创建小程序用户
      const result = await this.userInfoEntity.insert({
        phone: phone as string,
        unionid: phone as string,
        loginType: 2,
        nickName,
      });
      const userId = result.identifiers[0].id;

      // 2. 创建学员记录
      const studentNo = 'S' + Date.now().toString().slice(-6);
      await this.musicStudentEntity.insert({ userId, specialty, studentNo });

      // 3. 同步创建 admin 后台账号，并关联「学员」角色和「学员」部门
      await this._createSysUser(phone as string, nickName, userId);

      user = await this.userInfoEntity.findOneBy({ id: userId });
    }
    await this.midwayCache.del(`register:${registerKey}`);
    return this.token({ id: user.id });
  }

  /**
   * 同步创建 admin 系统用户，关联「学员」角色和「学员」部门
   */
  private async _createSysUser(phone: string, nickName: string, appUserId: number) {
    // 获取或创建「学员」部门
    let dept = await this.sysDepartmentEntity.findOneBy({ name: Equal('学员') });
    if (!dept) {
      const deptResult = await this.sysDepartmentEntity.insert({ name: '学员', orderNum: 99 });
      dept = await this.sysDepartmentEntity.findOneBy({ id: deptResult.identifiers[0].id });
    }

    // 获取或创建「学员」角色
    let role = await this.sysRoleEntity.findOneBy({ name: Equal('学员') });
    if (!role) {
      const roleResult = await this.sysRoleEntity.insert({
        name: '学员',
        label: 'student',
        remark: '小程序学员',
        relevance: false,
        menuIdList: [],
        departmentIdList: [],
        userId: '1',
      });
      role = await this.sysRoleEntity.findOneBy({ id: roleResult.identifiers[0].id });
    }

    // 创建系统用户（用手机号作为 username，默认密码为手机号后6位）
    const existSysUser = await this.sysUserEntity.findOneBy({ username: Equal(phone) });
    if (!existSysUser) {
      const password = md5(phone.slice(-6));
      const sysUserResult = await this.sysUserEntity.insert({
        username: phone,
        password,
        name: nickName,
        phone,
        nickName,
        departmentId: dept.id,
        status: 1,
      });
      const sysUserId = sysUserResult.identifiers[0].id;
      // 关联角色
      await this.sysUserRoleEntity.insert({ userId: sysUserId, roleId: role.id });
    }
  }

  /**
   * 手机登录
   * @param phone
   * @returns
   */
  async phone(phone: string) {
    let user: any = await this.userInfoEntity.findOneBy({
      phone: Equal(phone),
    });
    if (!user) {
      user = {
        phone,
        unionid: phone,
        loginType: 2,
        nickName: phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2'),
      };
      await this.userInfoEntity.insert(user);
    }
    return this.token({ id: user.id });
  }

  /**
   * 公众号登录
   * @param code
   */
  async mp(code: string) {
    let wxUserInfo = await this.userWxService.mpUserInfo(code);
    if (wxUserInfo) {
      delete wxUserInfo.privilege;
      wxUserInfo = await this.saveWxInfo(
        {
          openid: wxUserInfo.openid,
          unionid: wxUserInfo.unionid,
          avatarUrl: wxUserInfo.headimgurl,
          nickName: wxUserInfo.nickname,
          gender: wxUserInfo.sex,
          city: wxUserInfo.city,
          province: wxUserInfo.province,
          country: wxUserInfo.country,
        },
        1
      );
      return this.wxLoginToken(wxUserInfo);
    } else {
      throw new Error('微信登录失败');
    }
  }

  /**
   * 微信APP授权登录
   * @param code
   */
  async wxApp(code: string) {
    let wxUserInfo = await this.userWxService.appUserInfo(code);
    if (wxUserInfo) {
      delete wxUserInfo.privilege;
      wxUserInfo = await this.saveWxInfo(
        {
          openid: wxUserInfo.openid,
          unionid: wxUserInfo.unionid,
          avatarUrl: wxUserInfo.headimgurl,
          nickName: wxUserInfo.nickname,
          gender: wxUserInfo.sex,
          city: wxUserInfo.city,
          province: wxUserInfo.province,
          country: wxUserInfo.country,
        },
        1
      );
      return this.wxLoginToken(wxUserInfo);
    } else {
      throw new Error('微信登录失败');
    }
  }

  /**
   * 保存微信信息
   * @param wxUserInfo
   * @param type
   * @returns
   */
  async saveWxInfo(wxUserInfo, type) {
    const find: any = { openid: wxUserInfo.openid };
    let wxInfo: any = await this.userWxEntity.findOneBy(find);
    if (wxInfo) {
      wxUserInfo.id = wxInfo.id;
    }
    return this.userWxEntity.save({
      ...wxUserInfo,
      type,
    });
  }

  /**
   * 小程序登录
   * @param code
   * @param encryptedData
   * @param iv
   */
  async mini(code, encryptedData, iv) {
    let wxUserInfo = await this.userWxService.miniUserInfo(
      code,
      encryptedData,
      iv
    );
    if (wxUserInfo) {
      // 保存
      wxUserInfo = await this.saveWxInfo(wxUserInfo, 0);
      return await this.wxLoginToken(wxUserInfo);
    }
  }

  /**
   * 微信登录 获得token
   * @param wxUserInfo 微信用户信息
   * @returns
   */
  async wxLoginToken(wxUserInfo) {
    const unionid = wxUserInfo.unionid ? wxUserInfo.unionid : wxUserInfo.openid;
    let userInfo: any = await this.userInfoEntity.findOneBy({ unionid });
    if (!userInfo) {
      const file = await this.pluginService.getInstance('upload');
      const avatarUrl = await file.downAndUpload(
        wxUserInfo.avatarUrl,
        uuid() + '.png'
      );
      userInfo = {
        unionid,
        nickName: wxUserInfo.nickName,
        avatarUrl,
        gender: wxUserInfo.gender,
        loginType: wxUserInfo.type,
      };
      await this.userInfoEntity.insert(userInfo);
    }
    return this.token({ id: userInfo.id });
  }

  /**
   * 刷新token
   * @param refreshToken
   */
  async refreshToken(refreshToken) {
    try {
      const info = jwt.verify(refreshToken, this.jwtConfig.secret);
      if (!info['isRefresh']) {
        throw new CoolCommException('token类型非refreshToken');
      }
      const userInfo = await this.userInfoEntity.findOneBy({
        id: info['id'],
      });
      return this.token({ id: userInfo.id });
    } catch (e) {
      throw new CoolCommException(
        '刷新token失败，请检查refreshToken是否正确或过期'
      );
    }
  }

  /**
   * 密码登录
   * @param phone
   * @param password
   */
  async password(phone, password) {
    const user = await this.userInfoEntity.findOneBy({ phone });

    if (user && user.password == md5(password)) {
      return this.token({
        id: user.id,
      });
    } else {
      throw new CoolCommException('账号或密码错误');
    }
  }

  /**
   * 微信小程序手机号一键登录（新版 getPhoneNumber API）
   * @param jsCode wx.login() 返回的 code
   * @param phoneCode open-type="getPhoneNumber" 返回的 code
   */
  async miniPhoneNew(jsCode: string, phoneCode: string) {
    // 1. 用 jsCode 换 openid
    const sessionRes = await axios.get(
      'https://api.weixin.qq.com/sns/jscode2session',
      {
        params: {
          appid: 'wxa742657a7653cf38',
          secret: 'ff37fb02c2025560071afd09f8c4f796',
          js_code: jsCode,
          grant_type: 'authorization_code',
        },
      }
    );
    const { openid, errcode, errmsg } = sessionRes.data;
    if (errcode || !openid) {
      throw new CoolCommException(`获取openid失败: ${errmsg || errcode}`);
    }

    // 2. 用 phoneCode 换手机号（先获取 access_token）
    const tokenRes = await axios.get(
      'https://api.weixin.qq.com/cgi-bin/token',
      {
        params: {
          grant_type: 'client_credential',
          appid: 'wxa742657a7653cf38',
          secret: 'ff37fb02c2025560071afd09f8c4f796',
        },
      }
    );
    const accessToken = tokenRes.data.access_token;
    if (!accessToken) {
      throw new CoolCommException('获取access_token失败');
    }

    const phoneRes = await axios.post(
      `https://api.weixin.qq.com/wxa/business/getuserphonenumber?access_token=${accessToken}`,
      { code: phoneCode }
    );
    const phone = phoneRes.data?.phone_info?.phoneNumber;
    if (!phone) {
      throw new CoolCommException('获取手机号失败，请重试');
    }

    // 3. 按 openid / phone 查找或创建用户
    let user: any = await this.userInfoEntity.findOneBy({
      unionid: Equal(openid),
    });
    if (!user) {
      user = await this.userInfoEntity.findOneBy({ phone: Equal(phone) });
    }
    if (!user) {
      user = {
        phone,
        unionid: openid,
        loginType: 0,
        nickName: phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2'),
      };
      await this.userInfoEntity.insert(user);
      user = await this.userInfoEntity.findOneBy({ unionid: Equal(openid) });
    } else if (!user.unionid) {
      await this.userInfoEntity.update(user.id, { unionid: openid, phone });
    }

    return this.token({ id: user.id });
  }

  /**
   * 获得token
   * @param info
   * @returns
   */
  async token(info) {
    const { expire, refreshExpire } = this.jwtConfig;
    return {
      expire,
      token: await this.generateToken(info),
      refreshExpire,
      refreshToken: await this.generateToken(info, true),
    };
  }

  /**
   * 生成token
   * @param tokenInfo 信息
   * @param roleIds 角色集合
   */
  async generateToken(info, isRefresh = false) {
    const { expire, refreshExpire, secret } = this.jwtConfig;
    const user = await this.userInfoEntity.findOneBy({ id: Equal(info.id) });
    const tokenInfo = {
      isRefresh,
      ...info,
      tenantId: user?.tenantId,
    };
    return jwt.sign(tokenInfo, secret, {
      expiresIn: isRefresh ? refreshExpire : expire,
    });
  }
}
