/* ══════════════════════════════════════════════════════════════════
   LAYMON GAMES — lemon3d.js
   The hero lemon: a purpose-built GLB reader and WebGL renderer for one
   small model. No framework, no import map, no build step.

   This file replaces the earlier renderer. The GLB reader, the node /
   cofactor transform handling and the camera framing are kept as they
   were — they were correct and the model measures right. What changed is
   what the lemon DOES, because it is the one moment on this site that is
   supposed to be memorable and everything else is supposed to stay quiet:

     1  a soft contact shadow that breathes with the squash
     2  squash-and-stretch on click / tap / Enter / Space, with a splash
     3  a gold environment reflection, so the lemon is lit by the room it
        sits in rather than floating in a vacuum
     4  pointer-follow that eases IN over the first second instead of
        snapping, and eases back out on every frame

   Three bugs in the previous version are fixed here, all of them on the
   mobile path, which is why they were easy to miss:

     · clamp() was a const arrow declared AFTER the touch listeners that
       call it. A touch drag threw ReferenceError and the lemon stopped
       responding. It is hoisted to module scope now.
     · the pointer gain was applied instantly, so the very first mousemove
       teleported the lemon to the cursor.
     · the model was framed without an entrance, so it appeared at full
       size mid-turn.

   If WebGL or the file is unavailable the pixel mark stays on screen and
   stays clickable — the button in index.html is never empty.
   ══════════════════════════════════════════════════════════════════ */
