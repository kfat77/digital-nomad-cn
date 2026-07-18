const quotes = [
  "才饮长沙水，又食武昌鱼。万里长江横渡，极目楚天舒。——毛泽东《水调歌头·游泳》",
  "一桥飞架南北，天堑变通途。——毛泽东《水调歌头·游泳》",
  "暮色苍茫看劲松，乱云飞渡仍从容。——毛泽东《七绝·为李进同志题所摄庐山仙人洞照》",
  "冷眼向洋看世界，热风吹雨洒江天。——毛泽东《七律·登庐山》",
  "莫道昆明池水浅，观鱼胜过富春江。——毛泽东《七律·和柳亚子先生》",
  "海内存知己，天涯若比邻。——王勃《送杜少府之任蜀州》",
  "坐地日行八万里，巡天遥看一千河。——毛泽东《七律二首·送瘟神》",
  "不窥牖，见天道。其出弥远，其知弥少。——《老子·道德经》",
  "咫尺之内，便觉万里之遥。——沈括《梦溪笔谈》",
  "结庐在人境，而无车马喧。问君何能尔？心远地自偏。——陶渊明《饮酒·其五》",
  "胸吞百川流，眼界拓五洲。——近代励志联语",
  "乾坤万里眼，时序百年心。——杜甫《中夜》",
  "运筹帷幄之中，决胜千里之外。——司马迁《史记·高祖本纪》",
  "宇宙一何大，万物各自共。——陶渊明《饮酒·其十》",
  "独坐幽篁里，弹琴复长啸。深林人不知，明月来相照。——王维《竹里馆》",
  "身居庙堂之高，心游万仞之外。——古文意蕴",
  "纳须弥于芥子，涉巨海于浮沤。——《维摩诘经》",
  "万物皆备于我，反身而诚，乐莫大焉。——《微子·尽心上》",
  "此心安处是吾乡。——苏轼《定风波·南海归赠王定国侍人寓娘》",
  "人生如逆旅，我亦是行人。——苏轼《临江仙·送钱穆父》",
  "采菊东篱下，悠然见南山。——陶渊明《饮酒·其五》",
  "大隐隐于市，小隐隐于野。——王康琚《反招隐诗》",
  "步移景换，处处为家。——中国传统民谚",
  "莫思身外无穷事，且尽生前有限杯。——杜甫《绝句漫兴九首》",
  "竹杖芒鞋轻胜马，谁怕？一蓑烟雨任平生。——苏轼《定风波·三月七日》",
  "闲依农圃邻，偶似山林客。——储光羲《田家即事》",
  "虽无丝竹管弦之盛，一觞一咏，亦足以畅叙幽情。——王羲之《兰亭集序》",
  "行到水穷处，坐看云起时。——王维《终南别业》",
  "独往独来，是谓独断。独断如独行，万物莫能阻。——《庄子·外物》",
  "天高任鸟飞，海阔凭鱼跃。——大智禅师《古尊宿语录》",
  "日出而作，日入而息。凿井而饮，耕田而食。帝力于我何有哉！——《击壤歌》",
  "浮云游子意，落日故人情。——李白《送友人》",
  "好风凭借力，送我上青云。——曹雪芹《临江仙·柳絮》",
  "千淘万漉虽辛苦，吹尽狂沙始到金。——刘禹锡《浪淘沙·其八》",
  "泰山不让土壤，故能成其大；河海不择细流，故能就其深。——李斯《谏逐客书》",
  "长风破浪会有时，直挂云帆济沧海。——李白《行路难·其一》",
  "穷则独善其身，达则兼济天下。——《孟子·尽心上》",
  "大鹏一日同风起，扶摇直上九万里。——李白《上李邕》",
  "纸上得来终觉浅，绝知此事要躬行。——陆游《冬夜读书示子聿》",
  "天下难事，必作于易；天下大事，必作于细。——《老子·道德经》",
  "仰天大笑出门去，我辈岂是蓬蒿人。——李白《南陵别儿童入京》",
  "万里昆仑谁得见？一挥大笔赋长征。——近现代诗词",
  "独一无二，自成一家。——清·袁枚《随园诗话》",
  "苟有恒，何必三更眠五更起；最无益，莫过一日曝十日寒。——胡居仁自勉联",
  "唯有门前镜湖水，春风不改旧时波。——贺知章《回乡偶书二首》",
  "登高壮观天地间，大江茫茫去不还。——李白《古风·其十九》",
  "阴阳割昏晓，荡胸生曾云。——杜甫《望岳》",
  "星垂平野阔，月涌大江流。——杜甫《旅夜书怀》",
  "莫愁前路无知己，天下谁人不识君。——高适《别董大二首》",
  "万里无云万里天，千江有水千江月。——宋·雷庵正受《嘉泰普灯录》"
];

