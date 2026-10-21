/**
 * Thai has no spaces between words, so browsers break lines with a dictionary that splits
 * compounds ("เครื่อง|มือ") and doesn't know loanwords ("เม|กเกอร์"). `kw()` wraps the words below
 * in <span class="kw"> (white-space: nowrap in global.css) so they never break in the middle.
 * The text itself is unchanged, so copy/paste and search engines see normal Thai.
 *
 * Add words here when a Thai line breaks in an odd place. Latin text is never touched.
 */
const KEEP = [
  'เครื่องมือ',
  'เมกเกอร์',
  'ซอฟต์แวร์',
  'ฮาร์ดแวร์',
  'เฟิร์มแวร์',
  'มัลแวร์',
  'ไวต์บอร์ด',
  'แดชบอร์ด',
  'โปรเจกต์',
  'เวิร์กช็อป',
  'เซนเซอร์',
  'คลาวด์',
  'เทอร์มินัล',
  'เบราว์เซอร์',
  'โอเพนซอร์ส',
  'ผลิตภัณฑ์',
  'มหาวิทยาลัย',
  'นักศึกษา',
  'นักพัฒนา',
  'ที่ปรึกษา',
  'ประเทศไทย',
  'อุปกรณ์',
  'สิ่งประดิษฐ์',
  'ต้นแบบ',
  'อีเมล',
  'ข้อความ',
  'ความเป็นส่วนตัว',
  'ข้อกำหนด',
  'ตัวเอง',
];

const RE = new RegExp([...KEEP].sort((a, b) => b.length - a.length).join('|'), 'g');

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/** For trusted static HTML strings (they may contain <strong>/<em>). */
export const kwHtml = (html: string): string => html.replace(RE, '<span class="kw">$&</span>');

/** Plain text in, safe HTML out. Use with set:html. */
export const kw = (text: string): string => kwHtml(escape(text));

/** Rendered HTML (e.g. Markdown output): only text between tags is touched, never attributes. */
export const kwInHtml = (html: string): string =>
  html.replace(/>([^<]+)</g, (_, text: string) => `>${kwHtml(text)}<`);