(() => {
	'use strict';

	const host = document.getElementById('mascot');
	const canvas = document.getElementById('mascotCanvas');
	const shadow = host && host.querySelector('.mascot__shadow');
	if (!host || !canvas) return;

	const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
	const COARSE = matchMedia('(pointer: coarse)').matches;

	const MAX_TURN = 0.62;          /* radians, about 36° each way */
	const DAMP = COARSE ? 0.06 : 0.085;
	const DPR_CAP = COARSE ? 1.5 : 2;

	const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

	/* one clamp for the whole file — see the note in the header */
	const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

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

	/* ── shader ──
	   Wrapped diffuse for a soft terminator on a stylised mascot, a
	   hemispheric ambient, and a rim so the silhouette separates from the
	   black ground.

	   The room term is the gold environment reflection. There is no env
	   texture and no cube map: the reflection is a function of the surface
	   normal only, so it behaves exactly like a static environment map for
	   an object that never translates — gold at the horizon, warm floor
	   below, near-black above. It is multiplied into the albedo rather
	   than added, so the model's own near-black pixel banding stays black
	   and the eyes and mouth do not turn gold. */
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
		uniform vec3 uKey, uFill, uAmbTop, uAmbBot, uRim, uEnvLo, uEnvHi, uEnvGain;
		varying vec3 vN;
		varying vec3 vP;
		void main(){
			vec3 n = normalize(vN);
			// two-sided, as Blender and the glTF spec do it: the back of a face is
			// lit as a front, so a stray inward face can never render as a dark patch
			if (!gl_FrontFacing) n = -n;
			vec3 view = normalize(vec3(0.0, 0.0, 1.0) - vP);
			// Lighting is NEUTRAL on purpose. The texture is already sRGB and is
			// the source of truth for colour, so shade only changes brightness,
			// never hue. It is tuned so a surface facing the camera lands at
			// ~1.0 and shows the texel exactly as Blender does; sides fall to
			// ~0.65-0.8 and the underside to ~0.55.
			float k = max(0.0, (dot(n, uKey) + 0.35) / 1.35);
			float f = max(0.0, (dot(n, uFill) + 0.6) / 1.6) * 0.20;
			float shade = 0.50 + 0.52 * k + f;
			float rim = pow(1.0 - max(0.0, dot(n, view)), 2.6);
			// static gold environment: a gentle warm lift, multiplied into the
			// albedo so the near-black eyes and mouth stay black
			float up = n.y * 0.5 + 0.5;
			vec3 room = mix(uEnvLo, mix(uEnvLo, uEnvHi, 0.15), smoothstep(0.35, 0.92, up));
			vec3 albedo = texture2D(uTex, vUv).rgb;
			vec3 c = albedo * shade * (1.0 + room * uEnvGain * 0.7) + uRim * rim * 0.24;
			gl_FragColor = vec4(min(c, vec3(1.0)), 1.0);
		}`;

	function compile(gl, type, src) {
		const s = gl.createShader(type);
		gl.shaderSource(s, src);
		gl.compileShader(s);
		if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
		return s;
	}

	/* ── node transform: Blender exports object scale/rotation on the node,
	   not in the vertices. Ignoring it is why the lemon used to look fat and
	   unflattened on the site but correct in Blender. ── */
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

	/* ── the reaction ──
	   A damped spring: one impulse, then a real overshoot before it settles,
	   which is what separates a squash from a scale keyframe. Everything
	   scales off `q`. */
	const SPRING = { k: 150, c: 9.5 };

	const state = {
		turn: 0,            /* radians, current */
		want: 0,            /* radians, target */
		touch: 0,           /* radians, touch target */
		touching: false,
		touchX: 0,
		q: 0,               /* squash amount, positive = squashed */
		qv: 0,              /* squash velocity */
		ready: false,
		elapsed: 0,         /* seconds since the model was framed */
		gain: 0,            /* 0 → 1: how much of the pointer it obeys */
		idleFrom: 0,
		loud: 0,
		face: 0,
		splashes: []
	};

	function react(force) {
		if (reduceMotion()) return;
		/* short and wide, or tall and thin, alternating enough to read as
		   alive rather than mechanical */
		const dir = Math.random() < 0.5 ? 1 : -1;
		state.qv += (force === undefined ? 3.6 : force) * dir;
		state.loud = 1;
		if (shadow) {
			state.splashes.push({ t: 0, d: 0.42 });
			if (state.splashes.length > 6) state.splashes.shift();
		}
	}

	/* the button is the control, so the keyboard and the pointer arrive here */
	host.addEventListener('click', e => {
		e.preventDefault();
		react();
	});
	host.addEventListener('keydown', e => {
		if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
			e.preventDefault();
			react();
		}
	});

	/* ── init ── */
	const gl = canvas.getContext('webgl', { antialias: true, alpha: true, powerPreference: 'low-power' })
		|| canvas.getContext('experimental-webgl', { alpha: true });

	const useFallback = (why) => {
		/* styles.css keeps .mascot__fallback hidden; mascot.css is what shows
		   it, so a missing WebGL context still leaves the pixel mark on screen
		   inside the same button. */
		document.documentElement.classList.add('no-mascot3d');
		canvas.hidden = true;
		if (shadow) shadow.style.display = 'none';
		if (why && window.console) console.warn('Laymon 3D mascot unavailable, using the pixel mark:', why);
	};

	if (!gl) { useFallback('no webgl'); return; }

	/* the fallback is retired as soon as a context exists, so the two are
	   never on screen together while the GLB is still in flight */
	document.documentElement.classList.remove('no-mascot3d');

	let program, u = {}, meshes = [];

	fetch('assets/laymon-lemon.glb', { credentials: 'same-origin' })
		.then(r => { if (!r.ok) throw new Error('http ' + r.status); return r.arrayBuffer(); })
		.then(buf => {
			const { json, bin } = readGLB(buf);
			/* the GLB carries one mesh per part (body, face, leaf), each split
			   into per-material primitives. Flatten every primitive of every
			   mesh into one draw list so a future part cannot silently go
			   missing. */
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
				rim: gl.getUniformLocation(program, 'uRim'),
				envLo: gl.getUniformLocation(program, 'uEnvLo'),
				envHi: gl.getUniformLocation(program, 'uEnvHi'),
				envGain: gl.getUniformLocation(program, 'uEnvGain')
			};
			u.pos = gl.getAttribLocation(program, 'aPos');
			u.nrm = gl.getAttribLocation(program, 'aNrm');
			u.uv = gl.getAttribLocation(program, 'aUv');
			gl.enableVertexAttribArray(u.uv);
			gl.enableVertexAttribArray(u.pos);
			gl.enableVertexAttribArray(u.nrm);

			/* position, normal and uv interleaved into one buffer per part.
			   WebGL1 has no vertex array objects, so the attribute pointers
			   are re-bound per draw - cheap at six parts. */
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

			/* frame the model from its own bounds so nothing is hand-tuned */
			const cx = (mn[0] + mx[0]) / 2, cy = (mn[1] + mx[1]) / 2, cz = (mn[2] + mx[2]) / 2;
			const h = Math.max(mx[1] - mn[1], mx[0] - mn[0], mx[2] - mn[2]);

			/* the model faces +Z in glTF space */
			const scale = 1.0 / h;
			const view = scaleXYZ(scale, scale, scale);
			const shift = new Float32Array(16);
			shift[0] = shift[5] = shift[10] = shift[15] = 1;
			shift[12] = -cx; shift[13] = -cy; shift[14] = -cz;
			/* multiply(view, shift) applies the centring shift FIRST and the
			   scale second, i.e. scale * (p - centre). */
			const centre = multiply(view, shift);

			/* The model's bounds are normalised and handed to start(), which
			   derives the camera framing and the contact shadow's position from
			   them per frame — see shadowTop() there. */

			/* decode the embedded PNG once and share it; pixel art wants hard
			   magnification and smooth minification */
			const setup = (tex, src) => {
				gl.bindTexture(gl.TEXTURE_2D, tex);
				/* raw texels, no colour conversion, no alpha premultiply */
				gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
				gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
				gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);
				if (src) gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
				else gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));
				const pot = src && !(src.width & (src.width - 1)) && !(src.height & (src.height - 1));
				if (pot) gl.generateMipmap(gl.TEXTURE_2D);
				/* hard texels up close; mip level picked, never blended between
				   levels, so the pixel-art cell edges stay crisp */
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, pot ? gl.LINEAR_MIPMAP_NEAREST : gl.NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				const ext = gl.getExtension('EXT_texture_filter_anisotropic');
				if (ext && pot) gl.texParameterf(gl.TEXTURE_2D, ext.TEXTURE_MAX_ANISOTROPY_EXT, 4);
				return tex;
			};
			const loadTex = () => {
				/* a COMPLETE 1x1 white texture, so a failed decode shows a plain
				   lemon-coloured silhouette instead of solid black */
				const white = setup(gl.createTexture(), null);
				const t = (json.textures || [])[0];
				const img = t && json.images[t.source];
				if (!img || img.bufferView === undefined) return Promise.resolve(white);
				const v = json.bufferViews[img.bufferView];
				const o = v.byteOffset || 0;
				const url = URL.createObjectURL(new Blob([bin.subarray(o, o + v.byteLength)], { type: img.mimeType || 'image/png' }));
				return new Promise(resolve => {
					const im = new Image();
					im.onload = () => { URL.revokeObjectURL(url); resolve(setup(gl.createTexture(), im)); };
					im.onerror = () => { URL.revokeObjectURL(url); resolve(white); };
					im.src = url;
				});
			};
				return loadTex().then(tex => {
				meshes.forEach(m => { m.tex = tex; });
				canvas.hidden = false;
				state.ready = true;
				/* nw / nh are the model's width and height as fractions of its
				   longest axis; the shadow placement needs them in the same
				   normalised frame the camera frames. */
				const span = Math.max(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]) || 1;
				start(centre, {
					nw: (mx[0] - mn[0]) / span,
					nh: (mx[1] - mn[1]) / span,
					base: (cy - mn[1]) / span
				});
			});
		})
		.catch(err => useFallback(err));

	/* ── render loop ── */
	function start(centre, dims) {
		let dpr = 1, w = 1, hgt = 1;
		let onScreen = true;
		let lastNow = 0;

		function resize() {
			/* read the box BEFORE touching width/height: writing those forces a
			   synchronous reflow, and doing it after the read meant every
			   resize pass forced two layouts instead of one. */
			const r = canvas.getBoundingClientRect();
			if (!r.width || !r.height) return;
			dpr = Math.min(devicePixelRatio || 1, DPR_CAP);
			w = Math.max(1, Math.round(r.width));
			hgt = Math.max(1, Math.round(r.height));
			const pw = Math.max(1, Math.round(w * dpr));
			const ph = Math.max(1, Math.round(hgt * dpr));
			if (canvas.width !== pw || canvas.height !== ph) {
				canvas.width = pw; canvas.height = ph;
			}
			gl.viewport(0, 0, pw, ph);
		}

		/* Camera distance is derived from the model's normalised size and the
		   live aspect ratio, so the lemon keeps the same visual weight at every
		   breakpoint. FILL is the fraction of the tighter axis it occupies. */
		const FOV = 0.62, FILL = 0.74;
		/* nw, nh and base all arrive in the normalised frame: the model spans
		   ±nw/2 horizontally and ±nh/2 vertically, and `base` is how far below
		   the origin its feet are. The camera adds a small elevation, so the
		   feet land a touch lower than the projection alone suggests; LIFT
		   folds that back in. */
		const nw = dims.nw, nh = dims.nh;
		const LIFT = 0.06;
		function cameraFor() {
			const half = Math.tan(FOV / 2);
			const aspect = w / hgt;
			const need = Math.max(nh, nw / aspect) / (2 * FILL);
			return need / half;
		}
		/* The contact shadow's top edge is where the fruit meets the ground.
		   The model's feet sit at -base in the normalised frame; the camera
		   looks at the origin from (0, LIFT, dist), so the feet project to this
		   fraction of the canvas measured from the top. mascot.css used to
		   place the shadow at a hand-picked 82%, which put its peak ~40px below
		   the fruit at 224px and read as a second object sitting on the floor
		   rather than a contact patch. Deriving it also keeps it correct on the
		   2:1 canvas that canvas.js and the responsive rules can produce. */
		function shadowTop() {
			const dist = cameraFor();
			const yEye = LIFT;
			const xEye = -dims.base + yEye;    /* feet relative to the eye */
			const n = Math.max(0.02, (xEye - FILL * nh / 2) / dist);
			return (0.5 + Math.tan(Math.atan(n)) / Math.tan(FOV / 2) * 0.5) * 100;
		}

		const paintShadow = (q, gain) => {
			if (!shadow) return;
			/* the lemon widens as it flattens, and the shadow spreads with it */
			const spread = 1 + q * 1.5;
			const shade = 1 - q * 0.42;
			shadow.style.setProperty('--shadow-top', shadowTop().toFixed(2) + '%');
			shadow.style.setProperty('--shadow-spread', spread.toFixed(3));
			shadow.style.setProperty('--shadow-dark', Math.max(0.18, shade).toFixed(3));
			shadow.style.setProperty('--shadow-lift', (q * 26).toFixed(1) + '%');
			/* splashes: a ring that leaves the contact patch */
			let ring = 0, ringT = 0;
			for (let i = state.splashes.length - 1; i >= 0; i--) {
				if (state.splashes[i].d <= 0) { state.splashes.splice(i, 1); continue; }
				if (state.splashes[i].t > ringT) { ringT = state.splashes[i].t; ring = 1; }
			}
			shadow.style.setProperty('--splash', ring ? (ringT * 0.9).toFixed(3) : '1');
			shadow.classList.toggle('is-splash', !!ring);
		};

		/* ── pointer ── */
		const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
		if (fine) {
			addEventListener('pointermove', e => {
				/* -1 at the left edge, +1 at the right edge, 0 dead centre */
				const n = (e.clientX / innerWidth) * 2 - 1;
				state.want = n * MAX_TURN;
				state.idleFrom = performance.now();
				state.face = 1;
			}, { passive: true });
		}
		/* touch drives it on a phone; the same squash the click triggers is
		   available from the button's own click event */
		const onStart = e => {
			state.touching = true;
			state.touchX = (e.touches ? e.touches[0].clientX : e.clientX);
		};
		const onMove = e => {
			if (!state.touching) return;
			const x = (e.touches ? e.touches[0].clientX : e.clientX);
			state.touch = clamp((x - state.touchX) / (innerWidth * 0.35), -1, 1) * MAX_TURN;
			state.idleFrom = performance.now();
			if (e.cancelable) e.preventDefault();
		};
		const onEnd = () => { state.touching = false; state.touch = 0; state.idleFrom = performance.now(); };
		host.addEventListener('touchstart', onStart, { passive: true });
		host.addEventListener('touchmove', onMove, { passive: false });
		addEventListener('touchend', onEnd, { passive: true });
		addEventListener('touchcancel', onEnd, { passive: true });

		function frame(now) {
			requestAnimationFrame(frame);
			if (!onScreen || document.hidden) return;

			const dt = lastNow ? Math.min(0.05, (now - lastNow) / 1000) : 0.016;
			lastNow = now;
			state.elapsed += dt;

			resize();

			const still = reduceMotion();

			/* 1 · the pointer-follow eases IN: the lemon comes alive over the
			   first second rather than snapping to the first mousemove. */
			const ramp = still ? 1 : clamp((state.elapsed - 0.25) / 1.0, 0, 1);
			state.gain = ramp * ramp * (3 - 2 * ramp);

			/* 2 · where it wants to be */
			let want = 0;
			if (still) {
				want = 0;
			} else if (state.touching) {
				want = state.touch;
			} else if (fine && state.face) {
				want = state.want;
			} else {
				/* idle: a slow, shallow sway, so it never looks frozen or spinning */
				const t = (now - state.idleFrom) / 1000;
				want = Math.sin(t * 0.42) * 0.20;
			}
			state.turn += (want * state.gain - state.turn) * (still ? 1 : DAMP);

			/* 3 · the squash spring */
			if (still) {
				state.q = 0; state.qv = 0;
			} else {
				state.qv += (-SPRING.k * state.q - SPRING.c * state.qv) * dt;
				state.q += state.qv * dt;
				if (state.q > 0.34) { state.q = 0.34; state.qv = 0; }
				if (state.q < -0.26) { state.q = -0.26; state.qv = 0; }
			}
			const q = state.q;
			const sy = 1 - q, sxz = 1 + q * 0.5;

			/* 4 · splashes decay */
			for (const s of state.splashes) s.d -= dt;
			paintShadow(q, state.gain);

			/* the CSS entrance is dropped the moment the first real frame is
			   about to paint, so the drop-in and the pointer ramp agree */
			if (!host.classList.contains('is-3d')) host.classList.add('is-3d');

			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			gl.enable(gl.DEPTH_TEST);
			gl.useProgram(program);

			const dist = cameraFor();
			const view = lookAt([0, 0.06, dist], [0, 0, 0], [0, 1, 0]);
			/* model radius is < 0.9 in the normalised frame, so a 2.4-deep slab
			   around the camera distance keeps every depth step tiny */
			const proj = perspective(FOV, w / hgt, Math.max(0.05, dist - 1.2), dist + 1.2);

			/* idle drift: a barely-there float plus breathing scale. Slow, small
			   and on two different periods so the loop never reads as a loop. */
			let bob = 0, breathe = 1;
			if (!still) {
				const s = now / 1000;
				bob = Math.sin(s * 0.55) * 0.014 + Math.sin(s * 0.23 + 1.1) * 0.008;
				breathe = 1 + Math.sin(s * 0.9) * 0.008;
			}

			/* the camera is 0.06 above the origin, so lowering the model brings
			   it back down to the level it would sit at without that lift */
			const camLift = 0.06 * (dist / 3.2);
			/* the squeeze sits between the centring matrix and the model: it
			   acts in the space the camera looks at, so the shadow and the
			   silhouette stay in the same relationship */
			const squeeze = multiply(scaleXYZ(sxz, sy, sxz), translate(0, -camLift / Math.max(sy, 0.01) + camLift, 0));
			const model = multiply(
				multiply(rotationY(state.turn), translate(0, bob, 0)),
				multiply(squeeze, multiply(scaleXYZ(breathe, breathe, breathe), centre)));

			gl.uniformMatrix4fv(u.proj, false, proj);
			gl.uniformMatrix4fv(u.view, false, view);
			gl.uniformMatrix4fv(u.model, false, model);

			/* lights: warm key, sage fill, gold rim — the OG palette, in light */
			gl.uniform3f(u.key, -0.42, 0.62, 0.66);
			gl.uniform3f(u.fill, 0.72, 0.22, 0.42);
			gl.uniform3f(u.ambTop, 0.44, 0.40, 0.31);
			gl.uniform3f(u.ambBot, 0.30, 0.28, 0.22);
			gl.uniform3f(u.rim, 0.85, 0.64, 0.24);
			/* the environment: dark above, gold at the horizon, warm below, and
			   a single flare for the first second so the reflection announces
			   itself on load and then settles */
			if (!still) {
				state.loud += (0 - state.loud) * (1 - Math.pow(0.02, dt));
			} else {
				state.loud = 0;
			}
			const gain = state.loud;
			gl.uniform3f(u.envLo, 0.62 + gain * 0.34, 0.40 + gain * 0.27, 0.13 + gain * 0.16);
			gl.uniform3f(u.envHi, 0.10, 0.085, 0.07);
			gl.uniform3f(u.envGain, 0.24 + gain * 0.30, 0.215 + gain * 0.27, 0.175 + gain * 0.24);

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
				lastNow = 0;
			}, { threshold: 0.01 }).observe(host);
		}
		document.addEventListener('visibilitychange', () => { lastNow = 0; });

		/* a language switch changes the canvas box; so does a resize */
		addEventListener('lg:lang', resize);
		addEventListener('resize', resize, { passive: true });

		/* the first react() is the landing: it announces that the lemon is a
		   thing you can touch, and it arrives exactly when the drop-in ends */
		resize();
		requestAnimationFrame(frame);
		if (!reduceMotion()) setTimeout(() => react(2.4), 1150);
	}
})();
