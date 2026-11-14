// 回归测试 #137：Resolver 基建 —— resolveLocale 纯函数 + 单例订阅 + 6 面迁移 + 订阅不写回
// fork：Lang = en|pt；默认 en；插件偏好 setUiLangPreference 盖过宿主 html[lang]。
// 规格：#134 map + #137 票面 + research/locale-sources/findings.md §4-§6（本 fork 改为 EN/PT）。
// 口径（seam 级，不断实现细节）：
//  A) normalizeLangTag：pt*/en*；zh*→默认 en；已知 BCP47→en；空/垃圾→def（默认 en），永不抛
//  B) resolveLocale：显式 override（arguments.length>=1）> 插件偏好（非 null）> 宿主服务 > html[lang] > navigator > def en
//     测 html/nav 跟随前须 setUiLangPreference(null)，否则偏好会盖过宿主信号
//  C) subscribeLocale 单例：html[lang] 观察者全模块共用；偏好切换也通知；同值去重；unsubscribe 断开全部
//  D) 6 面（panel/settings/button/smart/picker/remoteInputSheet）在 lang 翻转到 pt 后确实重渲染
//  E) 源码级：全 src 零 documentElement.lang 写操作、零 setLocale 调用（宿主是 html[lang] 唯一主人）
//  F) 装配：index.ts 用 ctx.get('locale') 装适配器、inject 不加 'locale'
//  G) 兼容：i18n.getLang 仍导出且等于 resolveLocale（内部走薄壳），STR/tr 原样
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url); // 仅用于加载生成的 .cjs 临时产物与 CJS 包（react/helper），源码一律 import
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.join(import.meta.dirname, '..');
const SRC = (f) => path.join(ROOT, 'src', 'client', f);
const DIR = path.join(import.meta.dirname, '.rt-tmp-137');
const { buildFlat, stripComments } = require('./lib/transpile-client.cjs');

let failures = 0;
function fail(msg) { failures++; console.log('FAIL: ' + msg); }
function ok(msg) { console.log(' ok: ' + msg); }
function eq(actual, want, msg) {
  if (actual !== want) fail(msg + ' → 实际 ' + JSON.stringify(actual) + '，期望 ' + JSON.stringify(want));
}

// ── DOM 桩：html[lang] + 单例 MutationObserver 可观测 ──
const dom = { observers: [], docEl: null, textareas: [] };
function mkEl(tag) {
  return {
    tagName: String(tag).toUpperCase(), style: {}, children: [], dataset: {}, attributes: {},
    setAttribute(k, v) { this.attributes[k] = v; }, getAttribute(k) { return Object.prototype.hasOwnProperty.call(this.attributes, k) ? this.attributes[k] : null; },
    appendChild(c) { this.children.push(c); return c; }, removeChild() {}, remove() {},
    addEventListener() {}, removeEventListener() {}, removeAttribute() {},
    querySelector() { return null; }, querySelectorAll() { return []; },
    getBoundingClientRect() { return { left: 0, top: 0, right: 0, bottom: 0, width: 0, height: 0 }; },
  };
}
function installDom(lang) {
  dom.observers = [];
  dom.textareas = [];
  dom.docEl = Object.assign(mkEl('html'), { lang });
  globalThis.document = {
    documentElement: dom.docEl, head: mkEl('head'), body: mkEl('body'),
    activeElement: null,
    createElement: mkEl, createTextNode: (t) => ({ text: t }),
    querySelector: () => null, querySelectorAll: (sel) => (sel === 'textarea' ? dom.textareas : []),
    getElementById: () => null, addEventListener() {}, removeEventListener() {},
  };
  globalThis.window = { innerWidth: 1280, innerHeight: 800, addEventListener() {}, removeEventListener() {}, setTimeout, clearTimeout };
  globalThis.localStorage = { getItem: (k) => (String(k).startsWith('dsh.prompt.smart') ? '1' : null), setItem() {}, removeItem() {} };
  class FakeMutationObserver {
    constructor(cb) { this.cb = cb; this.disconnected = false; dom.observers.push(this); }
    observe() {} disconnect() { this.disconnected = true; } takeRecords() { return []; }
  }
  globalThis.MutationObserver = FakeMutationObserver;
}
/** 翻 html lang 并触发全部在册观察者（模拟宿主 syncDocumentLanguage 的唯一写点） */
function flipLang(lang) { dom.docEl.lang = lang; for (const o of dom.observers) if (!o.disconnected) o.cb([], o); }
const liveObservers = () => dom.observers.filter((o) => !o.disconnected).length;

