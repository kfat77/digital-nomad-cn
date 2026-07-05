// 数字游民指南 - 国家/地区数据
// 用于3D地球交互和弹窗显示

const COUNTRY_DATA = {
  hongkong: {
    name: "香港",
    nameEn: "Hong Kong",
    lat: 22.3193,
    lon: 114.1694,
    color: 0x2563eb,
    info: {
      bank: {
        title: "银行卡",
        items: [
          { text: "汇丰银行 - 无管理费，支持全球ATM", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/bank-cards/hong-kong.md" },
          { text: "中银香港 - 港陆互转零手续费", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/bank-cards/hong-kong.md" },
          { text: "众安银行 - 纯线上开户，无需赴港", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/bank-cards/hong-kong.md" },
          { text: "蚂蚁银行 - 无管理费，支持内地", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/bank-cards/hong-kong.md" }
        ]
      },
      phone: {
        title: "电话卡",
        items: [
          { text: "Club SIM - 6港币/年保号", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/phone-cards/hong-kong.md" },
          { text: "SoSIM - 33港币/月无限流量", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/phone-cards/hong-kong.md" }
        ]
      },
      visa: {
        title: "签证",
        items: [
          { text: "港澳通行证 - 内地居民必备", link: null },
          { text: "高才通计划 - 1-2个月获批身份", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/identity/hong-kong.md" }
        ]
      },
      securities: {
        title: "证券账户",
        items: [
          { text: "香港券商 - 富途/老虎/长桥政策变动", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/securities/hong-kong-broker.md" }
        ]
      }
    }
  },
  macao: {
    name: "澳门",
    nameEn: "Macao",
    lat: 22.1987,
    lon: 113.5439,
    color: 0xe11d48,
    info: {
      identity: {
        title: "身份规划",
        items: [
          { text: "澳门人才引进计划 - 高端人才/优秀人才/高级专业人才", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/identity/macao.md" }
        ]
      }
    }
  },
  singapore: {
    name: "新加坡",
    nameEn: "Singapore",
    lat: 1.3521,
    lon: 103.8198,
    color: 0x059669,
    info: {
      bank: {
        title: "银行卡",
        items: [
          { text: "OCBC - 大陆护照远程开户", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/bank-cards/ocbc.md" },
          { text: "iFAST - 数字银行，支持多币种", link: null }
        ]
      },
      phone: {
        title: "电话卡",
        items: [
          { text: "StarHub - 游客预付费卡", link: null },
          { text: "Singtel - 本地主流运营商", link: null }
        ]
      },
      identity: {
        title: "身份规划",
        items: [
          { text: "EP工作签证 - 薪资门槛提高", link: null },
          { text: "GIP全球投资者计划", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/identity/southeast-asia.md" }
        ]
      }
    }
  },
  japan: {
    name: "日本",
    nameEn: "Japan",
    lat: 36.2048,
    lon: 138.2529,
    color: 0xe11d48,
    info: {
      identity: {
        title: "身份规划",
        items: [
          { text: "高度人才签证 - 1年可拿永住", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/identity/japan.md" },
          { text: "经营管理签证 - 500万日元注册资本", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/identity/japan.md" },
          { text: "工作签证 - 人文知识·国际业务", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/identity/japan.md" }
        ]
      },
      visa: {
        title: "签证",
        items: [
          { text: "旅游签证 - 单次/三年多次/五年多次", link: null }
        ]
      }
    }
  },
  southkorea: {
    name: "韩国",
    nameEn: "South Korea",
    lat: 35.9078,
    lon: 127.7669,
    color: 0x2563eb,
    info: {
      identity: {
        title: "身份规划",
        items: [
          { text: "存款移民 - 15亿韩元直接拿永居", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/identity/southeast-asia.md" },
          { text: "工作签证 - E-7专业人才", link: null }
        ]
      },
      visa: {
        title: "签证",
        items: [
          { text: "旅游签证 - 单次/多次", link: null }
        ]
      }
    }
  },
  australia: {
    name: "澳大利亚",
    nameEn: "Australia",
    lat: -25.2744,
    lon: 133.7751,
    color: 0x059669,
    info: {
      visa: {
        title: "签证",
        items: [
          { text: "WHV 462 - 打工度假签证，18-30岁，5000名额/年", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/visa/australia-whv.md" },
          { text: "学生签证 - 500类别", link: null },
          { text: "旅游签证 - 600类别", link: null }
        ]
      },
      phone: {
        title: "电话卡",
        items: [
          { text: "Telstra - 覆盖最广，价格较高", link: null },
          { text: "Optus - 性价比较高", link: null }
        ]
      }
    }
  },
  newzealand: {
    name: "新西兰",
    nameEn: "New Zealand",
    lat: -40.9006,
    lon: 174.8869,
    color: 0x059669,
    info: {
      visa: {
        title: "签证",
        items: [
          { text: "WHV - 1000名额/年，先到先得，高中学历即可", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/visa/new-zealand-whv.md" },
          { text: "工作签证 - AEWV认证雇主", link: null }
        ]
      }
    }
  },
  usa: {
    name: "美国",
    nameEn: "United States",
    lat: 37.0902,
    lon: -95.7129,
    color: 0x2563eb,
    info: {
      phone: {
        title: "电话卡",
        items: [
          { text: "Ultra Mobile - 3美元/月保号", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/phone-cards/us-ultramobile.md" },
          { text: "T-Mobile - 主流运营商", link: null },
          { text: "AT&T - 覆盖最广", link: null }
        ]
      },
      securities: {
        title: "证券账户",
        items: [
          { text: "盈透证券 IBKR - 全球开户，支持中国", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/securities/ibkr.md" },
          { text: "嘉信理财 Schwab - 无最低存款，支持中文", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/securities/schwab.md" }
        ]
      },
      visa: {
        title: "签证",
        items: [
          { text: "B1/B2旅游签证 - 10年多次", link: null },
          { text: "H1B工作签证 - 抽签制", link: null }
        ]
      }
    }
  },
  uk: {
    name: "英国",
    nameEn: "United Kingdom",
    lat: 55.3781,
    lon: -3.4360,
    color: 0xe11d48,
    info: {
      phone: {
        title: "电话卡",
        items: [
          { text: "Giffgaff - 免费申请，按需充值", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/phone-cards/giffgaff.md" },
          { text: "EE - 覆盖最好", link: null },
          { text: "Three - 价格较低", link: null }
        ]
      },
      visa: {
        title: "签证",
        items: [
          { text: "旅游签证 - 2年/5年/10年多次", link: null },
          { text: "工作签证 - Skilled Worker", link: null }
        ]
      }
    }
  },
  portugal: {
    name: "葡萄牙",
    nameEn: "Portugal",
    lat: 39.3999,
    lon: -8.2245,
    color: 0x059669,
    info: {
      identity: {
        title: "身份规划",
        items: [
          { text: "D7签证 - 被动收入移民，五年拿欧盟护照", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/identity/other-pathways.md" },
          { text: "黄金签证 - 50万欧元基金投资", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/identity/other-pathways.md" }
        ]
      }
    }
  },
  spain: {
    name: "西班牙",
    nameEn: "Spain",
    lat: 40.4637,
    lon: -3.7492,
    color: 0xf59e0b,
    info: {
      identity: {
        title: "身份规划",
        items: [
          { text: "非盈利签证 - 被动收入，无投资要求", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/identity/other-pathways.md" },
          { text: "黄金签证 - 50万欧元房产投资", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/identity/other-pathways.md" }
        ]
      }
    }
  },
  estonia: {
    name: "爱沙尼亚",
    nameEn: "Estonia",
    lat: 58.5953,
    lon: 25.0136,
    color: 0x2563eb,
    info: {
      tools: {
        title: "数字工具",
        items: [
          { text: "e-Residency - 数字公民身份，可远程开公司", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/tools/e-residency.md" }
        ]
      }
    }
  },
  malaysia: {
    name: "马来西亚",
    nameEn: "Malaysia",
    lat: 4.2105,
    lon: 101.9758,
    color: 0x059669,
    info: {
      identity: {
        title: "身份规划",
        items: [
          { text: "MM2H - 第二家园计划，存款即可", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/identity/southeast-asia.md" }
        ]
      }
    }
  },
  thailand: {
    name: "泰国",
    nameEn: "Thailand",
    lat: 15.8700,
    lon: 100.9925,
    color: 0xf59e0b,
    info: {
      visa: {
        title: "签证",
        items: [
          { text: "旅游签证 - 60天免签/落地签", link: null },
          { text: "精英签证 - 5-20年长期居留", link: null }
        ]
      }
    }
  },
  vietnam: {
    name: "越南",
    nameEn: "Vietnam",
    lat: 14.0583,
    lon: 108.2772,
    color: 0xe11d48,
    info: {
      visa: {
        title: "签证",
        items: [
          { text: "电子签证 - 90天单次/多次", link: null }
        ]
      }
    }
  },
  canada: {
    name: "加拿大",
    nameEn: "Canada",
    lat: 56.1304,
    lon: -106.3468,
    color: 0xe11d48,
    info: {
      identity: {
        title: "身份规划",
        items: [
          { text: "EE快速通道 - 技术移民打分制", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/identity/other-pathways.md" },
          { text: "SUV创业签证 - 无资产要求", link: "https://github.com/kfat77/digital-nomad-cn/blob/main/docs/identity/other-pathways.md" }
        ]
      }
    }
  },
  schengen: {
    name: "欧洲申根",
    nameEn: "Schengen Area",
    lat: 48.8566,
    lon: 2.3522,
    color: 0x7c3aed,
    info: {
      visa: {
        title: "签证",
        items: [
          { text: "申根签证 - 27国通用，C类短期", link: null },
          { text: "数字游民签证 - 多国已推出", link: null }
        ]
      }
    }
  }
};

// 签证官网链接
const VISA_OFFICIAL_LINKS = {
  asia: {
    title: "亚洲",
    countries: [
      { name: "香港", flag: "🇭🇰", link: "https://www.immd.gov.hk/hkt/visa/visit_transit.html" },
      { name: "澳门", flag: "🇲🇴", link: "https://www.dsi.gov.mo/" },
      { name: "日本", flag: "🇯🇵", link: "https://www.mofa.go.jp/j_info/visit/visa/" },
      { name: "韩国", flag: "🇰🇷", link: "https://www.visa.go.kr/" },
      { name: "新加坡", flag: "🇸🇬", link: "https://www.ica.gov.sg/enter-transit-depart/entry_requirements" },
      { name: "泰国", flag: "🇹🇭", link: "https://www.thaiembassy.com/travel-to-thailand/visa-requirements" },
      { name: "越南", flag: "🇻🇳", link: "https://evisa.xuatnhapcanh.gov.vn/" },
      { name: "马来西亚", flag: "🇲🇾", link: "https://www.imi.gov.my/portal/en/" }
    ]
  },
  oceania: {
    title: "大洋洲",
    countries: [
      { name: "澳大利亚", flag: "🇦🇺", link: "https://immi.homeaffairs.gov.au/" },
      { name: "新西兰", flag: "🇳🇿", link: "https://www.immigration.govt.nz/" }
    ]
  },
  americas: {
    title: "美洲",
    countries: [
      { name: "美国", flag: "🇺🇸", link: "https://travel.state.gov/content/travel/en/us-visas.html" },
      { name: "加拿大", flag: "🇨🇦", link: "https://www.canada.ca/en/immigration-refugees-citizenship/services/visit-canada.html" }
    ]
  },
  europe: {
    title: "欧洲",
    countries: [
      { name: "申根签证", flag: "🇪🇺", link: "https://www.schengenvisainfo.com/" },
      { name: "英国", flag: "🇬🇧", link: "https://www.gov.uk/government/organisations/uk-visas-and-immigration" },
      { name: "葡萄牙", flag: "🇵🇹", link: "https://www.sef.pt/" },
      { name: "西班牙", flag: "🇪🇸", link: "https://www.exteriores.gob.es/Consulados/hongkong/en/ServiciosConsulares/Paginas/Consular/Visados-nacionales.aspx" },
      { name: "爱沙尼亚", flag: "🇪🇪", link: "https://www.politsei.ee/en/" }
    ]
  }
};

// 导出（兼容模块和全局）
if (typeof window !== 'undefined') {
  window.COUNTRY_DATA = COUNTRY_DATA;
  window.VISA_OFFICIAL_LINKS = VISA_OFFICIAL_LINKS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { COUNTRY_DATA, VISA_OFFICIAL_LINKS };
}
