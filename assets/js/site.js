/* 公共页面脚本：导航、搜索与产品卡片渲染 */
(function () {
  'use strict';

  var NAV = [
    ['index.html', '首页'],
    ['gallery.html', '产品图集'],
    ['spec.html', '规格文档'],
    ['about.html', '项目介绍']
  ];

  var LOGO = '<svg viewBox="0 0 64 64" role="img" aria-label="aimee 标识">' +
    '<defs><linearGradient id="aimeeGoldNav" x1="16" y1="52" x2="50" y2="12" gradientUnits="userSpaceOnUse">' +
      '<stop offset="0" stop-color="#8A6226"/>' +
      '<stop offset="0.45" stop-color="#E8CE92"/>' +
      '<stop offset="0.72" stop-color="#C29445"/>' +
      '<stop offset="1" stop-color="#F6E7BF"/>' +
    '</linearGradient></defs>' +
    '<circle cx="32" cy="32" r="25.5" fill="none" stroke="url(#aimeeGoldNav)" stroke-width="1.2" opacity="0.5"/>' +
    '<g fill="url(#aimeeGoldNav)">' +
      '<path d="M20.2 46 L30.1 17 H33.1 L23.2 46 Z"/>' +
      '<path d="M43.8 46 L33.9 17 H30.9 L40.8 46 Z"/>' +
      '<path d="M25.4 34.6 H30.1 V36.4 H25.1 Z"/>' +
      '<path d="M33.9 34.6 H38.6 V36.4 H33.9 Z"/>' +
      '<path d="M32 31.9 L35.6 35.5 L32 39.1 L28.4 35.5 Z"/>' +
    '</g>' +
    '</svg>';

  var SEARCH_ICON = '<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round">' +
    '<circle cx="11" cy="11" r="6.5"/>' +
    '<path d="M16 16l4.5 4.5"/>' +
    '</svg>';

  function currentPage() {
    var name = location.pathname.split('/').pop();
    return name || 'index.html';
  }

  function mountNav() {
    var el = document.getElementById('nav');
    if (!el) return;
    var cur = currentPage();

    el.innerHTML = '<div class="nav-inner">' +
      '<a class="brand" href="index.html" aria-label="AIMEE 首页">' +
        '<span class="brand-mark">' + LOGO + '</span>' +
        '<span class="brand-name">aimee<em>3D SHOWROOM</em></span>' +
      '</a>' +
      '<nav class="nav-links">' +
        NAV.map(function (item) {
          return '<a href="' + item[0] + '"' + (item[0] === cur ? ' class="active"' : '') + '>' + item[1] + '</a>';
        }).join('') +
      '</nav>' +
      '<div class="nav-search">' +
        SEARCH_ICON +
        '<input id="siteSearch" type="search" autocomplete="off" aria-label="搜索产品" aria-controls="searchPanel">' +
        '<div class="search-panel" id="searchPanel" hidden></div>' +
      '</div>' +
    '</div>';

    bindSearch();
  }

  function searchMatches(query) {
    var list = window.PRODUCTS || [];
    var q = query.trim().toLowerCase();
    if (!q) return list.slice(0, 4);

    return list.filter(function (p) {
      var text = [p.name, p.en, p.meta, p.tag, p.cateLabel, p.desc]
        .concat((p.specs || []).map(function (s) { return s[0] + s[1]; }))
        .join(' ')
        .toLowerCase();
      return text.indexOf(q) > -1;
    }).slice(0, 8);
  }

  function bindSearch() {
    var input = document.getElementById('siteSearch');
    var panel = document.getElementById('searchPanel');
    if (!input || !panel) return;

    function render() {
      var query = input.value.trim();
      var list = searchMatches(query);

      if (!list.length) {
        panel.innerHTML = '<div class="search-empty">没有找到匹配的产品</div>';
      } else {
        panel.innerHTML = '<div class="search-head">' + (query ? '搜索结果' : '推荐展品') + '</div>' +
          list.map(function (p) {
            return '<a class="search-item" href="show3d.html?id=' + p.id + '">' +
              '<span class="search-thumb">' + productThumb(p) + '</span>' +
              '<span class="search-meta"><strong>' + p.name + '</strong><em>' + p.meta + '</em></span>' +
              '<span class="search-tag">' + p.tag + '</span>' +
            '</a>';
          }).join('');
      }
      panel.hidden = false;
    }

    input.addEventListener('focus', render);
    input.addEventListener('input', render);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        var first = panel.querySelector('.search-item');
        if (first) location.href = first.getAttribute('href');
      } else if (e.key === 'Escape') {
        panel.hidden = true;
        input.blur();
      }
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.nav-search')) panel.hidden = true;
    });

    document.addEventListener('keydown', function (e) {
      var tag = (document.activeElement && document.activeElement.tagName) || '';
      if (e.key === '/' && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        input.focus();
      }
    });
  }

  function card(p) {
    return '<a class="card" href="show3d.html?id=' + p.id + '">' +
      '<div class="thumb">' + productThumb(p) + '</div>' +
      '<div class="meta"><h3>' + p.name + '</h3><span class="tag">' + p.tag + '</span></div>' +
      '<p class="sub">' + p.meta + '</p>' +
      '<span class="card-go">查看 3D 模型 <i>→</i></span>' +
      '</a>';
  }

  function mountGrid(el, cate, limit) {
    if (!el) return;
    var list = (window.PRODUCTS || []).filter(function (p) {
      return !cate || cate === 'all' || p.cate === cate;
    });
    if (limit) list = list.slice(0, limit);
    el.innerHTML = list.map(card).join('');
  }

  window.Site = {
    mountNav: mountNav,
    card: card,
    mountGrid: mountGrid
  };

  document.addEventListener('DOMContentLoaded', mountNav);
})();
