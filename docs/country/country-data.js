/**
 * Country Data Registry - 国家数据注册表
 * 用于国家详情页动态加载数据
 */

const CountryData = (function() {
  const data = {};

  return {
    register: function(id, countryData) {
      data[id] = countryData;
      return this;
    },
    get: function(id) {
      return data[id];
    },
    getAll: function() {
      return data;
    }
  };
})();

// 当外部数据加载时自动注册
window.registerCountry = function(id, countryData) {
  CountryData.register(id, countryData);
};