const quoteTarget = document.querySelector('#random-quote');
if (quoteTarget) quoteTarget.textContent = quotes[Math.floor(Math.random() * quotes.length)];

const categoryIds = ['banking', 'phone', 'securities'];
document.querySelectorAll('.tool-category').forEach((category, index) => {
  if (!category.id) category.id = categoryIds[index] ?? category.id;
});

const menuButton = document.querySelector('[data-menu-toggle]');
const menu = document.querySelector('[data-menu]');
menuButton?.addEventListener('click', () => {
  const isOpen = menu.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});
const notice = document.querySelector('[data-notice]');
if (localStorage.getItem('nomad-notice-dismissed') === 'true') notice?.remove();
document.querySelector('[data-notice-close]')?.addEventListener('click', () => {
  localStorage.setItem('nomad-notice-dismissed', 'true');
  notice?.remove();
});

if (window.gsap && window.ScrollTrigger) {
gsap.registerPlugin(ScrollTrigger);

const mm = gsap.matchMedia();

mm.add({
  reduceMotion: '(prefers-reduced-motion: reduce)',
  desktop: '(min-width: 701px)',
}, ({ conditions }) => {
  const { reduceMotion, desktop } = conditions;

  if (reduceMotion) return;

  gsap.timeline({ defaults: { duration: 0.72, ease: 'power3.out' } })
    .from('.hero .eyebrow', { autoAlpha: 0, y: 18 })
    .from('.hero h1', { autoAlpha: 0, y: 34 }, '-=0.42')
    .from('.hero-copy', { autoAlpha: 0, y: 22 }, '-=0.42')
    .from('.hero-quote-container', { autoAlpha: 0, y: 16 }, '-=0.36');

  gsap.from('.section-heading', {
    autoAlpha: 0,
    y: 30,
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#modules',
      start: 'top 78%',
      toggleActions: 'play none none reverse',
    },
  });

  ScrollTrigger.batch('.module-card', {
    start: 'top 82%',
    once: true,
    interval: 0.12,
    batchMax: 3,
    onEnter: (cards) => gsap.from(cards, {
      autoAlpha: 0,
      y: 44,
      scale: 0.97,
      duration: 0.7,
      ease: 'power3.out',
      stagger: 0.12,
      overwrite: 'auto',
    }),
  });

  gsap.utils.toArray('.module-visual').forEach((visual) => {
    gsap.fromTo(visual, { yPercent: desktop ? -5 : 0 }, {
      yPercent: desktop ? 5 : 0,
      ease: 'none',
      scrollTrigger: {
        trigger: visual.closest('.module-card'),
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.6,
      },
    });
  });

  gsap.from('.principle p', {
    autoAlpha: 0,
    y: 24,
    duration: 0.65,
    ease: 'power3.out',
    stagger: 0.14,
    scrollTrigger: {
      trigger: '.principle',
      start: 'top 80%',
      toggleActions: 'play none none reverse',
    },
  });

  if (desktop && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const bounds = card.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        gsap.to(card, {
          rotationX: -y * 4,
          rotationY: x * 4,
          transformPerspective: 900,
          duration: 0.25,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      });
      card.addEventListener('pointerleave', () => {
        gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.45, ease: 'power3.out' });
      });
    });
  }

  document.fonts?.ready?.then(() => ScrollTrigger.refresh());
});
}