/** 宿主服务适配器替身：{ getActive(), subscribe(fn) } */
function makeService(initial) {
  const st = { active: initial, subs: [] };
  return {
    st,
    service: {
      getActive: () => st.active,
      subscribe(fn) { const s = { fn, off: false }; st.subs.push(s); return () => { s.off = true; }; },
    },
    flip(v) { st.active = v; for (const s of st.subs) if (!s.off) s.fn(); },
  };
}

// ── 转译闭包（只声明根，import 边由共享件推导）──
const roots = ['locale.ts', 'strings.ts', 'template-browser.ts', 'settings-page.ts', 'entry-button.ts', 'smart-card.ts', 'workspace-picker.ts', 'remote-sheet.ts'].map(SRC);
buildFlat(DIR, roots);
const req = (n) => require(path.join(DIR, n));
const locale = req('locale.cjs');
const i18n = req('strings.cjs');
const panelMod = req('template-browser.cjs');
const settingsMod = req('settings-page.cjs');
const buttonMod = req('entry-button.cjs');
const smartMod = req('smart-card.cjs');
const pickerMod = req('workspace-picker.cjs');
const sheetMod = req('remote-sheet.cjs');
const smartstore = req('smart-draft.cjs');
const remoteMod = req('remote-mode.cjs');
const React = require('react');
const TR = require('react-test-renderer');

// 产品默认偏好是 'en'；各段测前显式复位，避免段间污染
function resetPrefEn() { locale.setUiLangPreference('en'); }
function clearPref() { locale.setUiLangPreference(null); }

// ═══ A) normalizeLangTag ═══
{
  eq(locale.normalizeLangTag('pt'), 'pt', 'pt 原样→pt');
  eq(locale.normalizeLangTag('pt-BR'), 'pt', 'pt-BR→pt');
  eq(locale.normalizeLangTag('PT-pt'), 'pt', '大小写不敏感 PT-pt→pt');
  eq(locale.normalizeLangTag('pt_BR'), 'pt', '下划线视作横线 pt_BR→pt');
  eq(locale.normalizeLangTag('en'), 'en', 'en 原样→en');
  eq(locale.normalizeLangTag('en-US'), 'en', 'en-US→en');
  eq(locale.normalizeLangTag('EN-us'), 'en', 'EN-us→en');
  eq(locale.normalizeLangTag('zh'), 'en', 'zh→默认 en（本 fork 无中文 UI）');
  eq(locale.normalizeLangTag('zh-CN'), 'en', 'zh-CN→默认 en');
  eq(locale.normalizeLangTag('ZH-Hant-TW'), 'en', 'ZH-Hant-TW→默认 en');
  eq(locale.normalizeLangTag('zh_TW'), 'en', 'zh_TW→默认 en');
  eq(locale.normalizeLangTag('ja'), 'en', '已知 BCP47 非葡语一律 en');
  eq(locale.normalizeLangTag('fr-FR'), 'en', 'fr-FR→en');
  eq(locale.normalizeLangTag(''), 'en', '空串→默认 en');
  eq(locale.normalizeLangTag('   '), 'en', '空白→默认 en');
  eq(locale.normalizeLangTag(null), 'en', 'null→默认 en');
  eq(locale.normalizeLangTag(undefined), 'en', 'undefined→默认 en');
  eq(locale.normalizeLangTag(123), 'en', '数字→默认 en');
  eq(locale.normalizeLangTag({}), 'en', '对象→默认 en');
  eq(locale.normalizeLangTag('not a lang!'), 'en', '垃圾串→默认 en');
  eq(locale.normalizeLangTag('123'), 'en', "非 BCP47 垃圾 '123'→en");
  eq(locale.normalizeLangTag('zh-CN', 'pt'), 'pt', '显式默认 pt 时 zh* 回落 pt');
  eq(locale.normalizeLangTag('', 'pt'), 'pt', '显式默认 pt 可覆盖');
  eq(locale.normalizeLangTag('!!!', 'pt'), 'pt', '垃圾串回落显式默认');
  if (failures === 0) ok('A) normalizeLangTag：pt*/en*/zh*→def/BCP47/空垃圾/显式默认');
}

