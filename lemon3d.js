/* ══════════════════════════════════════════════════════════════════
   LAYMON GAMES — lemon3d.js
   The 3D mascot: a purpose-built GLB reader and WebGL renderer for a
   single small model. No framework, no import map, ~6 KB of script, so
   the site gains the mascot without gaining a dependency.

   Interaction: the mouse steers the lemon's horizontal facing only. The
   rotation axis is Y, so the model never looks up or down. A touch drag
   does the same on mobile, and a slow idle sway takes over when nothing
   is pointing at it.

   If WebGL or the file is unavailable, the pixel mascot stays visible.
   ══════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const host = document.getElementById('mascot');
  const canvas = document.getElementById('mascotCanvas');
  const fallback = document.querySelector('.mascot__fallback');
  if (!host || !canvas || !fallback) return;

  const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COARSE = matchMedia('(pointer: coarse)').matches;
  const MAX_TURN = 0.62;          /* radians, about 36° each way */
  const DAMP = COARSE ? 0.06 : 0.085;

  const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── very small GLB reader: JSON + BIN, uncompressed accessors ── */
  function readGLB(buffer) {
    const dv = new DataView(buffer);
    if (dv.getUint32(0, true) !== 0x46546c67) throw new Error('not a glb');
    const total = dv.getUint32(8, true);
    let off = 12, json = null, bin = null;
    while (off < total) {
      const len = dv.getUint32(off, true);
      const type = String.fromCharCode(dv.getUint8(off + 4), dv.getUint8(off + 5), dv.getUint8(off + 6), dv.getUint8(off + 7));
      if (type === 'JSON') json = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, off + 8, len)));
      else if (type === 'BIN\0') bin = new Uint8Array(buffer, off + 8, len);
      off += 8 + len + ((4 - (len % 4)) % 4);
    }
    if (!json || !bin) throw new Error('glb chunks missing');
    return { json, bin };
  }

  const TYPES = { 5120: Int8Array, 5121: Uint8Array, 5122: Int16Array, 5123: Uint16Array, 5125: Uint32Array, 5126: Float32Array };
  const SIZES = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 };

  function readAccessor(json, bin, index) {
    const a = json.accessors[index];
    const view = json.bufferViews[a.bufferView];
    const comps = SIZES[a.type] || 1;
    const Arr = TYPES[a.componentType];
    const start = (view.byteOffset || 0) + (a.byteOffset || 0);
    const stride = view.byteStride || 0;
    const out = new Arr(a.count * comps);
    const bpe = Arr.BYTES_PER_ELEMENT;
    if (!stride) {
      out.set(new Arr(bin.buffer, bin.byteOffset + start, a.count * comps));
    } else {
      const src = new DataView(bin.buffer, bin.byteOffset + start, a.count * stride);
      for (let i = 0; i < a.count; i++) {
        for (let k = 0; k < comps; k++) {
          const o = i * stride + k * bpe;
          const v = a.componentType === 5126 ? src.getFloat32(o, true)
            : a.componentType === 5123 ? src.getUint16(o, true)
            : a.componentType === 5125 ? src.getUint32(o, true)
            : a.componentType === 5121 ? src.getUint8(o)
            : src.getInt8(o);
          out[i * comps + k] = v;
        }
      }
    }
    return out;
  }

  /* ── linear -> sRGB so the model matches the on-site OG palette ── */
  const lin2srgb = v => (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055);
  const toRGB = f => [lin2srgb(f[0]), lin2srgb(f[1]), lin2srgb(f[2])];

  /* ── tiny matrix helpers (column-major, as WebGL wants) ── */
  function multiply(a, b) {
    const o = new Float32Array(16);
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 4; r++) {
        o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
      }
    }
    return o;
  }
  const identity = () => new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
  function rotationY(a) {
    const c = Math.cos(a), s = Math.sin(a);
    return new Float32Array([c,0,-s,0, 0,1,0,0, s,0,c,0, 0,0,0,1]);
  }
  function scaleXYZ(sx, sy, sz) {
    return new Float32Array([sx,0,0,0, 0,sy,0,0, 0,0,sz,0, 0,0,0,1]);
  }
  function translate(x, y, z) {
    return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, x,y,z,1]);
  }
  function perspective(fovy, aspect, near, far) {
    const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
    return new Float32Array([f / aspect,0,0,0, 0,f,0,0, 0,0,(far + near) * nf,-1, 0,0,2 * far * near * nf,0]);
  }
  function lookAt(eye, target, up) {
    let zx = eye[0] - target[0], zy = eye[1] - target[1], zz = eye[2] - target[2];
    let zl = Math.hypot(zx, zy, zz) || 1; zx /= zl; zy /= zl; zz /= zl;
    let xx = up[1] * zz - up[2] * zy, xy = up[2] * zx - up[0] * zz, xz = up[0] * zy - up[1] * zx;
    let xl = Math.hypot(xx, xy, xz) || 1; xx /= xl; xy /= xl; xz /= xl;
    const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
    return new Float32Array([xx, yx, zx, 0, xy, yy, zy, 0, xz, yz, zz, 0,
      -(xx * eye[0] + xy * eye[1] + xz * eye[2]),
      -(yx * eye[0] + yy * eye[1] + yz * eye[2]),
      -(zx * eye[0] + zy * eye[1] + zz * eye[2]), 1]);
  }

  /* ── shader: wrapped diffuse + hemispheric ambient + rim ── */
  const VERT = `
    attribute vec3 aPos;
    attribute vec3 aNrm;
    attribute vec2 aUv;
    varying vec2 vUv;
    uniform mat4 uProj, uView, uModel;
    varying vec3 vN;
    varying vec3 vP;
    void main(){
      vec4 wp = uModel * vec4(aPos, 1.0);
      vP = wp.xyz;
      vUv = aUv;
      vN = mat3(uModel) * aNrm;
      gl_Position = uProj * uView * wp;
    }`;

  const FRAG = `
    precision mediump float;
    uniform sampler2D uTex;
    varying vec2 vUv;
    uniform vec3 uKey, uFill, uAmbTop, uAmbBot, uRim;
    varying vec3 vN;
    varying vec3 vP;
    void main(){
      vec3 n = normalize(vN);
      vec3 view = normalize(vec3(0.0, 0.0, 1.0) - vP);
      // wrapped diffuse keeps the terminator soft on a stylised mascot.
      // The light budget below is deliberate: uColor is already sRGB-encoded,
      // so amb + k + f must peak at ~1.0. Anything higher clips the body to
      // flat white and erases the pixel-art banding the model carries.
      float k = max(0.0, (dot(n, uKey) + 0.35) / 1.35);
      float f = max(0.0, (dot(n, uFill) + 0.6) / 1.6) * 0.13;
      vec3 amb = mix(uAmbBot, uAmbTop, n.y * 0.5 + 0.5);
      float rim = pow(1.0 - max(0.0, dot(n, view)), 2.6);
      vec3 c = texture2D(uTex, vUv).rgb * (amb + k * 0.48 + f) + uRim * rim * 0.24;
      gl_FragColor = vec4(c, 1.0);
    }`;

  function compile(gl, type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
    return s;
  }


	/* ── node transform: Blender exports object scale/rotation on the node,
	   not in the vertices. The old loader ignored it, which is why the lemon
	   looked fat and unflattened on the site but correct in Blender. ── */
	function nodeMatrix(n) {
		if (n.matrix) return Float32Array.from(n.matrix);
		const t = n.translation || [0, 0, 0], q = n.rotation || [0, 0, 0, 1], sc = n.scale || [1, 1, 1];
		const x = q[0], y = q[1], z = q[2], w = q[3];
		return new Float32Array([
			(1 - 2 * (y * y + z * z)) * sc[0], 2 * (x * y + z * w) * sc[0], 2 * (x * z - y * w) * sc[0], 0,
			2 * (x * y - z * w) * sc[1], (1 - 2 * (x * x + z * z)) * sc[1], 2 * (y * z + x * w) * sc[1], 0,
			2 * (x * z + y * w) * sc[2], 2 * (y * z - x * w) * sc[2], (1 - 2 * (x * x + y * y)) * sc[2], 0,
			t[0], t[1], t[2], 1]);
	}
	/* cofactor matrix of the upper 3x3: the correct normal transform under
	   non-uniform scale (inverse-transpose up to a constant) */
	function cofactor(m) {
		const a = m[0], b = m[4], c = m[8], d = m[1], e = m[5], f = m[9], g = m[2], h = m[6], i = m[10];
		return [e * i - f * h, f * g - d * i, d * h - e * g,
			c * h - b * i, a * i - c * g, b * g - a * h,
			b * f - c * e, c * d - a * f, a * e - b * d];
	}

  /* ── init ── */
  const gl = canvas.getContext('webgl', { antialias: true, alpha: true, powerPreference: 'low-power' })
          || canvas.getContext('experimental-webgl', { alpha: true });

  const useFallback = (why) => {
    /* the stylesheet keeps .mascot__fallback hidden; the flag on <html> is
       what reveals it, so a missing WebGL context still shows the mark */
    document.documentElement.classList.add('no-mascot3d');
    canvas.remove();
    if (why && window.console) console.warn('Laymon 3D mascot unavailable, using the pixel mark:', why);
  };

  if (!gl) { useFallback('no webgl'); return; }

  let program, u = {}, meshes = [], ready = false;

  fetch('assets/laymon-lemon.glb', { credentials: 'same-origin' })
    .then(r => { if (!r.ok) throw new Error('http ' + r.status); return r.arrayBuffer(); })
    .then(buf => {
      const { json, bin } = readGLB(buf);
      /* the GLB carries one mesh per part (body, face, leaf), each split into
         per-material primitives. Flatten every primitive of every mesh into a
         single draw list so a future part cannot silently go missing. */
      const prims = [];
      (json.meshes || []).forEach(m => (m.primitives || []).forEach(p => prims.push(p)));
      if (!prims.length) throw new Error('no primitives');
      program = gl.createProgram();
      gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('link');

      u = {
        proj: gl.getUniformLocation(program, 'uProj'),
        view: gl.getUniformLocation(program, 'uView'),
        model: gl.getUniformLocation(program, 'uModel'),
        tex: gl.getUniformLocation(program, 'uTex'),
        key: gl.getUniformLocation(program, 'uKey'),
        fill: gl.getUniformLocation(program, 'uFill'),
        ambTop: gl.getUniformLocation(program, 'uAmbTop'),
        ambBot: gl.getUniformLocation(program, 'uAmbBot'),
        rim: gl.getUniformLocation(program, 'uRim')
      };
      u.pos = gl.getAttribLocation(program, 'aPos');
      u.nrm = gl.getAttribLocation(program, 'aNrm');
			u.uv = gl.getAttribLocation(program, 'aUv');
			gl.enableVertexAttribArray(u.uv);
      gl.enableVertexAttribArray(u.pos);
      gl.enableVertexAttribArray(u.nrm);

      /* position and normal interleaved into one buffer per part.
         WebGL1 has no vertex array objects, so the attribute pointers are
         re-bound per draw - cheap at six parts. */
		const owner = {};
		(json.nodes || []).forEach(n => { if (n.mesh !== undefined) owner[n.mesh] = nodeMatrix(n); });
		let mn = [1e9, 1e9, 1e9], mx = [-1e9, -1e9, -1e9];
		meshes = [];
		(json.meshes || []).forEach((mesh, mi) => (mesh.primitives || []).forEach(prim => {
			const M = owner[mi] || identity();
			const N = cofactor(M);
			const pos = readAccessor(json, bin, prim.attributes.POSITION);
			const nrm = readAccessor(json, bin, prim.attributes.NORMAL);
			const uv = prim.attributes.TEXCOORD_0 !== undefined ? readAccessor(json, bin, prim.attributes.TEXCOORD_0) : null;
			const idx = readAccessor(json, bin, prim.indices);
			const count = pos.length / 3;
			const inter = new Float32Array(count * 8);
			for (let i = 0; i < count; i++) {
				const px = pos[i * 3], py = pos[i * 3 + 1], pz = pos[i * 3 + 2];
				const wx = M[0] * px + M[4] * py + M[8] * pz + M[12];
				const wy = M[1] * px + M[5] * py + M[9] * pz + M[13];
				const wz = M[2] * px + M[6] * py + M[10] * pz + M[14];
				const nx = nrm[i * 3], ny = nrm[i * 3 + 1], nz = nrm[i * 3 + 2];
				let tx = N[0] * nx + N[3] * ny + N[6] * nz;
				let ty = N[1] * nx + N[4] * ny + N[7] * nz;
				let tz = N[2] * nx + N[5] * ny + N[8] * nz;
				const tl = Math.hypot(tx, ty, tz) || 1;
				inter.set([wx, wy, wz, tx / tl, ty / tl, tz / tl, uv ? uv[i * 2] : 0, uv ? uv[i * 2 + 1] : 0], i * 8);
				if (wx < mn[0]) mn[0] = wx; if (wx > mx[0]) mx[0] = wx;
				if (wy < mn[1]) mn[1] = wy; if (wy > mx[1]) mx[1] = wy;
				if (wz < mn[2]) mn[2] = wz; if (wz > mx[2]) mx[2] = wz;
			}
			const vbo = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
			gl.bufferData(gl.ARRAY_BUFFER, inter, gl.STATIC_DRAW);
			const ibo = gl.createBuffer();
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
			const mat = json.materials[prim.material] || {};
			const pbr = mat.pbrMetallicRoughness || {};
			meshes.push({
				vbo, ibo, count: idx.length,
				type: idx instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT,
				texIndex: pbr.baseColorTexture ? pbr.baseColorTexture.index : -1,
				col: pbr.baseColorFactor || [1, 1, 1, 1]
			});
		}));
      gl.bindBuffer(gl.ARRAY_BUFFER, null);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

      /* frame the model from its own bounds so nothing is hand-tuned.
         Bounds come from the accessors' declared min/max, which is cheap and
         covers every part, not just whichever primitive came first. */
      const cx = (mn[0] + mx[0]) / 2, cy = (mn[1] + mx[1]) / 2, cz = (mn[2] + mx[2]) / 2;
      const h = Math.max(mx[1] - mn[1], mx[0] - mn[0], mx[2] - mn[2]);
      /* the model faces +Z in glTF space */
      const scale = 1.0 / h;
      const view = scaleXYZ(scale, scale, scale);
      const shift = new Float32Array(16);
      shift[0] = shift[5] = shift[10] = shift[15] = 1;   /* an affine matrix needs its 1 */
      shift[12] = -cx; shift[13] = -cy; shift[14] = -cz;
      /* multiply(view, shift) applies the centring shift FIRST and the scale
         second, i.e. scale * (p - centre). The other order would translate by
         the unscaled centre and leave the model visibly off-centre. */
      const centre = multiply(view, shift);

		/* decode the embedded PNG once and share it; pixel art wants hard
		   magnification and smooth minification */
		const loadTex = () => {
			const t = (json.textures || [])[0];
			const img = t && json.images[t.source];
			const white = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, white);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
			if (!img || img.bufferView === undefined) return Promise.resolve(white);
			const v = json.bufferViews[img.bufferView];
			const blob = new Blob([bin.subarray(v.byteOffset || 0, (v.byteOffset || 0) + v.byteLength)], { type: img.mimeType || 'image/png' });
			return createImageBitmap(blob, { premultiplyAlpha: 'none', colorSpaceConversion: 'none' }).then(bm => {
				const tex = gl.createTexture();
				gl.bindTexture(gl.TEXTURE_2D, tex);
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bm);
				gl.generateMipmap(gl.TEXTURE_2D);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				const ext = gl.getExtension('EXT_texture_filter_anisotropic');
				if (ext) gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 4);
				return tex;
			}).catch(() => white);
		};
		return loadTex().then(tex => {
			meshes.forEach(m => { m.tex = tex; });
			ready = true;
			canvas.hidden = false;
			start(centre, mn, mx);
		});
    })
    .catch(err => useFallback(err));

  /* ── render loop ── */
  function start(centre, mn, mx) {
    let dpr = 1, w = 1, hgt = 1;
    let target = 0, current = 0;
    let onScreen = true, running = true;
    let touching = false, touchX = 0, touchTarget = 0;
    let idleStart = performance.now();
    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;

    function resize() {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = Math.max(1, Math.round(r.width));
      hgt = Math.max(1, Math.round(r.height));
      const pw = Math.round(w * dpr), ph = Math.round(hgt * dpr);
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw; canvas.height = ph;
      }
      gl.viewport(0, 0, pw, ph);
    }

    /* Camera distance is derived from the model's normalised size and the
       live aspect ratio, so the lemon keeps the same visual weight at every
       breakpoint instead of being framed once for one canvas shape. FILL is
       the fraction of the tighter axis the mascot should occupy. */
    const FOV = 0.62, FILL = 0.74;
    let nw = 1, nh = 1;
    if (mx && mn) {
      const span = Math.max(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]) || 1;
      nw = (mx[0] - mn[0]) / span;
      nh = (mx[1] - mn[1]) / span;
    }
    function cameraFor() {
      const half = Math.tan(FOV / 2);
      const aspect = w / hgt;
      /* whichever axis is tighter decides the distance */
      /* nw/nh are full spans, so the needed half-extent is half of them */
      const need = Math.max(nh, nw / aspect) / (2 * FILL);
      return need / half;
    }

    /* ── pointer: horizontal only ── */
    if (fine) {
      addEventListener('pointermove', e => {
        /* -1 at the left edge, +1 at the right edge, 0 dead centre */
        const n = (e.clientX / innerWidth) * 2 - 1;
        target = n * MAX_TURN;
        idleStart = performance.now();
      }, { passive: true });
    } else {
      const onStart = e => { touching = true; touchX = (e.touches ? e.touches[0].clientX : e.clientX); };
      const onMove = e => {
        if (!touching) return;
        const x = (e.touches ? e.touches[0].clientX : e.clientX);
        touchTarget = clamp((x - touchX) / (innerWidth * 0.35), -1, 1) * MAX_TURN;
        idleStart = performance.now();
        if (e.cancelable) e.preventDefault();
      };
      const onEnd = () => { touching = false; touchTarget = 0; idleStart = performance.now(); };
      host.addEventListener('touchstart', onStart, { passive: true });
      host.addEventListener('touchmove', onMove, { passive: false });
      addEventListener('touchend', onEnd, { passive: true });
      addEventListener('touchcancel', onEnd, { passive: true });
    }

    const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

    function frame(now) {
      if (!running) return;
      requestAnimationFrame(frame);
      if (!onScreen || document.hidden) return;

      resize();

      let want;
      if (reduceMotion()) {
        want = 0;
      } else if (touching) {
        want = touchTarget;
      } else if (fine) {
        want = target;
      } else {
        /* idle: a slow, shallow sway so it never looks frozen or spinning */
        const t = (now - idleStart) / 1000;
        want = Math.sin(t * 0.42) * 0.20;
      }
      current += (want - current) * (reduceMotion() ? 1 : DAMP);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);
      gl.useProgram(program);

      /* camera: straight on, with a whisper of elevation */
      const dist = cameraFor();
      const view = lookAt([0, 0.06, dist], [0, 0, 0], [0, 1, 0]);
      const proj = perspective(FOV, w / hgt, 0.1, 40);
      /* idle drift: a barely-there float plus breathing scale. Slow, small
         and on two different periods so the loop never reads as a loop. */
      let bob = 0, breathe = 1;
      if (!reduceMotion()) {
        const s = now / 1000;
        bob = Math.sin(s * 0.55) * 0.014 + Math.sin(s * 0.23 + 1.1) * 0.008;
        breathe = 1 + Math.sin(s * 0.9) * 0.008;
      }
      const model = multiply(
        multiply(rotationY(current), translate(0, bob, 0)),
        multiply(scaleXYZ(breathe, breathe, breathe), centre));

      gl.uniformMatrix4fv(u.proj, false, proj);
      gl.uniformMatrix4fv(u.view, false, view);
      gl.uniformMatrix4fv(u.model, false, model);

      /* lights: warm key, sage fill, gold rim — the OG palette, in light */
      gl.uniform3f(u.key, -0.42, 0.62, 0.66);
      gl.uniform3f(u.fill, 0.72, 0.22, 0.42);
      gl.uniform3f(u.ambTop, 0.44, 0.40, 0.31);
      gl.uniform3f(u.ambBot, 0.30, 0.28, 0.22);
      gl.uniform3f(u.rim, 0.85, 0.64, 0.24);

      for (const m of meshes) {
        gl.activeTexture(gl.TEXTURE0);
				gl.bindTexture(gl.TEXTURE_2D, m.tex);
				gl.uniform1i(u.tex, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, m.vbo);
        gl.vertexAttribPointer(u.pos, 3, gl.FLOAT, false, 32, 0);
        gl.vertexAttribPointer(u.nrm, 3, gl.FLOAT, false, 32, 12);
				gl.vertexAttribPointer(u.uv, 2, gl.FLOAT, false, 32, 24);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, m.ibo);
        gl.drawElements(gl.TRIANGLES, m.count, m.type, 0);
      }
    }

    /* pause when the mascot leaves the viewport or the tab is hidden */
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(e => {
        onScreen = e[0].isIntersecting;
        if (onScreen) requestAnimationFrame(frame);
      }, { threshold: 0.01 }).observe(host);
    }
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && onScreen) requestAnimationFrame(frame);
    });

    /* a language switch must not disturb the turn */
    addEventListener('lg:lang', () => resize());
    addEventListener('resize', () => resize(), { passive: true });

    resize();
    requestAnimationFrame(frame);
  }
})();
