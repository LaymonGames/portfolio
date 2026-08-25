/* =========================================================
   Laymon Games — localization layer (English / العربية)

   Architecture notes:
   - index.html keeps the original English copy as the no-JS
     source of truth. The `en` strings below are byte-identical
     to that copy and must never be edited casually.
   - NAMES holds every immutable identifier (personal name,
     studio name, project names, handles, email). Translated
     prose embeds these exact strings, so a translation pass
     can never rename a person or a project.
   - `dir="ltr"` spans inside Arabic strings keep preserved
     Latin names rendering correctly inside RTL sentences.
========================================================= */
(function () {
	'use strict';

	var STORAGE_KEY = 'laymon-lang';
	var SUPPORTED = ['en', 'ar'];

	/* ---------- Immutable identifiers — never translated ---------- */
	var NAMES = {
		owner: 'Aymen Meghezzi',
		studio: 'Laymon Games',
		projects: {
			parallox: 'Parallox',
			somethingsOff: "Something's Off",
			somethingsOffRemastered: "Something's Off Remastered",
			cursedArcade: 'Cursed Arcade'
		},
		collaborator: 'Youcef Benredjem',
		email: 'gamesbylaymon@gmail.com',
		handles: {
			discord: 'laymon_games',
			linkedin: 'aymen-meghezzi'
		}
	};

	function ltr(text) {
		return '<span dir="ltr">' + text + '</span>';
	}

	var S = ltr(NAMES.studio);

	/* ---------- Metadata per language ---------- */
	var META = {
		en: {
			title: 'Laymon Games — Solo Indie Developer Portfolio',
			description: 'Laymon Games — solo indie developer portfolio. Godot game development, pixel art, low-poly 3D, music, and video, featuring the 2D pixel RPG Parallox.',
			ogTitle: 'Laymon Games — Solo Indie Developer',
			ogDescription: 'Games, pixel art, low-poly 3D, music, and video — made from idea to finished result by one developer.',
			ogLocale: 'en_US'
		},
		ar: {
			title: 'Laymon Games — معرض أعمال مطوّر ألعاب مستقل',
			description: 'Laymon Games — معرض أعمال مطوّر ألعاب مستقل. تطوير ألعاب على Godot، فن بكسلي، رسوم ثلاثية الأبعاد Low-Poly، موسيقى وفيديو، مع لعبة الأدوار البكسلية Parallox.',
			ogTitle: 'Laymon Games — مطوّر ألعاب مستقل',
			ogDescription: 'ألعاب، فن بكسلي، رسوم ثلاثية الأبعاد Low-Poly، من الفكرة إلى النتيجة النهائية على يد مطوّر واحد.',
			ogLocale: 'ar_AR'
		}
	};

	/* ---------- UI + prose translations ---------- */
	var I18N = {
		en: {
			'lang.switchAria': 'Switch language',

			'skip.text': 'Skip to content',

			'brand.tagline': 'SOLO INDIE DEVELOPER',
			'brand.homeAria': 'Laymon Games home',

			'nav.ariaPrimary': 'Primary navigation',
			'nav.ariaMain': 'Main navigation',
			'nav.ariaMobile': 'Mobile navigation',
			'nav.toggleAria': 'Open navigation',
			'nav.home': 'Home',
			'nav.about': 'About',
			'nav.skills': 'Skills',
			'nav.projects': 'Projects',
			'nav.work': 'Work',
			'nav.process': 'Process',
			'nav.contact': 'Contact',

			'hero.ariaLabel': 'Laymon Games header artwork',

			'about.eyebrow': 'About',
			'about.personLabel': 'The person behind the studio',
			'about.ownerAlt': 'Aymen Meghezzi, creator behind Laymon Games',
			'about.role': '<strong>' + NAMES.studio + '</strong>, a creator & solo developer.',
			'about.note': 'Games, code, art, audio, video - all in one.',
			'about.summaryTitle': 'All done by one person.',
			'about.bio1': "I'm the person behind <strong>" + NAMES.studio + "</strong>, a solo indie developer focused on making games, creative digital projects, and editing videos. I work across programming, 2D and 3D art, sound, music, editing, and presentation so the whole project can keep one consistent direction.",
			'about.bio2': 'I like building games, from brainstorming ideas to finishing the project, and using new tools when they genuinely improve the workflow.',
			'about.signature': 'Code · Art · Audio · Video',

			'skills.eyebrow': 'Skills',
			'skills.heading': 'What I<br /><em>can do:</em>',
			'skills.game.title': 'Game Development',
			'skills.game.desc': 'Godot and GDScript for creating 2D and 3D game projects, implementing gameplay systems, and putting everything together.',
			'skills.game.aria': 'Go to projects',
			'skills.tags.art': '<span>Aseprite</span><span>Pixel Art</span><span>Blender</span><span>Low-Poly 3D</span>',
			'skills.art.title': 'Art',
			'skills.art.desc': 'Pixel-art sprites and environments for 2D, and stylized low-poly 3D modelling for 3D.',
			'skills.art.aria': 'Open art preview',
			'skills.tags.audio': '<span>FL Studio</span><span>Music</span><span>Sound Design</span><span>SFX</span>',
			'skills.audio.title': 'Audio',
			'skills.audio.desc': 'Original soundtracks and sound design made to set the mood of a scene, or a moment of gameplay.',
			'skills.audio.aria': 'Open audio link',
			'skills.tags.video': '<span>Davinci Resolve</span><span>Video Editing</span>',
			'skills.video.title': 'Video',
			'skills.video.desc': 'Editing for creative videos that present a project the way it deserves.',
			'skills.video.aria': 'Open YouTube video link',
			'skills.other.title': 'Other/AI-Assisted',
			'skills.other.desc': 'Websites, apps, including this site, built with the help of AI-assisted workflows. A tool for extra capability, not the foundation of my game development, art, or audio work.',
			'skills.other.aria': 'Show AI assisted notice',
			'skills.tags.other': '<span>AI</span><span>Websites</span><span>Apps</span>',

			'work.eyebrow': 'Projects',
			'work.heading': 'Projects I made.',
			'work.intro': 'Here you can check projects made by ' + NAMES.studio + '.',
			'work.main.aria': 'Open ' + NAMES.projects.parallox + ' on itch.io',
			'work.main.badge': 'In development',
			'work.main.label': 'Main Project · 2D Pixel RPG',
			'work.main.desc': 'A 2D indie pixel RPG under solo development in Godot, the game where the hero is also the villain.',
			'work.meta.engine': 'Engine',
			'work.meta.type': 'Type',
			'work.meta.status': 'Status',
			'work.meta.typeValue': '2D pixel RPG',
			'work.meta.statusValue': 'In development',
			'work.talk': 'Talk about the project',
			'work.side1.label': 'Game Art',
			'work.side1.title': 'Art & Assets',
			'work.side1.desc': 'Stylized pixel art, characters, props, environments, all created for the project.',
			'work.side2.label': 'Original Soundtracks',
			'work.side2.title': 'Music & SFX',
			'work.side2.desc': 'Original music and sound design produced for the game.',
			'work.side3.label': 'GDScript',
			'work.side3.title': 'Code & Programming',
			"work.side3.desc": "Coding in Godot's supported language, GDScript, creating gameplay mechanics and in-game scenes.",
			'work.m1.aria': "Open " + NAMES.projects.somethingsOff + " on itch.io",
			'work.m1.label': '2D Pixel Game',
			'work.m1.desc': 'A game made in 1 month, where everything keeps getting weirder until you wake up to the harsh truth.',
			'work.m2.aria': 'Open ' + NAMES.projects.cursedArcade + ' on Laymon Games itch.io',
			'work.m2.thumbLabel': 'Add image → assets/cursed.png',
			'work.m2.label': '2D/3D Horror Game',
			'work.m2.desc': 'A horror game made in 4 days, with a unique style and challenging gameplay.',
			'work.m3.aria': NAMES.projects.somethingsOffRemastered + ' – currently in development',
			'work.m3.thumbLabel': 'Add image → assets/off.png',
			'work.m3.label': '2D/3D Horror Game',
			'work.m3.desc': 'A 2D game with some aspects of 3D, the remastered version of the previous game "' + NAMES.projects.somethingsOff + '".',

			'process.eyebrow': 'Process',
			'process.heading': 'Idea. Prototype. Create. Polish.',
			'process.s1.title': 'Idea',
			'process.s1.desc': 'brainstorming an interesting idea, then upgrading it.',
			'process.s2.title': 'Prototype',
			'process.s2.desc': 'Building the smallest playable or visible version before polishing it.',
			'process.s3.title': 'Create',
			'process.s3.desc': 'Developing gameplay, art, audio, game feel, and the systems around them.',
			'process.s4.title': 'Polish',
			'process.s4.desc': 'Test, refine, and improve for the presentation.',
			'process.note': 'One person, moving across the whole pipeline.',

			'contact.eyebrow': 'Contact',
			'contact.heading': 'Wanna get in touch?',
			'contact.intro': 'For collaborations, game projects, creative digital work, or you just want to say hi, get in touch with ' + NAMES.studio + '.',
			'contact.emailLabel': 'Email',
			'contact.copyAria': 'Copy email address',
			'contact.elsewhereLabel': 'Elsewhere',

			'modal.wip.closeAria': 'Close notice',
			'modal.wip.eyebrow': 'Work in Progress',
			'modal.wip.title': 'Under Development',
			'modal.wip.body': 'This project is still under development. Stay tuned!',
			'modal.art.closeAria': 'Close art preview',
			'modal.art.eyebrow': 'Art',
			'modal.art.title': 'Art',
			'modal.art.galleryAria': 'Art preview gallery',
			'modal.art.body': 'If you want to see more art check out my games!',
			'modal.ai.closeAria': 'Close AI notice',
			'modal.ai.eyebrow': 'AI Assisted',
			'modal.ai.title': 'This site was made with the help of AI!',
			'modal.ai.body': 'AI-assisted tools were used to help build this website.',

			'footer.statement': 'Site developed by ' + NAMES.studio + ' (home page by ' + NAMES.collaborator + ').',

			'ui.copied': 'Copied!',
			'ui.emailCopiedAria': 'Email copied to clipboard',
			'ui.artSlideAria': 'Artwork {i} of {total}',
			'ui.artPreviewAlt': 'Art preview {n}',
			'ui.artAddImage': 'Add image: {src}'
		},

		ar: {
			'lang.switchAria': 'تبديل اللغة',

			'skip.text': 'تخطَّ إلى المحتوى',

			'brand.tagline': 'مطوّر ألعاب مستقل',
			'brand.homeAria': 'الصفحة الرئيسية — Laymon Games',

			'nav.ariaPrimary': 'التنقّل الأساسي',
			'nav.ariaMain': 'القائمة الرئيسية',
			'nav.ariaMobile': 'قائمة الجوال',
			'nav.toggleAria': 'فتح القائمة',
			'nav.home': 'الرئيسية',
			'nav.about': 'نبذة',
			'nav.skills': 'المهارات',
			'nav.projects': 'المشاريع',
			'nav.work': 'الأعمال',
			'nav.process': 'المنهجية',
			'nav.contact': 'تواصل',

			'hero.ariaLabel': 'اللوحة الفنية للترويسة — Laymon Games',

			'about.eyebrow': 'نبذة عني',
			'about.personLabel': 'الشخص وراء الاستوديو',
			'about.ownerAlt': 'Aymen Meghezzi، المبدع وراء Laymon Games',
			'about.role': '<strong>' + S + '</strong>، صانع ألعاب ومطوّر مستقل.',
			'about.note': 'ألعاب، برمجة، رسم، صوت، فيديو — كل ذلك من مكان واحد.',
			'about.summaryTitle': 'كل شيء من صنع شخص واحد.',
			'about.bio1': 'أنا الشخص وراء <strong>' + S + '</strong>، مطوّر ألعاب مستقل يركّز على صناعة الألعاب والمشاريع الإبداعية ومونتاج الفيديو. أعمل على البرمجة و الرسوم ثنائية وثلاثية الأبعاد 2D و 3D Low Poly والصوت و الفيديو، لكي يحافظ المشروع بأكمله على اتجاه واحد محدد.',
			'about.bio2': 'أستمتع ببناء الألعاب، من إنتاج الأفكار إلى إنجاز المشروع، و بتوظيف أدوات تساعد في سير المشروع.',
			'about.signature': 'برمجة · رسم · صوت · فيديو',

			'skills.eyebrow': 'المهارات',
			'skills.heading': 'ما الذي<br /><em>أُتقنه:</em>',
			'skills.game.title': 'تطوير الألعاب',
			'skills.game.desc': 'استخدام Godot و GDScript لإنشاء مشاريع ألعاب ثنائية وثلاثية الأبعاد، وبناء أنظمة اللعب، مع وضع جميع العناصر معاً.',
			'skills.game.aria': 'الانتقال إلى المشاريع',
			'skills.tags.art': '<span>Aseprite</span><span>Pixel Art</span><span>Blender</span><span>Low-Poly 3D</span>',
			'skills.art.title': 'الرسم',
			'skills.art.desc': 'رسومات Pixel وبيئات لألعاب 2D، و صناعة Low-Poly 3D بطابع فني مميز لألعاب 3D.',
			'skills.art.aria': 'فتح معاينة الفن',
			'skills.tags.audio': '<span>FL Studio</span><span>Music</span><span>Sound Design</span><span>SFX</span>',
			'skills.audio.title': 'الصوت',
			'skills.audio.desc': 'ساوندتراك أصلي و تصميم الأصوات لعمل بيئة المشهد، أو لقطة من اللعبة.',
			'skills.audio.aria': 'فتح رابط الصوت',
			'skills.tags.video': '<span>Davinci Resolve</span><span>Video Editing</span>',
			'skills.video.title': 'الفيديو',
			'skills.video.desc': 'مونتاج فيديوهات إبداعية تقدّم المشروع بالشكل الذي يستحقه.',
			'skills.video.aria': 'فتح رابط فيديو YouTube',
			'skills.other.title': 'أخرى / بمساعدة الذكاء الاصطناعي',
			'skills.other.desc': 'مواقع وتطبيقات، بينها هذا الموقع، أُنشئت بمساعدة الذكاء الاصطناعي. إنها أداة لإضافة قدرات إضافية، وليست أساس عملي في تطوير الألعاب أو الرسم أو الصوت.',
			'skills.other.aria': 'عرض تنبيه المساعدة بالذكاء الاصطناعي',
			'skills.tags.other': '<span>AI</span><span>مواقع</span><span>تطبيقات</span>',

			'work.eyebrow': 'المشاريع',
			'work.heading': 'مشاريع أنجزتها.',
			'work.intro': 'هنا يمكنك الاطلاع على مشاريع من إنتاج ' + S + '.',
			'work.main.aria': 'فتح ' + NAMES.projects.parallox + ' على itch.io',
			'work.main.badge': 'قيد التطوير',
			'work.main.label': 'المشروع الرئيسي · لعبة RPG Pixel 2D',
			'work.main.desc': 'لعبة RPG Pixel مستقلة قيد التطوير الفردي باستخدام Godot، إنها اللعبة التي يكون فيها البطل هو نفسه الشرير.',
			'work.meta.engine': 'المحرك',
			'work.meta.type': 'النوع',
			'work.meta.status': 'الحالة',
			'work.meta.typeValue': 'لعبة RPG Pixel 2D',
			'work.meta.statusValue': 'قيد التطوير',
			'work.talk': 'لنتحدث عن المشروع',
			'work.side1.label': 'فن اللعبة',
			'work.side1.title': 'الرسم',
			'work.side1.desc': 'فن Pixel بطابع مميز، شخصيات وعناصر وبيئات، كلها أُنشئت خصيصاً للمشروع.',
			'work.side2.label': 'ساوندتراك أصلي',
			'work.side2.title': 'الموسيقى والمؤثرات الصوتية',
			'work.side2.desc': 'موسيقى وتصميم صوتي أصليان أُنتجا خصيصاً لهذه اللعبة.',
			'work.side3.label': 'GDScript',
			'work.side3.title': 'البرمجة',
			'work.side3.desc': 'البرمجة بلغة GDScript المدعومة في Godot، لبناء آليات اللعب والمشاهد داخل اللعبة.',
			'work.m1.aria': 'فتح ' + NAMES.projects.somethingsOff + ' على itch.io',
			'work.m1.label': 'لعبة Pixel 2D',
			'work.m1.desc': 'لعبة أُنجزت خلال شهر واحد، تزداد فيها الغرابة شيئاً بعد شيء حتى تستيقظ على الحقيقة المرة.',
			'work.m2.aria': 'فتح ' + NAMES.projects.cursedArcade + ' على صفحة Laymon Games على itch.io',
			'work.m2.thumbLabel': 'أضف صورة ← <span dir="ltr">assets/cursed.png</span>',
			'work.m2.label': 'لعبة رعب 2D/3D',
			'work.m2.desc': 'لعبة رعب أُنجزت خلال 4 أيام، بأسلوب فريد وتحدٍّ حقيقي في اللعب.',
			'work.m3.aria': NAMES.projects.somethingsOffRemastered + ' – قيد التطوير حالياً',
			'work.m3.thumbLabel': 'أضف صورة ← <span dir="ltr">assets/off.png</span>',
			'work.m3.label': 'لعبة رعب 2D/3D',
			'work.m3.desc': 'لعبة 2D بعناصر من 3D، وهي النسخة المطوّرة من اللعبة السابقة «<span dir="ltr">' + NAMES.projects.somethingsOff.replace(/'/g, '&#39;') + '</span>».',

			'process.eyebrow': 'المنهجية',
			'process.heading': 'فكرة. نموذج. صناعة. تطوير.',
			'process.s1.title': 'الفكرة',
			'process.s1.desc': 'صناعة فكرة شيّقة، ثم تطويرها ورفع مستواها.',
			'process.s2.title': 'النموذج الأولي',
			'process.s2.desc': 'بناء نسخة صغيرة قابلة للعب أو للعرض قبل البدء بتطويرها.',
			'process.s3.title': 'الصناعة',
			'process.s3.desc': 'تطوير أساليب اللعب والفن والصوت وإحساس اللعبة والأنظمة المحيطة بها.',
			'process.s4.title': 'التطوير',
			'process.s4.desc': 'تحسين و رفع مستوى كل شيء استعداداً للعرض.',
			'process.note': 'شخص واحد يتنقّل عبر خط الإنتاج بأكمله.',

			'contact.eyebrow': 'تواصل',
			'contact.heading': 'تريد التواصل معي؟',
			'contact.intro': 'لمشاريع مشتركة، أو مشاريع ألعاب، أو أعمال إبداعية، أو حتى لمجرّد إلقاء التحية — تواصل مع ' + S + '.',
			'contact.emailLabel': 'البريد الإلكتروني',
			'contact.copyAria': 'نسخ البريد الإلكتروني',
			'contact.elsewhereLabel': 'منصات أخرى',

			'modal.wip.closeAria': 'إغلاق التنبيه',
			'modal.wip.eyebrow': 'عمل قيد الإنجاز',
			'modal.wip.title': 'قيد التطوير',
			'modal.wip.body': 'هذا المشروع لا يزال قيد التطوير. ترقّبوا المزيد!',
			'modal.art.closeAria': 'إغلاق معاينة الفن',
			'modal.art.eyebrow': 'الفن',
			'modal.art.title': 'الفن',
			'modal.art.galleryAria': 'معرض معاينة الفن',
			'modal.art.body': 'إن أردت رؤية المزيد من الأعمال الفنية، ألقِ نظرة على ألعابي!',
			'modal.ai.closeAria': 'إغلاق تنبيه الذكاء الاصطناعي',
			'modal.ai.eyebrow': 'بمساعدة الذكاء الاصطناعي',
			'modal.ai.title': 'أُنشئ هذا الموقع بمساعدة الذكاء الاصطناعي!',
			'modal.ai.body': 'استُخدمت أدوات مدعومة بالذكاء الاصطناعي للمساعدة في بناء هذا الموقع.',

			'footer.statement': 'تطوير الموقع بواسطة ' + S + ' (الصفحة الرئيسية بواسطة <span dir="ltr">' + NAMES.collaborator + '</span>).',

			'ui.copied': 'تم النسخ!',
			'ui.emailCopiedAria': 'تم نسخ البريد الإلكتروني إلى الحافظة',
			'ui.artSlideAria': 'العمل الفني {i} من {total}',
			'ui.artPreviewAlt': 'معاينة فنية {n}',
			'ui.artAddImage': 'أضف صورة: {src}'
		}
	};

	var currentLang = 'en';

	function normalize(lang) {
		return SUPPORTED.indexOf(lang) > -1 ? lang : 'en';
	}

	function detectInitial() {
		/* Priority: saved choice → ?lang= → browser preference → English */
		try {
			var saved = window.localStorage.getItem(STORAGE_KEY);
			if (saved && SUPPORTED.indexOf(saved) > -1) return saved;
		} catch (e) { /* storage unavailable */ }

		try {
			var urlLang = new URLSearchParams(window.location.search).get('lang');
			if (urlLang) return normalize(urlLang.toLowerCase());
		} catch (e2) { /* URLSearchParams unavailable */ }

		var candidates = navigator.languages || [navigator.language || 'en'];
		for (var i = 0; i < candidates.length; i++) {
			if (candidates[i] && candidates[i].toLowerCase().indexOf('ar') === 0) return 'ar';
		}
		return 'en';
	}

	function t(key, params) {
		var dict = I18N[currentLang] || I18N.en;
		var value = Object.prototype.hasOwnProperty.call(dict, key)
			? dict[key]
			: I18N.en[key];
		if (value === undefined) return key;
		if (params) {
			Object.keys(params).forEach(function (name) {
				value = value.split('{' + name + '}').join(params[name]);
			});
		}
		return value;
	}

	function applyMeta(meta) {
		var titleEl = document.getElementById('page-title');
		if (titleEl && meta.title) titleEl.textContent = meta.title;

		var descEl = document.getElementById('meta-description');
		if (descEl && meta.description) descEl.setAttribute('content', meta.description);

		var ogTitle = document.getElementById('og-title');
		if (ogTitle && meta.ogTitle) ogTitle.setAttribute('content', meta.ogTitle);

		var ogDesc = document.getElementById('og-description');
		if (ogDesc && meta.ogDescription) ogDesc.setAttribute('content', meta.ogDescription);

		var ogLocale = document.getElementById('og-locale');
		if (ogLocale && meta.ogLocale) ogLocale.setAttribute('content', meta.ogLocale);
	}

	function applyLanguage(lang, options) {
		currentLang = normalize(lang);
		var persist = options && options.persist;
		var root = document.documentElement;

		root.setAttribute('lang', currentLang);
		root.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');

		var nodes = document.querySelectorAll('[data-i18n]');
		Array.prototype.forEach.call(nodes, function (node) {
			node.textContent = t(node.getAttribute('data-i18n'));
		});

		var htmlNodes = document.querySelectorAll('[data-i18n-html]');
		Array.prototype.forEach.call(htmlNodes, function (node) {
			node.innerHTML = t(node.getAttribute('data-i18n-html'));
		});

		var attrNodes = document.querySelectorAll('[data-i18n-attr]');
		Array.prototype.forEach.call(attrNodes, function (node) {
			node.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
				var parts = pair.split(':');
				if (parts.length !== 2) return;
				node.setAttribute(parts[0].trim(), t(parts[1].trim()));
			});
		});

		applyMeta(META[currentLang] || META.en);

		var switchLabel = document.querySelector('[data-lang-switch-label]');
		if (switchLabel) {
			switchLabel.textContent = currentLang === 'ar' ? 'English' : 'العربية';
		}
		var switchBtn = document.querySelector('[data-lang-switch]');
		if (switchBtn) {
			switchBtn.setAttribute('aria-label', t('lang.switchAria'));
		}

		if (persist) {
			try {
				window.localStorage.setItem(STORAGE_KEY, currentLang);
			} catch (e) { /* storage unavailable */ }
		}

		window.dispatchEvent(new CustomEvent('laymon:languagechange', {
			detail: { lang: currentLang }
		}));
	}

	function init() {
		applyLanguage(detectInitial(), { persist: false });

		var switchBtn = document.querySelector('[data-lang-switch]');
		if (switchBtn) {
			switchBtn.addEventListener('click', function () {
				applyLanguage(currentLang === 'ar' ? 'en' : 'ar', { persist: true });
			});
		}
	}

	window.LaymonI18n = {
		t: t,
		names: NAMES,
		languages: SUPPORTED,
		get lang() { return currentLang; },
		apply: applyLanguage
	};

	init();
})();
