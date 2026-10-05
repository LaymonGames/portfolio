/* ══════════════════════════════════════════════════════════════════
   LAYMON GAMES — i18n.js
   English / Arabic.

   Every string in this file comes from the supplied OG source
   (OG/translations.js + OG/index.html + OG/privacy-policy.html).
   Nothing is written, reworded or improved here: keys are renamed to
   match the markup, values are copied verbatim.

   Markup contract
     data-i18n="key"            → textContent
     data-i18n-html="key"       → innerHTML (strings that carry markup)
     data-i18n-attr="a:key;b:k" → attributes
     data-i18n-t="key"          → 1-shot, do not observe language changes

   Names (Aymen Meghezzi, Parallox, …) are identifiers and live in the
   markup, not here. They are never translated.
   ══════════════════════════════════════════════════════════════════ */
(function (w) {
  'use strict';

  var STORE = 'lg-lang';
  var SUPPORTED = ['en', 'ar'];

  /* Supplied: OG/translations.js → META */
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

  var DICT = {
    /* ─────────────────────────────── EN ─────────────────────────── */
    en: {
      'meta.title': META.en.title,
      'meta.desc': META.en.description,
      'og.title': META.en.ogTitle,
      'og.desc': META.en.ogDescription,
      'og.locale': META.en.ogLocale,

      /* chrome */
      'a11y.skip': 'Skip to content',
      'lang.switchAria': 'Switch language',
      'lang.switchAction': 'Switch language:',
      'brand.tagline': 'SOLO INDIE DEVELOPER',
      'brand.homeAria': 'Laymon Games home',
      'nav.ariaPrimary': 'Primary navigation',
      'nav.ariaMain': 'Main navigation',
      'nav.ariaMobile': 'Mobile navigation',
      'nav.toggleAria': 'Open navigation',
      'nav.about': 'About',
      'nav.skills': 'Skills',
      'nav.projects': 'Projects',
      'nav.process': 'Process',
      'nav.contact': 'Contact',
      'ui.copied': 'Copied!',
      'ui.emailCopiedAria': 'Email copied to clipboard',
      'ui.artPreviewAlt': 'Art preview {n}',
      'ui.artSlideAria': 'Artwork {i} of {total}',
      'ui.artOpenAria': 'Show artwork {i}: {name}',
      'ui.artPrev': 'Previous artwork',
      'ui.artNext': 'Next artwork',
      'ui.artOf': '{i} / {total}',
      'ui.artHint': 'Use the arrow keys',

      /* hero */
      'hero.ariaLabel': 'Laymon Games header artwork',
      'hero.mascotHint': 'The Laymon lemon. Click it.',
      'hero.lede': 'Games, code, art, audio, video - all in one.',

      /* about */
      'about.eyebrow': 'About',
      'about.personLabel': 'The person behind the studio',
      'about.ownerAlt': 'Aymen Meghezzi, creator behind Laymon Games',
      'about.role': '<strong>Laymon Games</strong>, a creator & solo developer.',
      'about.note': 'Games, code, art, audio, video - all in one.',
      'about.summaryTitle': 'All done by one person.',
      'about.bio1': "I'm the person behind <strong>Laymon Games</strong>, a solo indie developer focused on developing games, apps, and websites, creative digital projects, and editing videos. I work across programming, 2D and 3D art, sound, music, editing, and presentation so the whole project can keep one consistent direction.",
      'about.bio2': 'I like building games, from brainstorming ideas to finishing the project, and using new tools when they genuinely improve the workflow.',
      'about.signature': 'Code · Art · Audio · Video',

      /* skills */
      'skills.eyebrow': 'Skills',
      'skills.heading': 'What I<br><em>can do:</em>',
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
      'skills.other.desc': 'Apps, websites, including this site, built with the help of AI-assisted workflows. A tool for extra capability, not a part of my game development, art, or audio work.',
      'skills.other.aria': 'Show AI assisted notice',
      'skills.tags.other': '<span>AI</span><span>Websites</span><span>Apps</span>',

      /* projects */
      'work.eyebrow': 'Projects',
      'work.heading': 'Projects I made.',
      'work.intro': 'Here you can check projects made by Laymon Games.',
      'work.main.aria': 'Open Parallox on itch.io',
      'work.main.badge': 'In development',
      'work.main.label': 'Main Project · 2D Pixel RPG',
      'work.main.desc': 'A 2D indie pixel RPG under solo development in Godot, the game where the hero is also the villain.',
      'work.meta.engine': 'Engine',
      'work.meta.type': 'Type',
      'work.meta.status': 'Status',
      'work.meta.typeValue': '2D pixel RPG',
      'work.meta.statusValue': 'In development',
      'work.side1.label': 'Game Art',
      'work.side1.title': 'Art & Assets',
      'work.side1.desc': 'Stylized pixel art, characters, props, environments, all created for the project.',
      'work.side2.label': 'Original Soundtracks',
      'work.side2.title': 'Music & SFX',
      'work.side2.desc': 'Original music and sound design produced for the game.',
      'work.side3.label': 'GDScript',
      'work.side3.title': 'Code & Programming',
      'work.side3.desc': "Coding in Godot's supported language, GDScript, creating gameplay mechanics and in-game scenes.",
      'work.m1.aria': "Open Something's Off on itch.io",
      'work.m1.label': '2D Pixel Game',
      'work.m1.desc': 'A game made in 1 month, where everything keeps getting weirder until you wake up to the harsh truth.',
      'work.m2.aria': 'Open Cursed Arcade on Laymon Games itch.io',
      'work.m2.label': '2D/3D Horror Game',
      'work.m2.desc': 'A horror game made in 4 days, with a unique style and challenging gameplay.',
      'work.m3.aria': "Something's Off Remastered – currently in development",
      'work.m3.label': '2D/3D Horror Game',
      'work.m3.desc': 'A 2D game with some aspects of 3D, the remastered version of the previous game "Something\'s Off".',

      /* process */
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

      /* contact */
      'contact.eyebrow': 'Contact',
      'contact.heading': 'Wanna get in touch?',
      'contact.intro': 'For collaborations, game projects, creative digital work, or you just want to say hi, get in touch with Laymon Games.',
      'contact.emailLabel': 'Email',
      'contact.copyAria': 'Copy email address',
      'contact.elsewhereLabel': 'Elsewhere',

      /* modals */
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

      /* footer */
      'footer.statement': 'Site developed by Laymon Games (spinning lemon idea by Youcef Benredjem).'
    },

    /* ─────────────────────────────── AR ─────────────────────────── */
    ar: {
      'meta.title': META.ar.title,
      'meta.desc': META.ar.description,
      'og.title': META.ar.ogTitle,
      'og.desc': META.ar.ogDescription,
      'og.locale': META.ar.ogLocale,

      'a11y.skip': 'تخطَّ إلى المحتوى',
      'lang.switchAria': 'تبديل اللغة',
      'lang.switchAction': 'تبديل اللغة:',
      'brand.tagline': 'مطوّر ألعاب مستقل',
      'brand.homeAria': 'الصفحة الرئيسية — Laymon Games',
      'nav.ariaPrimary': 'التنقّل الأساسي',
      'nav.ariaMain': 'القائمة الرئيسية',
      'nav.ariaMobile': 'قائمة الجوال',
      'nav.toggleAria': 'فتح القائمة',
      'nav.about': 'نبذة',
      'nav.skills': 'المهارات',
      'nav.projects': 'المشاريع',
      'nav.process': 'المنهجية',
      'nav.contact': 'تواصل',
      'ui.copied': 'تم النسخ!',
      'ui.emailCopiedAria': 'تم نسخ البريد الإلكتروني إلى الحافظة',
      'ui.artPreviewAlt': 'معاينة فنية {n}',
      'ui.artSlideAria': 'العمل الفني {i} من {total}',
      'ui.artOpenAria': 'عرض العمل الفني {i}: {name}',
      'ui.artPrev': 'العمل الفني السابق',
      'ui.artNext': 'العمل الفني التالي',
      'ui.artOf': '{i} / {total}',
      'ui.artHint': 'استخدم مفاتيح الأسهم',

      'hero.ariaLabel': 'اللوحة الفنية للترويسة — Laymon Games',
      'hero.mascotHint': 'ليمونة Laymon. اضغط عليها.',
      'hero.lede': 'ألعاب، برمجة، رسم، صوت، فيديو — كل ذلك من مكان واحد.',

      'about.eyebrow': 'نبذة عني',
      'about.personLabel': 'الشخص وراء الاستوديو',
      'about.ownerAlt': 'Aymen Meghezzi، المبدع وراء Laymon Games',
      'about.role': '<span dir="ltr"><strong>Laymon Games</strong></span>، صانع ومطوّر مستقل.',
      'about.note': 'ألعاب، برمجة، رسم، صوت، فيديو — كل ذلك من مكان واحد.',
      'about.summaryTitle': 'كل شيء من صنع شخص واحد.',
      'about.bio1': 'أنا الشخص وراء <span dir="ltr"><strong>Laymon Games</strong></span>، صانع مواقع و تطبيقات و مطوّر ألعاب مستقل أركز على صناعة الألعاب والمشاريع الإبداعية ومونتاج الفيديو. أعمل على البرمجة و الرسوم ثنائية وثلاثية الأبعاد 2D و 3D Low Poly والصوت و الفيديو، لكي يحافظ المشروع بأكمله على اتجاه واحد محدد.',
      'about.bio2': 'أستمتع ببناء الألعاب، من إنتاج الأفكار إلى إنجاز المشروع، و بتوظيف أدوات تساعد في سير المشروع.',
      'about.signature': 'برمجة · رسم · صوت · فيديو',

      'skills.eyebrow': 'المهارات',
      'skills.heading': 'ما الذي<br><em>أُتقنه:</em>',
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
      'skills.other.desc': 'تطبيقات و مواقع بينها هذا الموقع، أُنشئت بمساعدة الذكاء الاصطناعي. إنها أداة لإضافة قدرات إضافية، وليست ضمن عملي في تطوير الألعاب أو الرسم أو الصوت.',
      'skills.other.aria': 'عرض تنبيه المساعدة بالذكاء الاصطناعي',
      'skills.tags.other': '<span>AI</span><span>مواقع</span><span>تطبيقات</span>',

      'work.eyebrow': 'المشاريع',
      'work.heading': 'مشاريع أنجزتها.',
      'work.intro': 'هنا يمكنك الاطلاع على مشاريع من إنتاج <span dir="ltr">Laymon Games</span>.',
      'work.main.aria': 'فتح Parallox على itch.io',
      'work.main.badge': 'قيد التطوير',
      'work.main.label': 'المشروع الرئيسي · لعبة RPG Pixel 2D',
      'work.main.desc': 'لعبة RPG Pixel مستقلة قيد التطوير الفردي باستخدام Godot، إنها اللعبة التي يكون فيها البطل هو نفسه الشرير.',
      'work.meta.engine': 'المحرك',
      'work.meta.type': 'النوع',
      'work.meta.status': 'الحالة',
      'work.meta.typeValue': 'لعبة RPG Pixel 2D',
      'work.meta.statusValue': 'قيد التطوير',
      'work.side1.label': 'فن اللعبة',
      'work.side1.title': 'الرسم',
      'work.side1.desc': 'فن Pixel بطابع مميز، شخصيات وعناصر وبيئات، كلها أُنشئت خصيصاً للمشروع.',
      'work.side2.label': 'ساوندتراك أصلي',
      'work.side2.title': 'الموسيقى والمؤثرات الصوتية',
      'work.side2.desc': 'موسيقى وتصميم صوتي أصليان أُنتجا خصيصاً لهذه اللعبة.',
      'work.side3.label': 'GDScript',
      'work.side3.title': 'البرمجة',
      'work.side3.desc': 'البرمجة بلغة GDScript المدعومة في Godot، لبناء آليات اللعب والمشاهد داخل اللعبة.',
      'work.m1.aria': "فتح Something's Off على itch.io",
      'work.m1.label': 'لعبة Pixel 2D',
      'work.m1.desc': 'لعبة أُنجزت خلال شهر واحد، تزداد فيها الغرابة شيئاً بعد شيء حتى تستيقظ على الحقيقة المرة.',
      'work.m2.aria': 'فتح Cursed Arcade على صفحة Laymon Games على itch.io',
      'work.m2.label': 'لعبة رعب 2D/3D',
      'work.m2.desc': 'لعبة رعب أُنجزت خلال 4 أيام، بأسلوب فريد وتحدٍّ حقيقي في اللعب.',
      'work.m3.aria': "Something's Off Remastered – قيد التطوير حالياً",
      'work.m3.label': 'لعبة رعب 2D/3D',
      'work.m3.desc': 'لعبة 2D بعناصر من 3D، وهي النسخة المطوّرة من اللعبة السابقة «<span dir="ltr">Something&#39;s Off</span>».',

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
      'contact.intro': 'لمشاريع مشتركة، أو مشاريع ألعاب، أو أعمال إبداعية، أو حتى لمجرّد إلقاء التحية — تواصل مع <span dir="ltr">Laymon Games</span>.',
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

      'footer.statement': 'تطوير الموقع بواسطة <span dir="ltr">Laymon Games</span> (فكرة الليمونة الدوارة بواسطة <span dir="ltr">Youcef Benredjem</span>).'
    }
  };

  /* ───────────────────────── plumbing ───────────────────────── */
  var current = 'en';
  var listeners = [];

  function normalize(lang) { return SUPPORTED.indexOf(lang) > -1 ? lang : 'en'; }

  function t(key, params) {
    var dict = DICT[current] || DICT.en;
    var v = Object.prototype.hasOwnProperty.call(dict, key)
      ? dict[key]
      : (Object.prototype.hasOwnProperty.call(DICT.en, key) ? DICT.en[key] : key);
    if (v == null) return key;
    if (params) Object.keys(params).forEach(function (n) {
      v = v.split('{' + n + '}').join(params[n]);
    });
    return v;
  }

  /* A node marked [data-i18n-skip] owns its own children (the art gallery
     builds them), so fill() must not walk into it. Without this the gallery
     had its slides replaced by a key string on load and on every switch. */
  function fill(root) {
    var scope = root || document;
    (scope.querySelectorAll('[data-i18n]')).forEach(function (el) {
      if (el.closest('[data-i18n-skip]')) return;
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    (scope.querySelectorAll('[data-i18n-html]')).forEach(function (el) {
      if (el.closest('[data-i18n-skip]')) return;
      el.innerHTML = t(el.getAttribute('data-i18n-html'));
    });
    (scope.querySelectorAll('[data-i18n-attr]')).forEach(function (el) {
      if (el.closest('[data-i18n-skip]')) return;
      el.getAttribute('data-i18n-attr').split(';').forEach(function (pair) {
        var bits = pair.split(':');
        if (bits.length === 2) el.setAttribute(bits[0].trim(), t(bits[1].trim()));
      });
    });
  }

  function applyMeta() {
    /* A page whose copy exists in one language only opts out with
       <html data-meta="off">; its own <title> then survives the switch. */
    if (document.documentElement.getAttribute('data-meta') === 'off') return;
    var m = META[current];
    var set = function (id, attr, val) {
      var el = document.getElementById(id);
      if (el) el.setAttribute(attr, val);
    };
    var title = document.getElementById('page-title');
    if (title) title.textContent = m.title;
    set('meta-description', 'content', m.description);
    set('og-title', 'content', m.ogTitle);
    set('og-description', 'content', m.ogDescription);
    set('og-locale', 'content', m.ogLocale);
    var alt = document.querySelector('meta[property="og:locale:alternate"]');
    if (alt) alt.setAttribute('content', current === 'ar' ? 'en_US' : 'ar_AR');
  }

  function apply(lang, opts) {
    current = normalize(lang);
    var root = document.documentElement;
    root.setAttribute('lang', current);
    root.setAttribute('dir', current === 'ar' ? 'rtl' : 'ltr');
    if (!opts || opts.persist !== false) {
      try { localStorage.setItem(STORE, current); } catch (e) {}
    }
    fill(document);
    applyMeta();
    listeners.forEach(function (fn) { try { fn(current); } catch (e) {} });
    document.dispatchEvent(new CustomEvent('lg:lang', { detail: current }));
  }

  function detect() {
    try {
      var saved = localStorage.getItem(STORE);
      if (saved && SUPPORTED.indexOf(saved) > -1) return saved;
    } catch (e) {}
    try {
      var q = new URLSearchParams(location.search).get('lang');
      if (q) return normalize(q.toLowerCase());
    } catch (e2) {}
    var langs = navigator.languages || [navigator.language || 'en'];
    for (var i = 0; i < langs.length; i++) {
      if (langs[i] && langs[i].toLowerCase().indexOf('ar') === 0) return 'ar';
    }
    return 'en';
  }

  function onChange(fn) { listeners.push(fn); }

  w.LaymonI18n = {
    apply: apply,
    t: t,
    onChange: onChange,
    get: function () { return current; },
    toggle: function () { apply(current === 'en' ? 'ar' : 'en'); },
    detect: detect,
    SUPPORTED: SUPPORTED
  };

  /* Set language/direction and metadata immediately, then paint the copy
     once the body exists. Nothing is ever shown in the wrong language. */
  apply(detect(), { persist: false });
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { apply(current, { persist: false }); });
  }
})(window);