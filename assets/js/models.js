/* 程序化 3D 模型库（依赖 three.js，全局 ModelLab） */
(function () {
  'use strict';

  /* r147 默认 legacy 色彩管理会把深色金属提亮成粉/橄榄色 */
  if (THREE.ColorManagement) {
    THREE.ColorManagement.legacyMode = false;
  }

  var GOLD = 0xc9a45c;

  function hex(value, fallback) {
    try {
      return new THREE.Color(value || fallback).getHex();
    } catch (e) {
      return fallback;
    }
  }

  function surface(color, opt) {
    opt = opt || {};
    return new THREE.MeshStandardMaterial({
      color: color,
      metalness: opt.metalness === undefined ? 0.78 : opt.metalness,
      roughness: opt.roughness === undefined ? 0.34 : opt.roughness,
      emissive: opt.emissive || 0x000000,
      emissiveIntensity: opt.emissiveIntensity === undefined ? 1 : opt.emissiveIntensity,
      envMapIntensity: opt.envMapIntensity === undefined ? 1.2 : opt.envMapIntensity,
      transparent: !!opt.transparent,
      opacity: opt.opacity === undefined ? 1 : opt.opacity
    });
  }

  function part(parent, geo, material, pos, rot, explode, name) {
    var mesh = new THREE.Mesh(geo, material);
    mesh.position.set(pos[0], pos[1], pos[2]);
    if (rot) mesh.rotation.set(rot[0], rot[1], rot[2]);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.userData.base = mesh.position.clone();
    mesh.userData.explode = new THREE.Vector3(explode[0], explode[1], explode[2]);
    if (name) mesh.name = name;
    parent.add(mesh);
    return mesh;
  }

  function markGroup(group, explode) {
    group.userData.base = group.position.clone();
    group.userData.explode = new THREE.Vector3(explode[0], explode[1], explode[2]);
    return group;
  }

  function canvasTexture(w, h, paint) {
    var canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    paint(canvas.getContext('2d'), w, h);
    var tex = new THREE.CanvasTexture(canvas);
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = 4;
    return tex;
  }

  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  /* 用画布生成一张可反射的环境贴图，金属材质才有层次 */
  function makeEnvironment(renderer) {
    var tex = canvasTexture(1024, 512, function (ctx, w, h) {
      var g = ctx.createLinearGradient(0, 0, 0, h);
      g.addColorStop(0, '#45454f');
      g.addColorStop(0.45, '#1b1b21');
      g.addColorStop(1, '#030304');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);

      var blobs = [
        [190, 120, 250, 'rgba(255,240,210,1)'],
        [790, 100, 310, 'rgba(206,220,255,0.75)'],
        [520, 340, 430, 'rgba(220,184,112,0.5)']
      ];
      blobs.forEach(function (b) {
        var r = ctx.createRadialGradient(b[0], b[1], 0, b[0], b[1], b[2]);
        r.addColorStop(0, b[3]);
        r.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = r;
        ctx.fillRect(b[0] - b[2], b[1] - b[2], b[2] * 2, b[2] * 2);
      });
    });
    tex.mapping = THREE.EquirectangularReflectionMapping;

    var pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    var env = pmrem.fromEquirectangular(tex).texture;
    pmrem.dispose();
    return env;
  }

  /* ---------- 枪械 ---------- */
  function buildGun(accentHex) {
    var g = new THREE.Group();
    var steel = surface(0x23252b, { metalness: 0.95, roughness: 0.33 });
    var dark = surface(0x121317, { metalness: 0.82, roughness: 0.46 });
    var accent = surface(new THREE.Color(accentHex).multiplyScalar(0.86).getHex(), {
      metalness: 0.72, roughness: 0.3, envMapIntensity: 1.35
    });
    var gold = surface(GOLD, { metalness: 1, roughness: 0.2, emissive: GOLD, emissiveIntensity: 0.06 });
    var rubber = surface(0x0b0c0e, { metalness: 0.2, roughness: 0.9 });
    var lens = new THREE.MeshPhysicalMaterial({
      color: 0x0a1014, metalness: 0.15, roughness: 0.04,
      clearcoat: 1, clearcoatRoughness: 0.06,
      emissive: accentHex, emissiveIntensity: 0.5
    });

    part(g, new THREE.BoxGeometry(2.1, 0.34, 0.4), steel, [0, 0.1, 0], null, [0, 0.8, 0], '机匣');
    part(g, new THREE.BoxGeometry(2.06, 0.022, 0.415), gold, [0, 0.272, 0], null, [0, 1.55, 0], '顶部饰条');
    part(g, new THREE.BoxGeometry(1.66, 0.032, 0.408), gold, [-0.06, 0.035, 0], null, [0, 0.5, 0], '侧面饰条');
    part(g, new THREE.BoxGeometry(0.36, 0.14, 0.02), gold, [0.2, 0.09, 0.202], null, [0.15, 0.55, 0.5], '抛壳口');
    part(g, new THREE.BoxGeometry(0.3, 0.08, 0.012), dark, [0.2, 0.09, 0.216], null, [0.15, 0.55, 0.55], '抛壳口内');
    part(g, new THREE.CylinderGeometry(0.026, 0.026, 0.018, 12), gold, [-0.34, -0.06, 0.203], [Math.PI / 2, 0, 0], [-0.3, 0.25, 0.4], '铆钉一');
    part(g, new THREE.CylinderGeometry(0.026, 0.026, 0.018, 12), gold, [0.52, -0.06, 0.203], [Math.PI / 2, 0, 0], [0.6, 0.25, 0.4], '铆钉二');
    part(g, new THREE.BoxGeometry(1.0, 0.3, 0.36), accent, [1.1, 0.1, 0], null, [0.95, 0.5, 0], '护木');
    part(g, new THREE.BoxGeometry(0.88, 0.05, 0.37), dark, [1.1, -0.065, 0], null, [0.95, -0.2, 0], '护木导轨');
    part(g, new THREE.CylinderGeometry(0.065, 0.065, 1.75, 20), steel, [1.95, 0.13, 0], [0, 0, Math.PI / 2], [1.85, 0.2, 0], '枪管');
    part(g, new THREE.CylinderGeometry(0.1, 0.085, 0.2, 20), gold, [2.78, 0.13, 0], [0, 0, Math.PI / 2], [2.7, 0.2, 0], '枪口');
    part(g, new THREE.BoxGeometry(0.3, 0.62, 0.24), accent, [0.24, -0.33, 0], [0, 0, 0.16], [0.25, -1.05, 0], '弹匣');
    part(g, new THREE.BoxGeometry(0.31, 0.06, 0.25), dark, [0.2, -0.6, 0], [0, 0, 0.16], [0.25, -1.45, 0], '弹匣底');
    part(g, new THREE.BoxGeometry(0.26, 0.52, 0.26), dark, [-0.58, -0.28, 0], [0, 0, 0.28], [-0.4, -0.9, 0], '握把');
    part(g, new THREE.BoxGeometry(1.0, 0.3, 0.28), dark, [-1.45, 0.02, 0], null, [-1.3, 0.1, 0], '枪托');
    part(g, new THREE.BoxGeometry(0.08, 0.4, 0.32), rubber, [-1.98, 0.02, 0], null, [-1.8, 0.1, 0], '托底');
    part(g, new THREE.BoxGeometry(0.72, 0.15, 0.2), dark, [-0.1, 0.42, 0], null, [-0.1, 1.2, 0], '瞄具');
    part(g, new THREE.CylinderGeometry(0.075, 0.09, 0.16, 20), lens, [0.3, 0.42, 0], [0, 0, Math.PI / 2], [0.75, 1.2, 0], '瞄具镜片');
    part(g, new THREE.BoxGeometry(0.1, 0.17, 0.11), gold, [-0.45, 0.42, 0], null, [-0.62, 1.2, 0], '瞄具尾');
    part(g, new THREE.TorusGeometry(0.12, 0.022, 8, 18, Math.PI), gold, [-0.06, -0.17, 0], [0, 0, Math.PI], [0, -0.6, 0], '扳机护圈');
    part(g, new THREE.CylinderGeometry(0.035, 0.035, 0.3, 12), dark, [-0.15, -0.1, 0], [0, 0, 0.3], [-0.1, -0.5, 0], '扳机');

    g.position.x = -0.42;
    return g;
  }

  /* ---------- 刀械 ---------- */
  function buildKnife(accentHex, accent2Hex, variant) {
    var g = new THREE.Group();
    var dark = surface(0x151619, { metalness: 0.6, roughness: 0.5 });
    var gold = surface(GOLD, { metalness: 1, roughness: 0.18, emissive: GOLD, emissiveIntensity: 0.05 });

    var shape = new THREE.Shape();
    shape.moveTo(0, 0.17);
    shape.lineTo(1.82, 0.17);
    shape.quadraticCurveTo(2.12, 0.15, 2.36, 0);
    shape.quadraticCurveTo(1.95, -0.17, 1.2, -0.21);
    shape.lineTo(0, -0.21);
    shape.closePath();

    var bladeGeo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.055,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 2,
      steps: 1
    });
    bladeGeo.translate(0, 0, -0.0275);

    var bladeMat;
    if (variant === 'fade') {
      var pos = bladeGeo.attributes.position;
      var colors = [];
      var c1 = new THREE.Color(accentHex);
      var c2 = new THREE.Color(accent2Hex);
      var tmp = new THREE.Color();
      for (var i = 0; i < pos.count; i++) {
        var t = Math.min(Math.max(pos.getX(i) / 2.36, 0), 1);
        tmp.copy(c2).lerp(c1, t);
        colors.push(tmp.r, tmp.g, tmp.b);
      }
      bladeGeo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      bladeMat = new THREE.MeshStandardMaterial({
        vertexColors: true, metalness: 0.92, roughness: 0.16, envMapIntensity: 1.6
      });
    } else {
      bladeMat = surface(0x3A3C42, { metalness: 0.88, roughness: 0.26, envMapIntensity: 2.0 });
    }

    part(g, bladeGeo, bladeMat, [0, 0, 0], null, [0.7, 0.95, 0], '刀身');
    part(g, new THREE.BoxGeometry(1.55, 0.02, 0.075), gold, [0.85, 0.156, 0], null, [0.95, 1.6, 0], '刀脊饰线');
    part(g, new THREE.BoxGeometry(1.15, 0.012, 0.02), gold, [1.05, -0.09, 0.03], null, [1.05, -0.2, 0.1], '刃口高光');

    part(g, new THREE.CapsuleGeometry(0.135, 0.78, 8, 20), dark, [-0.44, -0.02, 0], [0, 0, Math.PI / 2], [-0.75, -0.2, 0], '刀柄');
    [-0.22, -0.46, -0.7].forEach(function (x, idx) {
      part(g, new THREE.TorusGeometry(0.145, 0.014, 8, 28), gold, [x, -0.02, 0], [0, Math.PI / 2, 0], [-0.75, -0.2 + idx * 0.04, 0], '柄环');
    });
    part(g, new THREE.BoxGeometry(0.08, 0.44, 0.28), gold, [0.03, -0.02, 0], null, [0.25, -0.2, 0], '护手');
    part(g, new THREE.OctahedronGeometry(0.11), gold, [-1.02, -0.02, 0], null, [-1.1, -0.2, 0], '柄尾');

    if (variant === 'dragon') {
      part(g, new THREE.OctahedronGeometry(0.055), surface(0x7a2b1f, {
        metalness: 0.6, roughness: 0.2, emissive: 0x5a1a10, emissiveIntensity: 0.6
      }), [-1.02, -0.02, 0.1], null, [-1.1, -0.2, 0.35], '护符');
    }
    return g;
  }

  /* ---------- 手机 ---------- */
  function buildPhone(accentHex) {
    var g = new THREE.Group();
    var frameMat = surface(0x2b2d33, { metalness: 0.95, roughness: 0.22 });
    var gold = surface(GOLD, { metalness: 1, roughness: 0.18 });
    var glass = new THREE.MeshPhysicalMaterial({
      color: 0x08090b, metalness: 0.3, roughness: 0.06,
      clearcoat: 1, clearcoatRoughness: 0.04
    });

    part(g, new THREE.BoxGeometry(0.8, 1.52, 0.1), frameMat, [0, 0, 0], null, [0, 0.45, 0], '机身');
    part(g, new THREE.BoxGeometry(0.84, 1.56, 0.035), gold, [0, 0, -0.055], null, [0, 0.7, -0.2], '金色中框');

    var screenTex = canvasTexture(512, 1024, function (ctx, w, h) {
      var bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#0b111b');
      bg.addColorStop(0.55, '#05060a');
      bg.addColorStop(1, '#171006');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      var glow = ctx.createRadialGradient(w * 0.5, h * 0.42, 0, w * 0.5, h * 0.42, w * 0.72);
      glow.addColorStop(0, 'rgba(124,156,255,0.38)');
      glow.addColorStop(0.55, 'rgba(124,156,255,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      ctx.textAlign = 'center';
      ctx.fillStyle = 'rgba(232,212,166,0.55)';
      ctx.font = '22px "Microsoft YaHei", sans-serif';
      ctx.fillText('09:41', w / 2, 86);

      ctx.fillStyle = '#E9D6AA';
      ctx.font = '600 58px Georgia, serif';
      ctx.fillText('AIMEE', w / 2, h * 0.46);
      ctx.fillStyle = 'rgba(233,214,170,0.6)';
      ctx.font = '20px "Microsoft YaHei", sans-serif';
      ctx.fillText('AURORA PRO', w / 2, h * 0.46 + 48);

      ctx.fillStyle = 'rgba(214,177,106,0.5)';
      ctx.fillRect(w * 0.34, h * 0.55, w * 0.32, 2);

      ctx.fillStyle = 'rgba(233,214,170,0.28)';
      ctx.font = '18px "Microsoft YaHei", sans-serif';
      ctx.fillText('3D 产品展示厅', w / 2, h * 0.55 + 44);
    });

    part(g, new THREE.PlaneGeometry(0.7, 1.4), new THREE.MeshBasicMaterial({
      map: screenTex, toneMapped: false
    }), [0, 0, 0.051], null, [0, 0.85, 0.55], '屏幕');

    part(g, new THREE.BoxGeometry(0.3, 0.34, 0.03), frameMat, [-0.16, 0.5, -0.065], null, [-0.35, 0.8, -0.5], '相机模组');
    part(g, new THREE.CylinderGeometry(0.055, 0.055, 0.035, 20), glass, [-0.24, 0.58, -0.085], [Math.PI / 2, 0, 0], [-0.42, 0.9, -0.6], '镜头一');
    part(g, new THREE.CylinderGeometry(0.055, 0.055, 0.035, 20), glass, [-0.08, 0.58, -0.085], [Math.PI / 2, 0, 0], [-0.22, 0.9, -0.6], '镜头二');
    part(g, new THREE.CylinderGeometry(0.032, 0.032, 0.03, 16), gold, [-0.16, 0.44, -0.085], [Math.PI / 2, 0, 0], [-0.35, 0.72, -0.6], '闪光灯');

    part(g, new THREE.BoxGeometry(0.014, 0.24, 0.06), gold, [0.408, 0.36, 0], null, [0.45, 0.65, 0], '电源键');
    part(g, new THREE.BoxGeometry(0.014, 0.16, 0.06), frameMat, [0.408, 0.62, 0], null, [0.45, 0.9, 0], '音量键');
    return g;
  }

  /* ---------- 笔记本 ---------- */
  function buildLaptop() {
    var g = new THREE.Group();
    var alu = surface(0x2a2c31, { metalness: 0.9, roughness: 0.34 });
    var dark = surface(0x0d0e10, { metalness: 0.4, roughness: 0.7 });
    var gold = surface(GOLD, { metalness: 1, roughness: 0.2 });

    part(g, new THREE.BoxGeometry(1.8, 0.08, 1.2), alu, [0, 0, 0], null, [0, -0.45, 0], '机身');
    part(g, new THREE.BoxGeometry(1.76, 0.02, 1.16), dark, [0, -0.05, 0], null, [0, -0.7, 0], '底壳');

    var kbTex = canvasTexture(1024, 512, function (ctx, w, h) {
      ctx.fillStyle = '#141518';
      ctx.fillRect(0, 0, w, h);
      var cols = 14;
      var rows = 5;
      var pad = 9;
      var kw = (w - pad * (cols + 1)) / cols;
      var kh = (h - pad * (rows + 1)) / rows;
      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          roundRect(ctx, pad + c * (kw + pad), pad + r * (kh + pad), kw, kh, 4);
          ctx.fillStyle = '#202227';
          ctx.fill();
          ctx.strokeStyle = 'rgba(214,177,106,0.16)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    });
    part(g, new THREE.PlaneGeometry(1.34, 0.62), new THREE.MeshStandardMaterial({
      map: kbTex, metalness: 0.35, roughness: 0.62, emissive: 0x101010, emissiveIntensity: 0.4
    }), [0, 0.045, 0.12], [-Math.PI / 2, 0, 0], [0, 0.2, 0.18], '键盘');

    part(g, new THREE.PlaneGeometry(0.52, 0.28), surface(GOLD, {
      metalness: 0.55, roughness: 0.38
    }), [0, 0.045, 0.44], [-Math.PI / 2, 0, 0], [0, 0.12, 0.45], '触控板');

    var lid = new THREE.Group();
    lid.position.set(0, 0.04, -0.56);
    lid.rotation.x = -0.16;

    part(lid, new THREE.BoxGeometry(1.8, 1.06, 0.06), alu, [0, 0.53, 0], null, [0, 0, 0], '屏幕后盖');

    var screenTex = canvasTexture(1024, 640, function (ctx, w, h) {
      var bg = ctx.createLinearGradient(0, 0, w, h);
      bg.addColorStop(0, '#0a0e15');
      bg.addColorStop(0.6, '#06070a');
      bg.addColorStop(1, '#141007');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, w, h);

      var glow = ctx.createRadialGradient(w * 0.5, h * 0.46, 0, w * 0.5, h * 0.46, w * 0.6);
      glow.addColorStop(0, 'rgba(201,164,92,0.38)');
      glow.addColorStop(0.6, 'rgba(201,164,92,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      ctx.textAlign = 'center';
      ctx.fillStyle = '#E9D6AA';
      ctx.font = '600 92px Georgia, serif';
      ctx.fillText('AIMEE', w / 2, h * 0.44);
      ctx.fillStyle = 'rgba(233,214,170,0.55)';
      ctx.font = '26px "Microsoft YaHei", sans-serif';
      ctx.fillText('FORGE 14', w / 2, h * 0.44 + 62);

      ctx.fillStyle = 'rgba(214,177,106,0.45)';
      ctx.fillRect(w * 0.36, h * 0.58, w * 0.28, 2);

      ctx.fillStyle = 'rgba(214,177,106,0.12)';
      ctx.fillRect(w * 0.1, h * 0.72, w * 0.22, 54);
      ctx.fillRect(w * 0.39, h * 0.72, w * 0.22, 54);
      ctx.fillRect(w * 0.68, h * 0.72, w * 0.22, 54);
    });

    part(lid, new THREE.PlaneGeometry(1.68, 0.94), new THREE.MeshBasicMaterial({
      map: screenTex, toneMapped: false
    }), [0, 0.53, 0.032], null, [0, 0, 0], '屏幕');
    markGroup(lid, [0, 1.15, -0.95]);
    g.add(lid);

    part(g, new THREE.CylinderGeometry(0.045, 0.045, 1.5, 16), gold, [0, 0.02, -0.58], [0, 0, Math.PI / 2], [0, 0.35, -0.55], '转轴');
    return g;
  }

  function create(kind, variant, accent, accent2) {
    var a = hex(accent, '#c9a45c');
    var a2 = hex(accent2, '#f0d78c');
    var model;
    if (kind === 'gun') model = buildGun(a);
    else if (kind === 'knife') model = buildKnife(a, a2, variant);
    else if (kind === 'laptop') model = buildLaptop();
    else model = buildPhone(a);

    model.traverse(function (obj) {
      if (obj.isMesh) {
        obj.castShadow = true;
      }
    });
    return model;
  }

  window.ModelLab = {
    create: create,
    makeEnvironment: makeEnvironment
  };
})();
