/* 产品数据 + 矢量缩略图（无外部图片依赖） */
(function () {
  'use strict';

  var CATE_LABEL = { gun: '枪械系列', knife: '刀械系列', digital: '数码系列' };

  var PRODUCTS = [
    {
      id: 'gun-crimson',
      name: '赤红限定',
      en: 'CRIMSON RUSH',
      cate: 'gun',
      cateLabel: CATE_LABEL.gun,
      meta: '突击步枪 · 限定涂装',
      tag: '限定',
      accent: '#c0392b',
      accent2: '#f0725f',
      thumb: 'gun',
      desc: '暗红枪身叠哑光黑金饰条，护木与弹匣采用磨砂处理。灯下会浮出一层酒红金属光泽，适合近距离压制风格。',
      specs: [
        ['稀有度', '限定'],
        ['磨损', '崭新出厂'],
        ['主色', '赤红 / 黑金'],
        ['饰条', '抛光黄铜'],
        ['系列', '烈焰行动'],
        ['编号', 'NO.0231']
      ],
      model: { kind: 'gun', variant: 'crimson' }
    },
    {
      id: 'gun-azure',
      name: '深蓝竞技',
      en: 'AZURE LEAGUE',
      cate: 'gun',
      cateLabel: CATE_LABEL.gun,
      meta: '突击步枪 · 竞技涂装',
      tag: '竞技',
      accent: '#2f6fd0',
      accent2: '#79b4ff',
      thumb: 'gun',
      desc: '冷调深蓝与银白分区喷涂，护木加装碳纤维纹路。整体更轻、更利落，是联赛选手常用的竞技配色。',
      specs: [
        ['稀有度', '竞技限定'],
        ['磨损', '略有磨损'],
        ['主色', '深蓝 / 银白'],
        ['饰条', '碳纤维'],
        ['系列', '极地联赛'],
        ['编号', 'NO.0876']
      ],
      model: { kind: 'gun', variant: 'azure' }
    },
    {
      id: 'knife-fade',
      name: '渐变之色',
      en: 'FADE SPECTRUM',
      cate: 'knife',
      cateLabel: CATE_LABEL.knife,
      meta: '匕首 · 渐变镀层',
      tag: '隐秘',
      accent: '#3fd0c0',
      accent2: '#8b5cf6',
      thumb: 'knife',
      desc: '刀身覆盖青紫渐变镀层，随观察角度在青绿与紫色之间流动。刀柄为复合聚合物，握持轻盈。',
      specs: [
        ['稀有度', '隐秘'],
        ['磨损', '略有磨损'],
        ['表面', '渐变镀层'],
        ['刀刃', '高碳钢'],
        ['刀柄', '复合聚合物'],
        ['编号', 'NO.1147']
      ],
      model: { kind: 'knife', variant: 'fade' }
    },
    {
      id: 'knife-dragon',
      name: '屠龙',
      en: 'DRAGON SLAYER',
      cate: 'knife',
      cateLabel: CATE_LABEL.knife,
      meta: '匕首 · 黑金蚀刻',
      tag: '传说',
      accent: '#c9a45c',
      accent2: '#8c6b2f',
      thumb: 'knife',
      desc: '黑金刀身镌刻暗金龙纹，刀柄以乌木包覆并镶嵌暗金护符。是整套展示厅里最贵气的一把。',
      specs: [
        ['稀有度', '传说'],
        ['磨损', '崭新出厂'],
        ['表面', '黑金蚀刻'],
        ['刀刃', '大马士革钢'],
        ['刀柄', '乌木 + 暗金护符'],
        ['编号', 'NO.0007']
      ],
      model: { kind: 'knife', variant: 'dragon' }
    },
    {
      id: 'phone-aurora',
      name: '星曜 Pro',
      en: 'AURORA PRO',
      cate: 'digital',
      cateLabel: CATE_LABEL.digital,
      meta: '智能手机 · 旗舰',
      tag: '旗舰',
      accent: '#7c9cff',
      accent2: '#c9a45c',
      thumb: 'phone',
      desc: '6.7 英寸 LTPO 屏幕，钛合金中框收边，背板为细密磨砂玻璃。正面是一整块深色屏，息屏时只留一道金色光弧。',
      specs: [
        ['屏幕', '6.7" LTPO 120Hz'],
        ['芯片', '旗舰八核'],
        ['重量', '187g'],
        ['中框', '钛合金'],
        ['续航', '29 小时'],
        ['配色', '曜金黑']
      ],
      model: { kind: 'phone', variant: 'aurora' }
    },
    {
      id: 'laptop-forge',
      name: '锻造 14',
      en: 'FORGE 14',
      cate: 'digital',
      cateLabel: CATE_LABEL.digital,
      meta: '笔记本电脑 · 旗舰',
      tag: '旗舰',
      accent: '#c9a45c',
      accent2: '#f0d78c',
      thumb: 'laptop',
      desc: '14 英寸 3K 高刷屏，整机 1.28kg。航空铝一体成型机身，转轴阻尼经过重新调校，单手即可开合。',
      specs: [
        ['屏幕', '14" 3K 120Hz'],
        ['处理器', '高性能标压'],
        ['显卡', '独立显卡'],
        ['重量', '1.28kg'],
        ['接口', '2 × Thunderbolt'],
        ['机身', '航空铝']
      ],
      model: { kind: 'laptop', variant: 'forge' }
    }
  ];

  /* ---------- 缩略图矢量绘制 ---------- */
  var DRAW = {
    gun: function (uid) {
      var g = 'url(#tg-' + uid + ')';
      return '' +
        '<g fill="rgba(214,177,106,.07)" stroke="' + g + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">' +
        '<path d="M56 150 L112 138 L112 164 L128 164 L128 130 L256 130 L256 144 L344 144 L344 158 L256 158 L256 172 L196 172 L182 204 L162 204 L172 172 L142 172 L134 190 L116 190 L122 172 L112 172 L112 158 L56 158 Z"/>' +
        '<path d="M150 130 L150 111 L232 111 L232 130"/>' +
        '<path d="M150 172 Q148 192 170 192"/>' +
        '<path d="M206 172 L214 196"/>' +
        '<path d="M304 144 L304 158"/>' +
        '</g>' +
        '<path d="M136 149 L250 149" stroke="' + g + '" stroke-width="3" stroke-linecap="round" opacity=".85"/>' +
        '<path d="M128 130 L256 130 L256 139 L128 139 Z" fill="' + g + '" opacity=".28"/>' +
        '<circle cx="300" cy="151" r="3.2" fill="' + g + '"/>';
    },
    knife: function (uid) {
      var g = 'url(#tg-' + uid + ')';
      return '' +
        '<g fill="rgba(214,177,106,.06)" stroke="' + g + '" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">' +
        '<path d="M62 150 L62 168 Q62 178 74 178 L146 178 L146 140 L74 140 Q62 140 62 150 Z"/>' +
        '<path d="M146 130 L158 130 L158 188 L146 188 Z"/>' +
        '<path d="M158 142 L304 132 Q334 145 364 150 Q334 165 304 168 L158 172 Z"/>' +
        '<path d="M170 152 L300 147" stroke-width="1.6" opacity=".75"/>' +
        '<path d="M82 140 L82 178 M102 140 L102 178 M122 140 L122 178" stroke-width="1.3" opacity=".5"/>' +
        '</g>' +
        '<circle cx="70" cy="159" r="6" fill="none" stroke="' + g + '" stroke-width="2.4"/>' +
        '<path d="M212 150 L252 147" stroke="' + g + '" stroke-width="2.2" opacity=".65"/>';
    },
    phone: function (uid) {
      var g = 'url(#tg-' + uid + ')';
      return '' +
        '<rect x="150" y="58" width="100" height="184" rx="15" fill="rgba(214,177,106,.05)" stroke="' + g + '" stroke-width="2.6"/>' +
        '<rect x="160" y="74" width="80" height="152" rx="8" fill="rgba(0,0,0,.55)" stroke="' + g + '" stroke-width="1"/>' +
        '<path d="M182 66 h36" stroke="' + g + '" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M252 108 v20 M252 138 v16" stroke="' + g + '" stroke-width="2" opacity=".7"/>' +
        '<text x="200" y="161" text-anchor="middle" font-family="Georgia,serif" font-size="38" fill="' + g + '" letter-spacing="3">A</text>' +
        '<rect x="160" y="74" width="80" height="60" fill="' + g + '" opacity=".10"/>';
    },
    laptop: function (uid) {
      var g = 'url(#tg-' + uid + ')';
      return '' +
        '<g fill="rgba(214,177,106,.05)" stroke="' + g + '" stroke-width="2.4" stroke-linejoin="round">' +
        '<rect x="122" y="54" width="156" height="104" rx="7"/>' +
        '<rect x="130" y="62" width="140" height="88" rx="3" fill="rgba(0,0,0,.5)" stroke-width="1"/>' +
        '<path d="M104 158 L296 158 L326 194 L74 194 Z"/>' +
        '<path d="M118 170 L282 170" stroke-width="1.2" opacity=".55"/>' +
        '<path d="M198 164 v24" stroke-width="1.2" opacity=".55"/>' +
        '</g>' +
        '<circle cx="200" cy="106" r="13" fill="none" stroke="' + g + '" stroke-width="2.2"/>' +
        '<path d="M193 106 h14 M200 99 v14" stroke="' + g + '" stroke-width="1.4" opacity=".8"/>' +
        '<path d="M150 181 h40 M210 181 h40" stroke="' + g + '" stroke-width="1.8" opacity=".45"/>';
    }
  };

  var thumbSeq = 0;

  function productThumb(p) {
    var uid = p.id.replace(/[^a-z0-9-]/gi, '') + '-' + (++thumbSeq);
    var a1 = p.accent || '#D6B16A';
    var a2 = p.accent2 || '#F0D78C';
    var draw = DRAW[p.thumb] || DRAW.phone;
    return '<svg viewBox="0 0 400 300" role="img" aria-label="' + p.name + '" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' +
      '<linearGradient id="tg-' + uid + '" x1="0" y1="0" x2="1" y2="1">' +
      '<stop offset="0" stop-color="' + a1 + '"/>' +
      '<stop offset="0.55" stop-color="#D6B16A"/>' +
      '<stop offset="1" stop-color="' + a2 + '"/>' +
      '</linearGradient>' +
      '<radialGradient id="tr-' + uid + '" cx="50%" cy="45%" r="62%">' +
      '<stop offset="0" stop-color="' + a1 + '" stop-opacity=".22"/>' +
      '<stop offset="1" stop-color="' + a1 + '" stop-opacity="0"/>' +
      '</radialGradient>' +
      '</defs>' +
      '<rect width="400" height="300" fill="url(#tr-' + uid + ')"/>' +
      draw(uid, a1, a2) +
      '</svg>';
  }

  window.CATE_LABEL = CATE_LABEL;
  window.PRODUCTS = PRODUCTS;
  window.productThumb = productThumb;
})();
