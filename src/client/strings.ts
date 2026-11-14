/**
 * 双语词表 STR/tr（Strings，解析已收口 locale）（#171 N6：可 import 者 —— entry-button、index、label-identity、remote-sheet、settings-links、settings-page、smart-card、template-browser、workspace-picker）。
 * 跑浏览器 bundle 线；禁被 src/update/host 进口（DO-NOT-IMPORT），禁跨运行时进口。
 */
/**
 * dsh-prompt — 双语词表与兼容入口（English default + Portuguese option; plugin language toggle）
 *
 * #137 起语言解析与订阅收口在 ./locale（normalizeLangTag / resolveLocale / subscribeLocale）；
 * 本模块只留词表面（STR / tr）与 getLang 兼容薄壳 —— 新代码请直接用 ./locale，
 * 不要经这个历史入口（它保留只是为了不动既有调用点的表面签名）。
 */
import { resolveLocale, type Lang } from './locale'

export type { Lang } from './locale'

/** @deprecated #137：兼容薄壳，内部走 resolveLocale（signature unchanged; default en）。新代码用 ./locale 的 resolveLocale。 */
export function getLang(): Lang {
  return resolveLocale()
}

export interface I18NMap { en: string; pt: string }

export function tr(lang: Lang, m: I18NMap): string {
  return lang === 'pt' ? m.pt : m.en
}