// ═══ B) resolveLocale 优先级与 fail-soft ═══
{
  // 测 html/nav 跟随：必须清掉插件偏好，否则默认 'en' 盖过宿主信号
  clearPref();
  installDom('en-US');
  eq(locale.resolveLocale(), 'en', 'html[lang]=en-US→en（偏好 null）');
  eq(locale.resolveLocale('pt'), 'pt', '显式 override 压过 html[lang]');
  eq(locale.resolveLocale({ getActive: () => 'pt-BR' }), 'pt', '服务形态 override 压过 html[lang]');
  eq(locale.resolveLocale({ getActive: () => 'ja' }), 'en', 'override 未知标签按 BCP47 归 en');
  eq(locale.resolveLocale('pt', 'en'), 'pt', '第二参默认值不影响合法 override');
  eq(locale.resolveLocale({ getActive: () => { throw new Error('host down'); } }), 'en', 'getActive 抛错 fail-soft 回落 html[lang]');
  eq(locale.resolveLocale({ getActive: () => 42 }), 'en', 'getActive 非串 fail-soft 回落 html[lang]');
  eq(locale.resolveLocale({ getActive: () => '' }), 'en', 'getActive 空串 fail-soft 回落 html[lang]');

  flipLang('pt-BR');
  eq(locale.resolveLocale(), 'pt', 'html[lang]=pt-BR→pt（偏好 null）');
  eq(locale.resolveLocale(''), 'pt', 'override 空串视同缺席，回落 html');

  // 偏好盖过 html：设 pt 后即使 html 是 en，resolveLocale() 仍 pt
  locale.setUiLangPreference('pt');
  flipLang('en-US');
  eq(locale.resolveLocale(), 'pt', '偏好 pt 盖过 html[lang]=en-US');
  eq(locale.resolveLocale('en'), 'en', '显式 override 仍压过偏好');
  clearPref();
  eq(locale.resolveLocale(), 'en', '清偏好后回落 html[lang]=en-US→en');

  // html 空 → navigator（Node 的 navigator 是 getter-only：先删再装，用完还原）
  const navDesc = Object.getOwnPropertyDescriptor(globalThis, 'navigator');
  const setNav = (v) => Object.defineProperty(globalThis, 'navigator', { value: v, configurable: true, writable: true });
  flipLang('');
  setNav({ languages: ['pt-BR', 'en-US'], language: 'en-US' });
  eq(locale.resolveLocale(), 'pt', 'html 空 → navigator.languages[0]');
  setNav({ language: 'pt-PT' });
  eq(locale.resolveLocale(), 'pt', 'html 空 → navigator.language');
  setNav({ languages: [], language: '' });
  eq(locale.resolveLocale(), 'en', 'navigator 全空 → 默认 en');
  eq(locale.resolveLocale(undefined, 'pt'), 'pt', '全无信号 → 显式默认 pt');
  setNav({ languages: ['xx-junk!!'] });
  eq(locale.resolveLocale(), 'en', 'navigator 里只有垃圾标签 → 默认 en');
  // zh* 在 nav 也归一到 en
  setNav({ language: 'zh-CN' });
  eq(locale.resolveLocale(), 'en', 'navigator zh-CN → 默认 en');
  delete globalThis.navigator;
  if (navDesc) Object.defineProperty(globalThis, 'navigator', navDesc); else setNav(undefined);
  if (typeof globalThis.navigator === 'object' && globalThis.navigator !== null) setNav(undefined);
  setNav(undefined);

  // document 缺席（无 DOM 单测/旧宿主）
  const savedDoc = globalThis.document;
  delete globalThis.document;
  eq(locale.resolveLocale(), 'en', '无 document 环境落默认 en（不抛）');
  globalThis.document = savedDoc;

  // documentElement 访问抛错
  const savedEl = dom.docEl;
  Object.defineProperty(globalThis.document, 'documentElement', { get() { throw new Error('boom'); }, configurable: true });
  eq(locale.resolveLocale(), 'en', 'documentElement 访问抛错 fail-soft 落默认');
  Object.defineProperty(globalThis.document, 'documentElement', { value: savedEl, writable: true, configurable: true });

  // 偏好在册时 html/nav 翻转不得改 resolveLocale()
  locale.setUiLangPreference('en');
  flipLang('pt-BR');
  eq(locale.resolveLocale(), 'en', '偏好 en 在册：html→pt 不改变 resolveLocale()');
  resetPrefEn();
  if (failures === 0) ok('B) resolveLocale：override > 偏好 > html > navigator > def，全程 fail-soft');
}

