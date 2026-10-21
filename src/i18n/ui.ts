/**
 * UI strings for every locale. English is the source; Thai must have the same shape (TypeScript
 * enforces it). Content collections (FAQ, services, process) live in src/content/<type>/<lang>/.
 *
 * Strings marked `html` are rendered with set:html — keep them static, never user input.
 */
export const locales = ['en', 'th'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeMeta: Record<Locale, { label: string; og: string; name: string }> = {
  en: { label: 'EN', og: 'en_US', name: 'English' },
  th: { label: 'TH', og: 'th_TH', name: 'ภาษาไทย' },
};

export const toLocale = (value: string | undefined): Locale =>
  (locales as readonly string[]).includes(value ?? '') ? (value as Locale) : defaultLocale;

/** Path without any locale prefix: "/th/terms/" -> "/terms/", "/th" -> "/". */
export const stripLocale = (pathname: string): string => {
  const m = pathname.match(/^\/(th)(\/|$)(.*)$/);
  return m ? `/${m[3] ?? ''}` : pathname;
};

/** Localised path for a site path such as "/", "/terms/" or "/#contact". English has no prefix. */
export const localePath = (locale: Locale, path = '/'): string =>
  locale === defaultLocale ? path : `/${locale}${path.startsWith('/') ? path : `/${path}`}`;

const en = {
  meta: {
    tagline: 'We build software, tools & devices.',
    description:
      'LARP it till you make it. LARP LAB TH is an anonymous team of college students from Thailand building SaaS, tools, services and devices — and helping teams solve hard technical problems.',
    skip: 'Skip to content',
    home: 'LARP LAB TH — home',
  },
  nav: {
    about: 'About',
    services: 'What we do',
    process: 'Process',
    lab: 'Lab',
    stack: 'Stack',
    faq: 'FAQ',
    contact: 'Contact',
  },
  header: {
    cta: 'Start a project',
    menu: 'Menu',
    primary: 'Primary',
    theme: 'Colour theme:',
    /** accessible name of the link to the other language */
    switchTo: 'อ่านเป็นภาษาไทย',
  },
  hero: {
    kicker: '// developer team',
    title1: 'We build software,',
    title2: 'tools & devices',
    sub: 'is a team of college students from Thailand. We build SaaS, tools, services and devices — and we help teams solve hard technical problems.',
    about: 'About us',
    term: 'Terminal: larp --init loads saas, tools, services, devices, maker and consult modules; status: online, accepting projects; motto: LARP it till you make it.',
  },
  motto: { aria: 'Our motto' },
  about: {
    label: 'About',
    title: 'College students building real software, tools & devices.',
    p1: "We're <strong>LARPers</strong> — a team of college students from Thailand. We turn our own ideas into projects: SaaS products, tools, services, devices and maker builds.",
    p2: 'We also work with others. If you have something to build or a problem to solve, contact us for development or consulting.',
    p3: "We're staying anonymous for now. More about the team soon.",
    facts: { who: 'Who', where: 'Where', infra: 'Infrastructure', proof: 'Proof' },
  },
  services: {
    label: 'What we do',
    title: 'Six ways we build.',
    lead: 'Software, hardware and the space between. One team that can take an idea from whiteboard to working product.',
  },
  process: {
    label: 'How we work',
    title: 'From problem to shipped.',
    lead: "Short loops, working software early, no black boxes. You always know what we're running.",
  },
  lab: {
    label: 'Lab',
    title: "Things we're building.",
    leadSome: 'Products and experiments from the lab. More are on the way.',
    leadNone: "Projects are in the workshop. We'll show them when they're ready to launch.",
    status: { 'coming-soon': 'Coming soon', 'in-progress': 'In development', shipped: 'Shipped' },
    newTab: '(opens in a new tab)',
    next: 'Next project: coming soon',
    ucText:
      "Under construction. Skip ahead for now — we'll show our projects when they're ready to launch.",
    ucSkip: 'skip ahead',
  },
  stack: {
    label: 'Stack',
    title: "What's on the bench.",
    lead: 'We pick tools for the problem, not the other way around. A snapshot of what we reach for most.',
    caption: 'Technologies we use, by area',
    area: 'Area',
    tools: 'Tools',
    areas: ['Web & SaaS', 'Mobile', 'Cloud & DevOps', 'Embedded & IoT', 'AI & Data'],
  },
  faq: { label: 'FAQ', title: 'Questions, answered.' },
  contact: {
    label: 'Contact',
    title: 'Got a problem worth solving?',
    lead: "Tell us what you're building or what's broken. We reply within 12 hours — if you haven't heard back, send it again.",
    name: 'name *',
    email: 'email *',
    company: 'company',
    optional: '(optional)',
    message: 'what are we solving? *',
    topics: {
      build: 'build something',
      consulting: 'consulting',
      join: 'join the team',
      hello: 'just say hi',
    },
    /** html: {terms} and {privacy} are replaced with links */
    agree: 'I agree to the {terms} and {privacy}. *',
    termsLink: 'Terms',
    privacyLink: 'Privacy Policy',
    /** html */
    marketing:
      'Email me occasional updates from LARP LAB TH <em>(optional — unsubscribe any time)</em>.',
    send: 'send message',
    sending: 'sending…',
    sentBtn: 'sent ✓',
    sent: 'Sent. We reply within 12 hours.',
    errors: {
      name_required: 'Please enter your name.',
      email_invalid: 'That email address looks off.',
      message_too_short: 'Tell us a bit more (at least 10 characters).',
      terms_required: 'Please accept the Terms and Privacy Policy to send your message.',
      captcha_required: 'Please complete the check below.',
      captcha_failed: 'The check failed — please try again.',
      not_configured: 'The form is not ready yet — please email us directly.',
      generic: 'Something went wrong — please email us directly.',
      network: 'Network error — please try again or email us directly.',
    },
    otherWays: 'Other ways to reach us',
    findUs: 'Find us',
    emailLabel: 'Email',
    note: 'The form is the fastest way to reach us. We reply within 12 hours.',
  },
  email: {
    show: 'show email address',
    copy: 'copy address',
    copied: 'copied ✓',
    failed: 'copy failed',
    subject: 'Project enquiry — via larplabth.com',
    privacyShow: 'show privacy contact',
    privacySubject: 'Privacy request — larplabth.com',
  },
  footer: {
    social: 'Social links',
    nav: 'Footer',
    location: 'Thailand',
    terms: 'Terms',
    privacy: 'Privacy',
    storage: 'Storage settings',
  },
  storage: {
    aria: 'Storage notice',
    /** html: {details} is replaced with the link */
    text: 'We keep two small things in your browser — your light/dark choice and your Tetris best score — but only if you say yes. No ads, no tracking cookies. The contact form uses Cloudflare Turnstile to block bots, and Cloudflare counts visits without cookies. {details}',
    details: 'Details',
    accept: 'accept',
    essential: 'essential only',
  },
  legal: {
    /** {v} is the version */
    meta: 'Version {v} · English · This is a plain-language policy, written by the team, not a lawyer.',
  },
};

export type Dict = typeof en;

const th: Dict = {
  meta: {
    tagline: 'เราสร้างซอฟต์แวร์ เครื่องมือ และสิ่งประดิษฐ์',
    description:
      'LARP it till you make it. LARP LAB TH คือทีมนักศึกษามหาวิทยาลัยจากประเทศไทยที่ยังไม่เปิดเผยตัวตน เราสร้าง SaaS เครื่องมือ บริการ และสิ่งประดิษฐ์ และช่วยทีมต่าง ๆ แก้ปัญหาทางเทคนิคที่ยาก',
    skip: 'ข้ามไปที่เนื้อหา',
    home: 'LARP LAB TH — หน้าแรก',
  },
  nav: {
    about: 'เกี่ยวกับเรา',
    services: 'สิ่งที่เราทำ',
    process: 'วิธีทำงาน',
    lab: 'แล็บ',
    stack: 'เทคโนโลยี',
    faq: 'FAQ',
    contact: 'ติดต่อ',
  },
  header: {
    cta: 'เริ่มโปรเจกต์',
    menu: 'เมนู',
    primary: 'เมนูหลัก',
    theme: 'ธีมสี:',
    switchTo: 'Read in English',
  },
  hero: {
    kicker: '// ทีมนักพัฒนา',
    title1: 'เราสร้างซอฟต์แวร์',
    title2: 'เครื่องมือ และ\u2060สิ่งประดิษฐ์', // word joiner keeps และสิ่งประดิษฐ์ together
    sub: 'คือทีมนักศึกษามหาวิทยาลัยจากประเทศไทย เราสร้าง SaaS เครื่องมือ บริการ และสิ่งประดิษฐ์ และช่วยทีมต่าง ๆ แก้ปัญหาทางเทคนิคที่ยาก',
    about: 'รู้จักเรา',
    term: 'เทอร์มินัล: larp --init โหลดโมดูล saas, tools, services, devices, maker และ consult สถานะ: ออนไลน์และรับโปรเจกต์ คติ: LARP it till you make it',
  },
  motto: { aria: 'คติของเรา' },
  about: {
    label: 'เกี่ยวกับเรา',
    title: 'นักศึกษาที่สร้างซอฟต์แวร์ เครื่องมือ และสิ่งประดิษฐ์ที่ใช้ได้จริง',
    p1: 'เราคือ <strong>LARPers</strong> ทีมนักศึกษามหาวิทยาลัยจากประเทศไทย เราเปลี่ยนไอเดียของตัวเองให้เป็นโปรเจกต์ ทั้งผลิตภัณฑ์ SaaS เครื่องมือ บริการ สิ่งประดิษฐ์ และงานเมกเกอร์',
    p2: 'เราทำงานร่วมกับคนอื่นด้วย ถ้าคุณมีอะไรอยากสร้างหรือมีปัญหาที่อยากแก้ ติดต่อเราได้ทั้งงานพัฒนาและงานที่ปรึกษา',
    p3: 'ตอนนี้เรายังไม่เปิดเผยตัวตน แล้วจะเล่าเรื่องทีมให้ฟังเร็ว ๆ นี้',
    facts: { who: 'ใคร', where: 'ที่ไหน', infra: 'โครงสร้างพื้นฐาน', proof: 'ผลงาน' },
  },
  services: {
    label: 'สิ่งที่เราทำ',
    title: 'หกอย่างที่เราทำได้',
    lead: 'ซอฟต์แวร์ ฮาร์ดแวร์ และทุกอย่างที่อยู่ระหว่างนั้น ทีมเดียวที่พาไอเดียจากไวต์บอร์ดไปจนเป็นผลิตภัณฑ์ที่ใช้งานได้',
  },
  process: {
    label: 'วิธีทำงาน',
    title: 'จากโจทย์ จนถึงวันส่งมอบ',
    lead: 'ทำเป็นรอบสั้น ๆ ได้เห็นซอฟต์แวร์ที่ใช้งานได้ตั้งแต่เนิ่น ๆ ไม่มีกล่องดำ คุณรู้เสมอว่าเรากำลังทำอะไรอยู่',
  },
  lab: {
    label: 'แล็บ',
    title: 'สิ่งที่เรากำลังสร้าง',
    leadSome: 'ผลิตภัณฑ์และการทดลองจากแล็บ และยังมีอีกหลายอย่างกำลังตามมา',
    leadNone: 'โปรเจกต์ยังอยู่ในเวิร์กช็อป เราจะเปิดให้ดูเมื่อพร้อมเปิดตัว',
    status: { 'coming-soon': 'เร็ว ๆ นี้', 'in-progress': 'กำลังพัฒนา', shipped: 'เปิดตัวแล้ว' },
    newTab: '(เปิดในแท็บใหม่)',
    next: 'โปรเจกต์ถัดไป: เร็ว ๆ นี้',
    ucText: 'ยังอยู่ระหว่างการสร้าง ข้ามไปก่อนได้เลย เราจะโชว์โปรเจกต์เมื่อพร้อมเปิดตัว',
    ucSkip: 'ข้ามไปก่อน',
  },
  stack: {
    label: 'เทคโนโลยี',
    title: 'ของที่อยู่บนโต๊ะทำงาน',
    lead: 'เราเลือกเครื่องมือตามโจทย์ ไม่ใช่เลือกโจทย์ตามเครื่องมือ นี่คือสิ่งที่เราหยิบมาใช้บ่อยที่สุด',
    caption: 'เทคโนโลยีที่เราใช้ แยกตามด้าน',
    area: 'ด้าน',
    tools: 'เครื่องมือ',
    areas: ['เว็บและ SaaS', 'มือถือ', 'คลาวด์และ DevOps', 'Embedded และ IoT', 'AI และข้อมูล'],
  },
  faq: { label: 'FAQ', title: 'คำถามที่พบบ่อย' },
  contact: {
    label: 'ติดต่อ',
    title: 'มีปัญหาที่คุ้มค่าจะแก้ไหม?',
    lead: 'เล่าให้เราฟังว่าคุณกำลังสร้างอะไร หรืออะไรที่พังอยู่ เราตอบกลับภายใน 12 ชั่วโมง ถ้ายังไม่ได้รับคำตอบ ส่งมาใหม่อีกครั้งได้เลย',
    name: 'ชื่อ *',
    email: 'อีเมล *',
    company: 'บริษัท',
    optional: '(ไม่บังคับ)',
    message: 'อยากให้เราช่วยแก้อะไร? *',
    topics: {
      build: 'สร้างอะไรสักอย่าง',
      consulting: 'ขอคำปรึกษา',
      join: 'อยากร่วมทีม',
      hello: 'แค่แวะมาทักทาย',
    },
    agree: 'ฉันยอมรับ{terms}และ{privacy} *',
    termsLink: 'ข้อกำหนดการใช้งาน',
    privacyLink: 'นโยบายความเป็นส่วนตัว',
    marketing:
      'ส่งข่าวสารจาก LARP LAB TH ให้ฉันทางอีเมลเป็นครั้งคราว <em>(ไม่บังคับ ยกเลิกได้ทุกเมื่อ)</em>',
    send: 'ส่งข้อความ',
    sending: 'กำลังส่ง…',
    sentBtn: 'ส่งแล้ว ✓',
    sent: 'ส่งแล้ว เราจะตอบกลับภายใน 12 ชั่วโมง',
    errors: {
      name_required: 'กรุณากรอกชื่อ',
      email_invalid: 'อีเมลนี้ดูไม่ถูกต้อง',
      message_too_short: 'เล่าเพิ่มอีกนิด (อย่างน้อย 10 ตัวอักษร)',
      terms_required: 'กรุณายอมรับข้อกำหนดการใช้งานและนโยบายความเป็นส่วนตัวก่อนส่งข้อความ',
      captcha_required: 'กรุณาทำการตรวจสอบด้านล่างให้เสร็จ',
      captcha_failed: 'การตรวจสอบไม่ผ่าน กรุณาลองใหม่',
      not_configured: 'ฟอร์มยังไม่พร้อมใช้งาน กรุณาส่งอีเมลหาเราโดยตรง',
      generic: 'มีบางอย่างผิดพลาด กรุณาส่งอีเมลหาเราโดยตรง',
      network: 'เครือข่ายมีปัญหา กรุณาลองใหม่ หรือส่งอีเมลหาเราโดยตรง',
    },
    otherWays: 'ช่องทางอื่นในการติดต่อเรา',
    findUs: 'ตามหาเราได้ที่',
    emailLabel: 'อีเมล',
    note: 'ฟอร์มคือช่องทางที่เร็วที่สุด เราตอบกลับภายใน 12 ชั่วโมง',
  },
  email: {
    show: 'แสดงอีเมล',
    copy: 'คัดลอกอีเมล',
    copied: 'คัดลอกแล้ว ✓',
    failed: 'คัดลอกไม่สำเร็จ',
    subject: 'สอบถามเรื่องโปรเจกต์ — ผ่าน larplabth.com',
    privacyShow: 'แสดงอีเมลสำหรับเรื่องข้อมูลส่วนบุคคล',
    privacySubject: 'คำขอเกี่ยวกับข้อมูลส่วนบุคคล — larplabth.com',
  },
  footer: {
    social: 'ลิงก์โซเชียล',
    nav: 'เมนูท้ายหน้า',
    location: 'ประเทศไทย',
    terms: 'ข้อกำหนด',
    privacy: 'ความเป็นส่วนตัว',
    storage: 'ตั้งค่าการจัดเก็บข้อมูล',
  },
  storage: {
    aria: 'ประกาศเรื่องการจัดเก็บข้อมูล',
    text: 'เราเก็บข้อมูลเล็ก ๆ สองอย่างไว้ในเบราว์เซอร์ของคุณ คือโหมดสว่าง/มืดที่เลือกไว้และคะแนน Tetris สูงสุด แต่จะเก็บก็ต่อเมื่อคุณยินยอมเท่านั้น ไม่มีโฆษณา ไม่มีคุกกี้ติดตาม ฟอร์มติดต่อใช้ Cloudflare Turnstile เพื่อกันบอต และ Cloudflare นับจำนวนผู้เข้าชมโดยไม่ใช้คุกกี้ {details}',
    details: 'รายละเอียด',
    accept: 'ยอมรับ',
    essential: 'เฉพาะที่จำเป็น',
  },
  legal: {
    meta: 'ฉบับ {v} · ภาษาไทย · นโยบายนี้เขียนด้วยภาษาที่เข้าใจง่ายโดยทีมงาน ไม่ใช่ทนายความ',
  },
};

export const ui: Record<Locale, Dict> = { en, th };

/** Locale + strings for the page being rendered (Astro.currentLocale comes from the URL). */
export const useLocale = (currentLocale: string | undefined) => {
  const lang = toLocale(currentLocale);
  return { lang, t: ui[lang], path: (p: string) => localePath(lang, p) };
};