export const STR = {
  // Language toggle (fork): settings row — EN default, PT option.
  langRowLabel: { en: "Language", pt: "Idioma" },
  langEn: { en: "English", pt: "English" },
  langPt: { en: "Português", pt: "Português" },
  langHint: { en: "Plugin UI language. Default English; switch anytime.", pt: "Idioma da interface do plugin. Padrão inglês; troque quando quiser." },
  panelTitle: { en: "Prompt", pt: "Prompt" },
  // #77：设置页那一块模板列表默认收起，头行整行是开关 —— 这一个是它的 title / 可点提示。
  templatesToggleHint: { en: "Click to expand or collapse the template list", pt: "Clique para expandir ou recolher a lista de modelos" },
  // #53：本插件在设置面板里的页面名 —— 配置页头行左侧与 settings.section 的 label 共用这一份
  sectionName: { en: "Prompt Templates", pt: "Modelos de Prompt" },
  entryBtn: { en: "Prompt", pt: "Prompt" },
  add: { en: "Add custom template", pt: "Adicionar modelo personalizado" },
  addShort: { en: "Add", pt: "Adicionar" },
  searchPh: { en: "Search templates…", pt: "Buscar modelos…" },
  tabAll: { en: "All", pt: "Todos" },
  tabBefore: { en: "Before", pt: "Antes" },
  tabDuring: { en: "During", pt: "Durante" },
  tabAfter: { en: "After", pt: "Depois" },
  tabCustom: { en: "Custom", pt: "Personalizado" },
  domainAll: { en: "All domains", pt: "Todos os domínios" },
  presetCount: { en: "Preset", pt: "Pré-definido" },
  // #141：范围钮「预制」—— 不复用 presetCount（那是条数摘要；同字不同位，钩子要能分开定位），
  // 也不复用 store.LABEL_FALLBACK（那是写进用户数据的身份值，不是显示串）。术语统一：铬一律「预制」。
  // 改 en 文案时与 presetCount 同步改；门禁 P1_KEYS 卡住单键缺失但卡不住语义分叉。
  scopePreset: { en: "Preset", pt: "Pré-definido" },
  // #165 屏蔽预制：按钮文案是**动作式**（说点它会发生什么，不是当前状态）——
  // 铁律：缺省=屏蔽；屏蔽中按钮写「展示预制模板」，展示中写「屏蔽预制模板」。
  // 同 #141 scopePreset/presetCount 先例：新位新键，不复用条数摘要（钩子要能分开定位）。
  showPreset: { en: "Show presets", pt: "Mostrar pré-definidos" },
  hidePreset: { en: "Hide presets", pt: "Ocultar pré-definidos" },
  // #165 需求 4：设置页开关行（与屏蔽钮同词"屏蔽预制模板"，开关语义：开=屏蔽）。
  hidePresetToggle: { en: "Hide preset templates", pt: "Ocultar modelos pré-definidos" },
  hidePresetHint: { en: "When on, preset templates are hidden from the list and label cloud", pt: "Quando ativo, os modelos pré-definidos ficam ocultos na lista e na nuvem de rótulos" },
  // #179 触发方式（悬浮触发 / 仅点击触发）：底栏按钮与设置行共用**状态式**文案（说当前是哪种模式），
  // 铁律：缺省=悬浮触发；悬浮中按钮写「当前：悬浮触发」，点击中写「当前：点击触发」。
  // 用户反馈「点击触发」四字单看分不清是状态还是动作（m00001）→ 按钮正文一律带「当前：」前缀表状态，
  // 点后去向只放在 title/aria（triggerTitle*），不再只靠正文反推。
  // 设置行左侧标签固定「触发方式」，右侧按钮文案随状态翻转 —— 两处同一份词表，永不各写一套。
  // switchToClick/switchToHover 为 #179 首版动作式旧键（只增不减，保留不删，组件已改走 triggerNow*/triggerTitle*）。
  triggerRowLabel: { en: "Trigger mode", pt: "Modo de abertura" },
  switchToClick: { en: "Click to open", pt: "Abrir com clique" },
  switchToHover: { en: "Hover to open", pt: "Abrir ao passar o mouse" },
  triggerNowHover: { en: "Hover now", pt: "Agora: ao passar o mouse" },
  triggerNowClick: { en: "Click now", pt: "Agora: com clique" },
  triggerTitleHover: { en: "Now hover-to-open; click to switch to click-to-open", pt: "Agora abre ao passar o mouse; clique para mudar para abrir com clique" },
  triggerTitleClick: { en: "Now click-to-open; click to switch to hover-to-open", pt: "Agora abre com clique; clique para mudar para abrir ao passar o mouse" },
  triggerHint: { en: "Hover opens the menu by default. With click-to-open, only a click opens it — an accidental pointer pass no longer flickers.", pt: "Por padrão, passar o mouse abre o menu. Com abrir com clique, só um clique abre — um passe acidental do ponteiro não pisca mais." },
  customCount: { en: "Custom", pt: "Personalizado" },
  // #142：空标签回落词显示映射 —— en 与 tabCustom/customCount 同字（Custom）但**不同键、不复用**
  // （那两个是范围钮/条数摘要的铬，钩子要能分开定位；见 #141 presetCount/scopePreset 先例）。
  // store.LABEL_FALLBACK 是写进用户数据的身份值（永不翻译），这里只是它在各展示位的显示串。
  labelFallback: { en: "Custom", pt: "Personalizado" },
  // #142 边缘裁决 a：复制预置拼进 name 落盘（用户数据一部分，已存永不改写）。无 parse 回代码
  // （grep 仅 template-library.ts 创建行），故新建那一刻按当前语言取一次后缀；en 含前导空格（name + suffix 自然拼出 'name (copy)'）。
  copySuffix: { en: " (copy)", pt: " (cópia)" },
  goSettings: { en: "Settings → Templates", pt: "Configurações → Modelos" },
  // #150：底栏合并行里显示用的**短形** —— 「设置 →」是导航前缀、不承载语义，全称留在 title/aria（goSettings）。
  // 术语统一：显示串仍指同一个目的地（设置面板里的「提示词模板」页）。
  goSettingsShort: { en: "Templates", pt: "Modelos" },
  // #149：设置入口是异步 DOM 兜底（宿主无插件级 open API），跳转失败必须可见 ——
  // 原件是"先关面板再跳"，跳不动就什么都没发生。失败时按钮原位换成这句话（4 秒后复原）。
  goSettingsFail: { en: "Settings not opened: use ⚙ → Prompt Templates", pt: "Configurações não abertas: use ⚙ → Modelos de Prompt" },
  edit: { en: "Edit", pt: "Editar" },
  del: { en: "Delete", pt: "Excluir" },
  copy: { en: "Copy", pt: "Copiar" },
  pin: { en: "Pin/Unpin", pt: "Fixar/Desafixar" },
  noMatch: { en: "No matching templates", pt: "Nenhum modelo correspondente" },
  addTitle: { en: "Add custom template", pt: "Adicionar modelo personalizado" },
  editTitle: { en: "Edit custom template", pt: "Editar modelo personalizado" },
  namePh: { en: "Template name", pt: "Nome do modelo" },
  // #159 颜色标签（地图 #151）：字段名与「未选颜色」态文案收口在这里 —— 158 的取色控件复用同一份，
  // 不另造同义词（同概念两名正是 #141 presetCount/scopePreset 那类坑的来源）。
  colorLabel: { en: "Text color", pt: "Cor do texto" },
  colorDefault: { en: "Default (follows theme, no outline)", pt: "Padrão (segue o tema, sem contorno)" },
  // #158 取色控件（地图 #151）内部四条铬：色相条的无障碍名、深浅格说明（灰=看不清）、十六进制占位、
  // 以及「带外值不落盘」的明示 —— 契约要求控件自己说清为什么存不进（写入口不吸附、不改写存量）。
  colorHue: { en: "Hue", pt: "Matiz" },
  colorShade: { en: "greyed cells are unreadable and cannot be picked", pt: "células acinzentadas são ilegíveis e não podem ser escolhidas" },
  colorHexPh: { en: "Or enter a hex value (#rrggbb)", pt: "Ou digite um valor hexadecimal (#rrggbb)" },
  colorOutOfBand: { en: "This color lacks contrast in one theme — pick another shade.", pt: "Esta cor tem contraste insuficiente em um dos temas — escolha outro tom." },
  // #161 取色控件改版（用户真机反馈：看不懂、很多块点不动）：入口收成一个按钮 + 点开的浮层。
  // 浮层里只放「看得清」的颜色，所以不再需要「灰格子」那套解释；这里补的是入口按钮、预览条与提示文案。
  // 用户 2026-10-15 判定浮层不必再自我解释（墙上没有点不动的块、预览即时可见）⇒ colorWallHint 已不渲染，
  // 但按本仓「字典只增不减」的规矩**保留键**：将来要加回一句引导时，改回渲染即可。
  colorField: { en: "Text color", pt: "Cor do texto" },
  // 2026-10-15 真机反馈（#164 ①）：格子里只留「默认」两个字，剥掉「（跟随主题）」——
  // 那行要挤「默认 + 十六进制 + 文字描边」三个控件，标签每宽一个字，宿主字号大档时就更早换行。
  // 完整语义没丢：同一个格子仍带 title/aria = colorDefault（'默认（跟随主题，无描边）'）。
  colorDefaultShort: { en: "Default", pt: "Padrão" },
  colorPreview: { en: "Preview", pt: "Pré-visualização" },
  colorPreviewSample: { en: "Your template name", pt: "O nome do seu modelo" },
  colorDone: { en: "Done", pt: "Concluído" },
  colorOutline: { en: "Text outline", pt: "Contorno do texto" },
  colorWallHint: { en: "All colors shown are verified for readability in both dark and light themes.", pt: "Todas as cores exibidas foram verificadas quanto à legibilidade nos temas escuro e claro." },
  labelsPh: { en: "Add labels (comma/space separated, Enter to confirm)", pt: "Adicionar rótulos (separados por vírgula/espaço, Enter para confirmar)" },
  labelsHint: { en: "At most 3 labels, 1–10 chars each; pick existing or invent new", pt: "No máximo 3 rótulos, 1–10 caracteres cada; escolha existentes ou invente novos" },
  labelsTooMany: { en: "At most 3 labels", pt: "No máximo 3 rótulos" },
  labelTooLong: { en: "Each label 1–10 chars", pt: "Cada rótulo com 1–10 caracteres" },
  removeLabel: { en: "Remove label", pt: "Remover rótulo" },
  labelPicker: { en: "Pick tags", pt: "Escolher tags" },
  labelDone: { en: "Done", pt: "Concluído" },
  bodyPh: { en: "Prompt body (≤10000 chars)", pt: "Corpo do Prompt (≤10000 caracteres)" },
  // #178：正文输入框下的存法提示 —— 换行原样保留；{{cursor}} 是插入后光标位（第一个生效，其余删除）。
  bodyHint: { en: "Line breaks are kept exactly as written — including blank lines at the start or end; only edge spaces and tabs are ignored. Put {{cursor}} in the body and the caret lands there after inserting; only the first one counts, the rest are removed.", pt: "Quebras de linha são mantidas exatamente como escritas — inclusive linhas em branco no início ou no fim; só espaços e tabulações nas bordas são ignorados. Coloque {{cursor}} no corpo e o cursor para ali após inserir; só o primeiro conta, os demais são removidos." },
  cancel: { en: "Cancel", pt: "Cancelar" },
  save: { en: "Save", pt: "Salvar" },
  addOk: { en: "Add", pt: "Adicionar" },
  nameRequired: { en: "Name is required", pt: "Nome é obrigatório" },
  bodyTooLong: { en: "Body exceeds 10000 chars", pt: "Corpo excede 10000 caracteres" },
  delTitle: { en: "Confirm delete", pt: "Confirmar exclusão" },
  delMsg: { en: "Delete custom template", pt: "Excluir modelo personalizado" },
  // #141 P2：模板名的括法（zh 全角引号 / en 弯引号）——{name} 是数据词，只有标点是铬
  nameQuote: { en: "“{name}”", pt: "“{name}”" },
  delUnrecover: { en: "This cannot be undone.", pt: "Isto não pode ser desfeito." },
  delOk: { en: "Delete", pt: "Excluir" },
  pinFull: { en: "Pin limit reached (5)", pt: "Limite de fixação atingido (5)" },
  insertHint: { en: "Click to insert", pt: "Clique para inserir" },
  // #141：行内用量徽标的 title「已使用 N 次」（zh {n} 在中间，en 在尾部；调用方 .replace('{n}', …)）
  usageTitle: { en: "Used {n} times", pt: "Usado {n} vezes" },
  // #141：设置页行折叠提示（title 里数据词之后那半截；' · ' 分隔符留在调用方）
  rowExpandHint: { en: "Click to expand or collapse the summary", pt: "Clique para expandir ou recolher o resumo" },
  close: { en: "Close", pt: "Fechar" },
  // #141 P2：全角加号（'＋ 新增' 与裸 '＋'）—— 纯符号，en 下落半角 '+'
  plusGlyph: { en: "+", pt: "+" },
  smartToggle: { en: "Smart card (recommends templates while typing; off by default)", pt: "Cartão inteligente (recomenda modelos ao digitar; desligado por padrão)" },
  smartToggleHint: { en: "Off by default; when on, the card appears on match", pt: "Desligado por padrão; quando ligado, o cartão aparece ao haver correspondência" },
  smartDot: { en: "Smart mode · drag to move; card appears on match", pt: "Modo inteligente · arraste para mover; o cartão aparece ao haver correspondência" },
  smartTitle: { en: "Smart suggest", pt: "Sugestão inteligente" },
  smartHint: { en: "Click to insert", pt: "Clique para inserir" },
  smartFill: { en: "Insert", pt: "Inserir" },
  smartDismiss: { en: "Dismiss (reappears as you type)", pt: "Dispensar (reaparece conforme você digita)" },
  smartRecent: { en: "Recently used", pt: "Usados recentemente" },
  smartCommon: { en: "Common templates", pt: "Modelos comuns" },
  // #141：智能卡行内后缀（'·常用' 是 0 分兜底行，'·分N' 是评分行）——与上面 smartCommon（命中列文案）语义不同
  smartCommonSuffix: { en: "·Common", pt: "·Comum" },
  smartScoreSuffix: { en: "·Score {n}", pt: "·Pontuação {n}" },
  // #37/#254：页头入口（原 🌟 仓库 / 💬 ISSUE 两枚图标）已换成 base 包 ActionGroup 三件套，
  // 图标、地址与悬停文案全由 base 的 MESSAGES 提供（starLabel / issueLabel / contact / actionsLabel
  // 与 starTip / issueTip / contactTip）；以下四键自 #254 起不再有引用，仅作历史保留，勿在新增代码里用。
  gitHubRepo: { en: "GitHub repo", pt: "Repositório GitHub" },
  feedback: { en: "Report issue", pt: "Reportar problema" },
  starTip: { en: "Your ⭐ is the brightest star in my night sky.", pt: "Sua ⭐ é a estrela mais brilhante no meu céu noturno." },
  feedbackTip: { en: "Feedback, suggestions and ideas — all welcome 🌹", pt: "Feedback, sugestões e ideias — todos bem-vindos 🌹" },
  // 注：原「自定义模板与使用次数保存在 DSH 缓存目录…」那句界面文案已按作者决定删除 —— 它摆在
  // 两张卡片之间像一句游离的声明，而说明的对象就是上面那张模板卡，不再单独占一行。
  // 地图 #45 / #51：配置页的日志开关 + 导出 + 清空三个入口（文案写明「错误与告警始终记录」）
  logToggle: { en: "Debug log", pt: "Log de depuração" },
  logToggleHint: { en: "Off stops only info and debug; errors and warnings are always recorded.", pt: "Desligado interrompe só info e debug; erros e avisos são sempre registrados." },
  logGroup: { en: "Diagnostics", pt: "Diagnósticos" },
  logWhere: { en: "Location: ~/.dsh/logs/dsh-prompt/", pt: "Local: ~/.dsh/logs/dsh-prompt/" },
  smartGroup: { en: "Smart suggestions", pt: "Sugestões inteligentes" },
  // #82 远程模式段（规格 #85 US6/US7/US8/US18/US19/US24/US25）：总闸 + 字号/控件三档 + 宿主缺席明示。
  // 栏头不设切换（#85 US10），进出只走这里；总闸默认关。
  remoteGroup: { en: "Remote mode", pt: "Modo remoto" },
  remoteToggle: { en: "Remote mode", pt: "Modo remoto" },
  remoteSize: { en: "Size", pt: "Tamanho" },
  remoteSizeMin: { en: "1", pt: "1" },
  remoteSizeMax: { en: "10", pt: "10" },
  // #141：滑块值 pill「N档·P%」（与 remoteSizeMin/Max 同口径：en 不带「档」）
  remoteSizeValue: { en: "{n} · {p}%", pt: "{n} · {p}%" },
  remotePersistFail: { en: "Persist failed: this choice works for now, defaults return next time — please retry.", pt: "Falha ao persistir: esta escolha vale por agora; na próxima vez voltam os padrões — tente de novo." },
  remoteOrientation: { en: "Orientation", pt: "Orientação" },
  remoteOrientationHint: { en: "Auto follows the system display, falling back to viewport without a bridge; a lock tries the system display first, falling back to our own layout.", pt: "Automático segue a tela do sistema, caindo para a viewport sem ponte; um bloqueio tenta a tela do sistema primeiro, caindo para nosso próprio layout." },
  remoteOrientationAuto: { en: "Auto", pt: "Automático" },
  remoteOrientationLandscape: { en: "Landscape", pt: "Paisagem" },
  remoteOrientationPortrait: { en: "Portrait", pt: "Retrato" },
  remoteOrientationBusy: { en: "Switching system orientation…", pt: "Alternando orientação do sistema…" },
  remoteOrientationOsFail: { en: "System display unchanged; own layout locked (reason: {code}).", pt: "Tela do sistema inalterada; layout próprio bloqueado (motivo: {code})." },
  remoteNeedOn: { en: "Turn on remote mode first", pt: "Ative o modo remoto primeiro" },
  remoteEffectiveNow: { en: "Now: {orient} ({source})", pt: "Agora: {orient} ({source})" },
  remoteSourceSystem: { en: "system display", pt: "tela do sistema" },
  remoteSourceViewport: { en: "viewport", pt: "viewport" },
  remoteLockedOrientation: { en: "Locked to {orient}", pt: "Bloqueado em {orient}" },
  remoteDensity: { en: "Grid density", pt: "Densidade da grade" },
  remoteDensityA: { en: "12", pt: "12" },
  remoteDensityB: { en: "8 large", pt: "8 grandes" },
  remoteHostPending: { en: "Waiting on host", pt: "Aguardando o host" },
  remoteSystemOrientation: { en: "Rotate whole system (needs host H1)", pt: "Girar o sistema inteiro (precisa do host H1)" },
  remoteSystemOrientationHint: { en: "One tap rotates the outside system when the host supports it; when absent only this row is greyed and the master switch still works.", pt: "Um toque gira o sistema externo quando o host oferece suporte; quando ausente, só esta linha fica acinzentada e o interruptor principal continua funcionando." },
  remoteSystemFont: { en: "System font follow (needs host H2)", pt: "Seguir fonte do sistema (precisa do host H2)" },
  remoteSystemFontHint: { en: "The whole system follows when the host supports it; when absent our own surface still enlarges.", pt: "O sistema inteiro acompanha quando o host oferece suporte; quando ausente, nossa própria superfície ainda aumenta." },
  remoteConfigKey: { en: "Remote settings", pt: "Configurações remotas" },
  remoteConfigKeyFallbackHint: { en: "Opens the settings remote section", pt: "Abre a seção remota das configurações" },
  // #94：齿轮右侧侧栏折叠键的两态可访问名（展开/折叠 DSH 右侧边栏）
  sidebarExpand: { en: "Expand right sidebar", pt: "Expandir barra lateral direita" },
  sidebarCollapse: { en: "Collapse right sidebar", pt: "Recolher barra lateral direita" },
  // #95：远程 Dock 收展键可访问名
  dockCollapse: { en: "Collapse toolbar", pt: "Recolher barra de ferramentas" },
  dockExpand: { en: "Expand toolbar", pt: "Expandir barra de ferramentas" },
  // #104：左工作区折叠键（休眠契约）+ 全屏挑选器入口键（异步双门控）
  workspaceLeftExpand: { en: "Expand left workspace", pt: "Expandir área de trabalho esquerda" },
  workspaceLeftCollapse: { en: "Collapse left workspace", pt: "Recolher área de trabalho esquerda" },
  workspacePicker: { en: "Pick session", pt: "Escolher sessão" },
  pickerSearch: { en: "Search: title + workspace…", pt: "Buscar: título + área de trabalho…" },
  pickerLoading: { en: "Loading…", pt: "Carregando…" },
  pickerCancel: { en: "Cancel", pt: "Cancelar" },
  pickerRetry: { en: "Retry", pt: "Tentar de novo" },
  pickerEmpty: { en: "No sessions available", pt: "Nenhuma sessão disponível" },
  pickerEmptySearch: { en: "No matches — try another keyword", pt: "Nenhuma correspondência — tente outra palavra-chave" },
  pickerProbeFail: { en: "Host surface unavailable — retry here", pt: "Superfície do host indisponível — tente de novo aqui" },
  pickerSwitchFail: { en: "Switch failed — retry here", pt: "Falha na troca — tente de novo aqui" },
  pickerSwitchFailBadge: { en: "Failed", pt: "Falhou" },
  pickerSwitching: { en: "Switching", pt: "Trocando" },
  pickerCurrent: { en: "Current", pt: "Atual" },
  pickerBlank: { en: "Blank", pt: "Em branco" },
  pickerUntitled: { en: "(Blank session)", pt: "(Sessão em branco)" },
  pickerUngrouped: { en: "Ungrouped", pt: "Sem grupo" },
  pickerUnassignedShort: { en: "misc", pt: "div" },
  pickerWorkspaces: { en: "Workspaces", pt: "Áreas de trabalho" },
  pickerSessions: { en: "Sessions", pt: "Sessões" },
  pickerPrev: { en: "Previous", pt: "Anterior" },
  pickerNext: { en: "Next", pt: "Próxima" },
  pickerOpBar: { en: "Paging and close", pt: "Paginação e fechar" },
  logExport: { en: "Export log", pt: "Exportar log" },
  logCopyPath: { en: "Copy path", pt: "Copiar caminho" },
  logClear: { en: "Clear log", pt: "Limpar log" },
  logClearConfirm: { en: "Confirm clear", pt: "Confirmar limpeza" },
  logClearAsk: { en: "Click \"Confirm clear\" again to delete log files from before today — including any evidence you are collecting.", pt: "Clique em \"Confirmar limpeza\" de novo para excluir os arquivos de log de antes de hoje — inclusive qualquer evidência que você esteja coletando." },
  logSwitchOn: { en: "Logging enabled (info and debug are recorded too).", pt: "Registro ativado (info e debug também são gravados)." },
  logSwitchOff: { en: "Logging disabled: errors, warnings and key traces (startup, panel open, …) are still recorded.", pt: "Registro desativado: erros, avisos e rastros principais (inicialização, abertura do painel, …) ainda são gravados." },
  logSwitchFail: { en: "Switch not saved, previous value kept: ", pt: "Interruptor não salvo, valor anterior mantido: " },
  logExportSaved: { en: "Exported to your downloads: ", pt: "Exportado para seus downloads: " },
  logExportDownloadBlocked: { en: "The browser blocked the download — use \"Copy text\" instead: ", pt: "O navegador bloqueou o download — use \"Copiar texto\" em vez disso: " },
  logExportEmpty: { en: "No log file for today yet (with the switch off, only errors, warnings and key traces are written).", pt: "Ainda não há arquivo de log de hoje (com o interruptor desligado, só erros, avisos e rastros principais são gravados)." },
  logExportFail: { en: "Export failed: ", pt: "Falha na exportação: " },
  logPathCopied: { en: "Log file path copied: ", pt: "Caminho do arquivo de log copiado: " },
  logPathFail: { en: "Could not resolve the log path — use \"Export log\" instead.", pt: "Não foi possível resolver o caminho do log — use \"Exportar log\" em vez disso." },
  logClearOk: { en: "Deleted past log files: ", pt: "Arquivos de log antigos excluídos: " },
  logClearNone: { en: "No past log files to delete (today's file is kept).", pt: "Não há arquivos de log antigos para excluir (o de hoje é mantido)." },
  logClearFail: { en: "Clear failed, please try again.", pt: "Falha ao limpar, tente de novo." },
  logWorking: { en: "Working…", pt: "Processando…" },
  logDropped: { en: "Entries dropped by the log pipeline: ", pt: "Entradas descartadas pelo pipeline de log: " },
  logUnavailable: { en: "Logging is currently unavailable (host not reachable).", pt: "Registro indisponível no momento (host inacessível)." },
  logBytes: { en: "bytes", pt: "bytes" },
  // #141 P2：导出回执里字节数的括法（zh 全角括号 / en 半角括号）
  bytesParen: { en: "({v})", pt: "({v})" },
  logFiles: { en: "file(s)", pt: "arquivo(s)" },
  logReasonHost: { en: "host unreachable", pt: "host inacessível" },
  logReasonRejected: { en: "host rejected the write", pt: "host rejeitou a gravação" },
  logReasonTimeout: { en: "host timed out", pt: "host expirou o tempo" },
  logReasonStale: { en: "a newer switch action superseded this one", pt: "uma ação de interruptor mais recente substituiu esta" },
  logReasonOther: { en: "unknown reason", pt: "motivo desconhecido" },
  // #123 遥控输入镜 + 模型休眠（承 121/122 定稿；双层文案 b主+a次，恒disabled）
  remoteInputKey: { en: "Remote input (live mirror)", pt: "Entrada remota (espelho ao vivo)" },
  remoteInputTitle: { en: "✎ Remote input", pt: "✎ Entrada remota" },
  remoteInputSub: { en: "Live mirror · auto-syncs current draft", pt: "Espelho ao vivo · sincroniza automaticamente o rascunho atual" },
  remoteInputPh: { en: "Type here… auto-syncs to current input (debounced serial setDraft)", pt: "Digite aqui… sincroniza automaticamente com a entrada atual (setDraft serial com debounce)" },
  remoteInputSend: { en: "➤ Send (disabled)", pt: "➤ Enviar (desativado)" },
  remoteInputSendTitle: { en: "No host submit surface", pt: "Sem superfície de envio no host" },
  remoteInputExplicitMain: { en: "Draft synced — send from the big screen", pt: "Rascunho sincronizado — envie pela tela grande" },
  remoteInputExplicitSub: { en: "No host submit surface; this key stays disabled, never fakes Enter.", pt: "Sem superfície de envio no host; esta tecla permanece desativada e nunca simula Enter." },
  remoteInputStale: { en: "Session switched; writes paused to avoid cross-talk. Reopen.", pt: "Sessão trocada; gravações pausadas para evitar cruzamento. Reabra." },
  remoteInputMeta: { en: "Live mirror · 300ms debounced serial · session check · IME deferred", pt: "Espelho ao vivo · serial com debounce de 300ms · checagem de sessão · IME adiado" },
  remoteInputChars: { en: "{n} chars", pt: "{n} caracteres" },
  remoteModelKey: { en: "Model switch (dormant)", pt: "Troca de modelo (inativa)" },
  remoteModelTitle: { en: "▤ Model switch", pt: "▤ Troca de modelo" },
  remoteModelEmpty: { en: "No host model surface yet (first appearance shows once)", pt: "Ainda sem superfície de modelo no host (a primeira aparição mostra uma vez)" },
}