// ═══ C) subscribeLocale 单例订阅 ═══
{
  clearPref();
  installDom('en-US');
  const calls = [];
  const mk = (tag) => (l) => calls.push(tag + ':' + l);
  const offA = locale.subscribeLocale(mk('a'));
  const offB = locale.subscribeLocale(mk('b'));
  const offC = locale.subscribeLocale(mk('c'));
  eq(calls.length, 0, '订阅本身不触发回调（初值由各面 useState 取）');
  eq(liveObservers(), 1, '三处订阅共用同一个 MutationObserver');
  // 无服务也在册：html[lang] 兜底 live（偏好已清）
  flipLang('pt');
  eq(calls.join(','), 'a:pt,b:pt,c:pt', 'lang→pt 三处各回调一次');
  flipLang('pt-BR');
  eq(calls.length, 3, '换写法但解析结果仍 pt → 去重不通知');
  flipLang('en-US');
  eq(calls.slice(3).join(','), 'a:en,b:en,c:en', 'lang 真变才通知');
  flipLang('en');
  eq(calls.length, 6, 'en-US→en 解析结果不变 → 去重不通知');

  // 偏好切换通知订阅者
  locale.setUiLangPreference('pt');
  eq(calls.slice(6).join(','), 'a:pt,b:pt,c:pt', 'setUiLangPreference(pt) 通知订阅者');
  flipLang('en-GB');
  eq(calls.length, 9, '偏好在册：html 翻转不得通知（解析仍 pt）');
  clearPref();
  // clearPref 后解析回落 html=en-GB → en，应通知
  eq(calls.slice(9).join(','), 'a:en,b:en,c:en', '清偏好后回落 html→en 并通知');

  offB();
  flipLang('pt');
  eq(calls.slice(12).join(','), 'a:pt,c:pt', 'unsubscribe 后该面收不到通知');
  offA(); offC();
  eq(liveObservers(), 0, '最后一个订阅退订即断开观察者（无泄漏）');
  const before = calls.length;
  flipLang('en');
  eq(calls.length, before, '全部退订后 lang 再变零通知');

  // 宿主服务适配器：全模块只订一次 + 服务与 html 两条路都 live + unsubscribe 断开全部
  clearPref();
  installDom('en-US');
  const svc = makeService('en');
  const offInstall = locale.installLocaleService(svc.service);
  eq(svc.st.subs.length, 0, '装适配器本身不订（无面在册时零订阅，自造订阅即泄漏）');
  const got = [];
  const off1 = locale.subscribeLocale((l) => got.push(l));
  const off2 = locale.subscribeLocale((l) => got.push(l));
  eq(svc.st.subs.length, 1, '多个面共用一个服务订阅（不是每面一订）');
  svc.flip('pt');
  eq(got.join(','), 'pt,pt', '服务发布 → 各面各收到一次');
  svc.flip('pt');
  eq(got.join(','), 'pt,pt', '服务同值重复发布 → 去重（字典注册只 bump revision）');
  eq(locale.resolveLocale(), 'pt', '服务在场时 resolveLocale 优先读服务快照');
  flipLang('en-US');
  eq(got.join(','), 'pt,pt', '服务仍在册：html 翻转不得压过服务真值');
  svc.flip('en');
  eq(got.join(','), 'pt,pt,en,en', '服务真变 en → 通知');
  eq(liveObservers(), 1, '有服务时 html 兜底观察者照挂（永远再挂一个）');
  off1(); off2();
  eq(svc.st.subs[0].off, true, '最后一个面退订即释放服务订阅（unsubscribe 断开全部）');
  const before3 = got.length;
  svc.flip('pt');
  eq(got.length, before3, '断开后服务再发布零通知');
  const off3 = locale.subscribeLocale((l) => got.push(l));
  eq(svc.st.subs.length, 2, '再次订阅应重新接上服务（幂等重挂，仍只有一个活订阅）');
  svc.flip('pt');
  // 上次断后服务已是 pt；重挂 last 已是 resolveLocale()=pt，再 flip pt 去重
  eq(got.slice(before3).join(','), '', '重挂后同值 pt 去重不通知');
  svc.flip('en');
  eq(got.slice(before3).join(','), 'en', '重挂后服务发布恢复通知');
  off3();
  offInstall();
  eq(svc.st.subs[1].off, true, '卸载适配器断开服务订阅');
  eq(locale.resolveLocale(), 'en', '摘掉服务后回落 html[lang]=en-US → en');

  // 坏服务：getActive 与 subscribe 双双抛错 —— 不得拖垮面，html 兜底仍 live
  const badService = { getActive() { throw new Error('boom'); }, subscribe() { throw new Error('no sub'); } };
  const offBad = locale.installLocaleService(badService);
  const gotBad = [];
  let threw = false;
  let offBadSub = () => {};
  try { offBadSub = locale.subscribeLocale((l) => gotBad.push(l)); } catch (e) { threw = true; }
  if (threw) fail('坏服务（getActive/subscribe 抛错）不得让 subscribeLocale 抛');
  eq(locale.resolveLocale(), 'en', '坏服务 getActive 抛错 → fail-soft 回落 html[lang]');
  flipLang('pt');
  eq(gotBad.join(','), 'pt', '坏服务下 html 兜底仍 live');
  offBadSub(); offBad();
  resetPrefEn();
  if (failures === 0) ok('C) subscribeLocale：单例观察者＋偏好通知＋去重＋unsubscribe 断开全部');
}

// ═══ D) 6 面迁移：lang 翻转到 pt 后确实重渲染 ═══
// 宿主写桥一律成功（同 #104 口径）：不桩则 ensureRemoteLoaded 走相对 URL 失败，
// 反手把远程偏好翻回默认、Dock 面消失 → 语言断言会跟着丢。
globalThis.fetch = async (url) => ({
  ok: true, status: 200,
  // store 快照带 remote：否则在途的 ensureRemoteLoaded 会把远程偏好重置回默认（旧快照分支），
  // button 的 Dock 面会在断言前消失。
  json: async () => (/\/store$/.test(String(url))
    ? { ok: true, value: { remote: { enabled: true, size: 5, orientation: 'auto', density: 'a' } } }
    : { ok: true }),
});

const marker = (k) => [i18n.STR[k].en, i18n.STR[k].pt];
const textOf = (inst) => JSON.stringify(inst.toJSON());
/** 诊断用：列出树里全部 data-dsh-prompt* 钩子（断言失败时才能一眼看出面渲染到哪一步） */
const markersOf = (inst) => {
  const out = [];
  (function walk(n) {
    if (!n) return;
    if (Array.isArray(n)) return n.forEach(walk);
    if (n.props) {
      for (const k of Object.keys(n.props)) if (/^data-dsh-prompt/.test(k)) out.push(k + '=' + n.props[k]);
      if (n.children) n.children.forEach(walk);
    }
  })(inst.toJSON());
  return out.join(' ');
};
const twoGroups = () => {
  const now = Date.now();
  return {
    sessions: {
      list: { getSnapshot: () => ({ items: [{ id: 'a1', title: 'A', cwd: '/a', updatedAt: now }] }) },
      open: () => Promise.resolve(),
    },
    workspaces: { list: { getSnapshot: () => ({ items: [{ workspaceId: 'w1', path: '/a', title: '工程A', sessionIds: ['a1'] }] }) } },
    uiWorkspace: { openSession: () => Promise.resolve() },
  };
};
/** 一个面：初值英文 → 偏好切 pt → 同值去重 → 卸载 */
async function face(name, key, create, setup) {
  resetPrefEn();
  installDom('en-US');
  if (setup) setup();
  let inst;
  await TR.act(async () => { inst = TR.create(create()); });
  const en = marker(key)[0]; const pt = marker(key)[1];
  if (!textOf(inst).includes(en)) fail(name + ' 初始应渲染英文标记「' + en + '」；实际钩子：' + markersOf(inst));
  await TR.act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  if (liveObservers() !== 1) fail(name + ' 应只挂一个共享观察者，实际 ' + liveObservers());
  await TR.act(async () => { locale.setUiLangPreference('pt'); });
  await TR.act(async () => { await new Promise((r) => setTimeout(r, 0)); });
  const after = textOf(inst);
  if (!after.includes(pt)) fail(name + ' lang→pt 后应重渲染出葡文「' + pt + '」');
  if (en !== pt && after.includes(en)) fail(name + ' lang→pt 后不应残留英文「' + en + '」');
  await TR.act(async () => { inst.unmount(); });
  if (liveObservers() !== 0) fail(name + ' 卸载后应断开观察者，实际 ' + liveObservers());
}
async function main() {
  // panel（悬浮面板）
  await face('panel', 'searchPh', () => React.createElement(panelMod.TemplateBrowser, { compact: true }));

  // settings（设置页）
  await face('settings', 'logWhere', () => React.createElement(settingsMod.SettingsPage, {}));

  // button（入口/dock；远程开启 + 左面在场才有可断言文案）
  {
    const st = remoteMod;
    st.__resetRemoteForTests();
    await face('button', 'workspaceLeftExpand', () => React.createElement(buttonMod.EntryButton, {
      open: false, sidebarLeftCtl: { isExpanded: () => false, toggleExpanded: () => {} },
    }), () => { st.setRemoteEnabled(true); });
    st.__resetRemoteForTests();
  }

  // smart（智能悬浮卡；需开关开 + 草稿命中）
  {
    await face('smart', 'smartTitle', () => React.createElement(smartMod.SmartCardHost, {}), () => {
      globalThis.document.activeElement = {
        tagName: 'TEXTAREA', value: '复盘', offsetParent: {},
        closest: () => null, focus: () => {}, setSelectionRange: () => {}, selectionStart: 2,
      };
      dom.textareas = [globalThis.document.activeElement];
      smartstore.setSmartInput({ draft: '复盘' });
    });
    smartstore.setSmartInput({ draft: '' });
  }

  // picker（全屏挑选器）
  await face('picker', 'workspacePicker', () => React.createElement(pickerMod.WorkspacePicker, {
    faces: twoGroups(), currentId: '', remoteSize: 5, wide: false, onClose: () => {},
  }));

  // remoteInputSheet（遥控输入镜）
  await face('remoteInputSheet', 'remoteInputTitle', () => React.createElement(sheetMod.RemoteInputSheet, {
    capturedSessionId: 's1', remoteSize: 5, onClose: () => {},
  }));
  if (failures === 0) ok('D) 6 面：lang→pt 全部重渲染且卸载即断开共享观察者');


// ═══ E) 源码级：零 documentElement.lang 写操作、零 setLocale ═══
{
  const walk = (dir, acc) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p, acc);
      else if (/\.(ts|tsx|mts|cts)$/.test(e.name)) acc.push(p);
    }
    return acc;
  };
  const files = walk(path.join(ROOT, 'src'), []);
  const writePatterns = [
    ['documentElement.lang 赋值', /documentElement\s*\.\s*lang\s*=[^=]/],
    ['documentElement.setAttribute', /documentElement\s*\.\s*setAttribute\s*\(/],
    ['setAttribute(\'lang\')', /setAttribute\s*\(\s*['"]lang['"]/],
    ['写 documentElement.lang 的括号式', /documentElement\s*\[\s*['"]lang['"]\s*\]\s*=[^=]/],
  ];
  for (const f of files) {
    const code = stripComments(fs.readFileSync(f, 'utf8'));
    for (const [label, re] of writePatterns) {
      if (re.test(code)) fail('禁区：' + path.relative(ROOT, f) + ' 出现 ' + label + '（宿主 syncDocumentLanguage 是 html[lang] 唯一主人）');
    }
    if (/(?<![\w$.])setLocale\s*\(/.test(code)) fail('禁区：' + path.relative(ROOT, f) + ' 调了 setLocale（本图不做插件级语言覆盖开关）');
  }
  if (files.length < 20) fail('源码扫描文件数异常：' + files.length);
  // 只读断言：locale.ts 必须仍在读 html[lang]
  const localeSrc = stripComments(fs.readFileSync(SRC('locale.ts'), 'utf8'));
  if (!/documentElement/.test(localeSrc)) fail('locale.ts 应只读 documentElement（读不到才回落）');
  if (failures === 0) ok('E) 源码级：src 全部 ' + files.length + ' 个文件零 lang 写操作、零 setLocale');
}

// ═══ F) 装配：index.ts 走 ctx.get('locale')，inject 不加 'locale' ═══
{
  const idx = stripComments(fs.readFileSync(SRC('index.ts'), 'utf8'));
  if (!/installLocaleService/.test(idx)) fail('index.ts 应在 apply 里装宿主语言面适配器');
  if (!/\.get\s*\(\s*['"]locale['"]\s*\)/.test(idx)) fail('index.ts 应经 ctx.get(\'locale\') 免声明读取（不得加 inject）');
  const m = /export const inject\s*=\s*\[([^\]]*)\]/.exec(idx);
  if (!m) fail('index.ts 应保留 export const inject 声明');
  else {
    if (/['"]locale['"]/.test(m[1])) fail('inject 不得加 locale（ctx.get 免声明路径）');
    if (!/['"]slots['"]/.test(m[1]) || !/['"]inputTriggers['"]/.test(m[1])) fail('inject 原两项应保持');
  }
  if (failures === 0) ok('F) 装配：ctx.get(\'locale\') 装适配器、inject 零改动');
}

// ═══ G) 兼容：getLang 薄壳 ═══
{
  resetPrefEn();
  installDom('en-US');
  eq(i18n.getLang(), 'en', 'getLang 默认 en');
  eq(i18n.getLang(), locale.resolveLocale(), 'getLang 即 resolveLocale 薄壳');
  locale.setUiLangPreference('pt');
  eq(i18n.getLang(), 'pt', 'getLang 跟随偏好→pt');
  // 清偏好后跟随 html；html 仍 en-US
  clearPref();
  eq(i18n.getLang(), 'en', '清偏好后 getLang 跟随 html[lang]→en');
  flipLang('pt-BR');
  eq(i18n.getLang(), 'pt', 'getLang 跟随 html[lang]→pt');
  if (typeof i18n.tr !== 'function' || !i18n.STR || !i18n.STR.sectionName) fail('i18n 的 STR/tr 导出应原样保留');
  const i18nSrc = stripComments(fs.readFileSync(SRC('strings.ts'), 'utf8'));
  if (!/resolveLocale/.test(i18nSrc)) fail('i18n.getLang 应内部走 resolveLocale（薄壳）');
  resetPrefEn();
  if (failures === 0) ok('G) 兼容：getLang/STR/tr 表面不变、内部走 resolveLocale');
}

}

// D 是异步渲染流，E/F/G 必须等它跑完（顺序即语义：共享 DOM 桩不能被两段同时改）
main().then(() => {
  if (failures > 0) { console.log('\nRESULT: FAIL (' + failures + ')'); process.exit(1); }
  console.log('\nRESULT: PASS');
}).catch((e) => {
  console.log('FAIL: 未捕获异常 ' + ((e && e.stack) || e));
  process.exit(1);
});
