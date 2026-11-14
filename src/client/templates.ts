/**
 * 共享类型家 PromptTemplate + 24 预制数据（#171 N6：可 import 者 —— label-identity、prompt-trigger、smart-score、template-browser、template-library）。
 * 跑浏览器 bundle 线；禁被 src/update/host 进口（DO-NOT-IMPORT），禁跨运行时进口。
 */
/**
 * dsh-prompt — 模板数据层
 * 24 条预制模板（#6 final.md 定稿，冒号表单式）+ 类型定义。
 * #23 统一标签：模板统一携带 labels；预制 labels 为领域+阶段+动作机械合并
 * （#19 R2 附录逐条回填，与派生公式一致，回归脚本逐条锁定）；旧 domain/stage/action
 * 保留为只读镜像（回滚对照），不再参与筛选与展示。
 */

export type Domain = '思考框架' | '学习' | '工程' | '执行'
export type Stage = '执行前' | '执行中' | '执行后' // #31：“任意”彻底移除（幽灵值清洗）

export interface PromptTemplate {
  id: string
  name: string
  nameEn: string
  /** Portuguese display name (fork); optional on customs. */
  namePt?: string
  /** 旧三件套（#23 起废弃：只读镜像，回滚对照；筛选展示一律走 labels） */
  domain?: Domain
  stage?: Stage
  action?: string[]
  /** 统一标签（#23；旧数据缺失时由 templateLabels() 读时回落） */
  labels?: string[]
  /** 颜色标签（#159）：**原始存储值**（六位 hex，用户数据）。
   *  缺键／带外／非法都表示「未选颜色」——消费颜色一律走 store 的 inkColorOf()，
   *  它负责读侧回落；直接读本字段会拿到未经回落的值。 */
  color?: string
  /** 文字描边开关（#162）：**只有 `false` 有意义**（用户明确关掉描边），缺键＝开。
   *  未选颜色时这个键不该存在（无颜色＝无描边，用户口径）；消费一律走 store 的 inkOutlineOf()。 */
  outline?: boolean
  /** Canonical body (presets historically Chinese; customs = user text). */
  body: string
  /** English body for presets (fork); customs omit. */
  bodyEn?: string
  /** Portuguese body for presets (fork); customs omit. */
  bodyPt?: string
  builtin: boolean
}

export const PRESET_TEMPLATES: PromptTemplate[] = [
  { id: 'fp', name: '第一性原理拆解', nameEn: 'First Principles', namePt: 'Primeiros Princípios', domain: '思考框架', stage: '执行前', action: ['拆解'], labels: ['思考框架', '执行前', '拆解'], builtin: true, body: [
    '请用第一性原理分析以下主题，按编号结构化输出，结论先行：',
    '1. 这个问题的基本组成单元是什么？',
    '2. 哪些是真正不可改变的真理（而非假设）？',
    '3. 如果去掉所有既有假设，问题本身还剩下什么？',
    '4. 有哪些被大多数人默认为常识、但其实可以颠覆的？',
    '5. 基于以上推演给出你的原创见解，并说明它与主流看法的差异。',
    '主题：',
  ].join('\n'),
    bodyEn: "Analyze the following topic using first principles. Structure your output by number, lead with the conclusion:\n1. What are the fundamental building blocks of this problem?\n2. Which truths are truly immutable (as opposed to assumptions)?\n3. If we strip away all existing assumptions, what remains of the problem itself?\n4. What do most people treat as common sense that can actually be overturned?\n5. Based on the above reasoning, give your original insight and explain how it differs from the mainstream view.\nTopic:",
    bodyPt: "Analise o tema a seguir com primeiros princípios, em saída estruturada numerada, conclusão primeiro:\n1. Quais são as unidades básicas que compõem este problema?\n2. Quais são as verdades realmente imutáveis (e não meras hipóteses)?\n3. Se removermos todas as hipóteses existentes, o que resta do problema em si?\n4. O que a maioria das pessoas trata como senso comum, mas que na verdade pode ser questionado?\n5. Com base nesta dedução, apresente sua visão original e explique em que ela difere da opinião dominante.\nTema:" },
  { id: 'socratic', name: '苏格拉底式追问', nameEn: 'Socratic Questioning', namePt: 'Questionamento Socrático', domain: '思考框架', stage: '执行前', action: ['检验'], labels: ['思考框架', '执行前', '检验'], builtin: true, body: [
    '请用苏格拉底式追问帮助我思考，按编号结构化输出：',
    '1. 先复述我当前的观点或核心假设；',
    '2. 提出 3 个最有力的质疑；',
    '3. 找出一个我尚未考虑到的视角；',
    '4. 如果你是深思熟虑的对话者，你会问我哪几个我没想到的问题？',
    '5. 追问结束后，把整个过程浓缩成一个更精准的问题。',
    '主题：',
  ].join('\n'),
    bodyEn: "Help me think through this with Socratic questioning. Structure your output by number:\n1. First restate my current view or core assumption;\n2. Raise the 3 strongest challenges;\n3. Identify one perspective I have not yet considered;\n4. If you were a thoughtful interlocutor, which questions would you ask that I have not thought of?\n5. After the questioning, distill the whole process into one more precise question.\nTopic:",
    bodyPt: "Use o questionamento socrático para me ajudar a pensar, em saída estruturada numerada:\n1. Primeiro, reformule meu ponto de vista atual ou hipótese central;\n2. Formule 3 questionamentos mais fortes;\n3. Identifique uma perspectiva que eu ainda não considerei;\n4. Se você fosse um interlocutor reflexivo, quais perguntas eu ainda não pensei você me faria?\n5. Ao final do questionamento, condense todo o processo em uma pergunta mais precisa.\nTema:" },
  { id: 'deep', name: '深度多维分析', nameEn: 'Deep Analysis', namePt: 'Análise Profunda', domain: '思考框架', stage: '执行前', action: ['归因'], labels: ['思考框架', '执行前', '归因'], builtin: true, body: [
    '请从多个维度深度分析以下主题，按编号结构化输出，结论先行：',
    '1. 本质是什么？',
    '2. 有哪些常见的误解？',
    '3. 支持和反对的证据分别是什么？',
    '4. 这个问题的边界在哪里（什么情况下它不再成立）？',
    '5. 如果你必须做出一个判断，会是什么？',
    '6. 你最强的那个结论，弱点在哪里？',
    '主题：',
  ].join('\n'),
    bodyEn: "Analyze the following topic in depth from multiple angles. Structure your output by number, lead with the conclusion:\n1. What is its essence?\n2. What are common misconceptions?\n3. What evidence supports and opposes it?\n4. Where are the boundaries of this issue (under what conditions does it no longer hold)?\n5. If you had to make a judgment, what would it be?\n6. What is the weakness of your strongest conclusion?\nTopic:",
    bodyPt: "Analise em profundidade o tema a seguir sob várias dimensões, em saída estruturada numerada, conclusão primeiro:\n1. Qual é a essência?\n2. Quais são os equívocos comuns?\n3. Quais são as evidências a favor e contra?\n4. Onde está o limite deste problema (em que circunstâncias ele deixa de se sustentar)?\n5. Se você tivesse de emitir um julgamento, qual seria?\n6. Qual é o ponto fraco da sua conclusão mais forte?\nTema:" },
  { id: 'adversarial', name: '对抗式审查', nameEn: 'Adversarial Review', namePt: 'Revisão Adversarial', domain: '思考框架', stage: '执行前', action: ['检验'], labels: ['思考框架', '执行前', '检验'], builtin: true, body: [
    '请对以下方案/结论做对抗式审查（红队角色），先给一段结论摘要，再按编号展开：',
    '1. 找出其中最强的 5 个假设，逐一论证它们可能如何失效；',
    '2. 构造最可能推翻它的 3 个反例或失败场景；',
    '3. 指出其中隐藏的认知偏差与利益相关方视角的盲区；',
    '4. 给出「如果这个方案失败，最可能的原因是什么」的排序清单；',
    '5. 最后给出：在何种条件下你才会认为它是错的——以及何种证据能让你改变立场。',
    '方案 / 结论：',
  ].join('\n'),
    bodyEn: "Perform an adversarial review (red-team role) of the following proposal/conclusion. First give a short conclusion summary, then expand by number:\n1. Identify its 5 strongest assumptions and argue one by one how each could fail;\n2. Construct the 3 counterexamples or failure scenarios most likely to overturn it;\n3. Point out hidden cognitive biases and blind spots from stakeholder perspectives;\n4. Provide a ranked list of \"if this proposal fails, what are the most likely reasons\";\n5. Finally state: under what conditions you would consider it wrong—and what evidence would change your stance.\nProposal / conclusion:",
    bodyPt: "Faça uma revisão adversarial (papel de red team) da proposta/conclusão a seguir: comece com um resumo da conclusão e depois desenvolva numerado:\n1. Identifique as 5 hipóteses mais fortes e, uma a uma, argumente como cada uma pode falhar;\n2. Construa os 3 contraexemplos ou cenários de falha mais capazes de derrubá-la;\n3. Aponte vieses cognitivos ocultos e pontos cegos na perspectiva das partes interessadas;\n4. Apresente uma lista ordenada de «se esta proposta falhar, quais são as causas mais prováveis»;\n5. Por fim, indique: sob quais condições você a consideraria errada — e que evidência faria você mudar de posição.\nProposta / conclusão:" },
  { id: 'decision', name: '决策博弈分析', nameEn: 'Decision Analysis', namePt: 'Análise de Decisão', domain: '思考框架', stage: '执行前', action: ['决策'], labels: ['思考框架', '执行前', '决策'], builtin: true, body: [
    '你是一位冷静的决策分析师。请分析我的处境，按编号结构化输出（你的选择仅作参考，重点是分析过程）：',
    '1. 列出每个选项最坏的结果是什么；',
    '2. 每个选项最好的结果是什么；',
    '3. 最可能的结果是什么；',
    '4. 如果 10 年后回头看，我可能会后悔什么；',
    '5. 有没有哪条路是「没有回头路」的；',
    '6. 给出你本人的选择并说明理由；再指出我可能忽略的第三个选项。',
    '我的处境（选项与背景）：',
  ].join('\n'),
    bodyEn: "You are a calm decision analyst. Analyze my situation and structure your output by number (your choice is for reference only; the analysis process is what matters):\n1. List the worst outcome for each option;\n2. What is the best outcome for each option;\n3. What is the most likely outcome;\n4. If I look back in 10 years, what might I regret;\n5. Is there any path that is \"no turning back\";\n6. Give your own choice and reasons; then point out a third option I may have overlooked.\nMy situation (options and context):",
    bodyPt: "Você é um analista de decisões frio e objetivo. Analise minha situação em saída estruturada numerada (sua escolha é apenas referência; o foco é o processo de análise):\n1. Liste o pior resultado de cada opção;\n2. Qual é o melhor resultado de cada opção;\n3. Qual é o resultado mais provável;\n4. Se eu olhar para trás daqui a 10 anos, do que eu poderia me arrepender;\n5. Há algum caminho sem volta;\n6. Apresente sua própria escolha e justifique; em seguida, aponte uma terceira opção que eu possa estar ignorando.\nMinha situação (opções e contexto):" },
  { id: 'premortem', name: '事前验尸', nameEn: 'Pre-mortem', namePt: 'Pré-mortem', domain: '思考框架', stage: '执行前', action: ['决策'], labels: ['思考框架', '执行前', '决策'], builtin: true, body: [
    '假设以下方案/项目已经在一年后彻底失败。请以「事后回溯」的方式写失败分析，按编号结构化输出：',
    '1. 按可能性从高到低列出 8 个失败原因；',
    '2. 对前 3 个原因，给出现在就能做的预防措施；',
    '3. 指出哪些早期信号现在就该监控；',
    '4. 最后说明：这个方案是否从一开始就有致命缺陷。',
    '方案描述：',
  ].join('\n'),
    bodyEn: "Assume the following proposal/project has already failed completely one year from now. Write a failure analysis as a \"postmortem\" and structure your output by number:\n1. List 8 failure reasons from most to least likely;\n2. For the top 3 reasons, give preventive measures that can be taken now;\n3. Point out which early signals should be monitored starting now;\n4. Finally state: whether this proposal had a fatal flaw from the start.\nProposal description:",
    bodyPt: "Suponha que a proposta/projeto a seguir tenha fracassado por completo após um ano. Escreva a análise de falha no modo «retrospectiva», em saída estruturada numerada:\n1. Liste 8 causas de falha, da mais para a menos provável;\n2. Para as 3 primeiras causas, indique medidas preventivas que já se pode tomar agora;\n3. Aponte quais sinais precoces já deveriam ser monitorados agora;\n4. Por fim, diga: esta proposta já tinha um defeito fatal desde o início?\nDescrição da proposta:" },
  { id: 'feynman', name: '费曼技巧', nameEn: 'Feynman Technique', namePt: 'Técnica Feynman', domain: '思考框架', stage: '执行后', action: ['理解'], labels: ['思考框架', '执行后', '理解'], builtin: true, body: [
    '请用费曼技巧确认我是否真正理解了以下概念，按编号结构化输出：',
    '1. 用最简单的语言、面向完全不懂的人解释这个概念（禁止术语）；',
    '2. 给出 2 个生动类比和 2 个反例；',
    '3. 指出我理解中的错误或不准确之处；',
    '4. 设计 3 个判断题检验我是否真的懂了。',
    '概念：',
    '我的理解（可选）：',
  ].join('\n'),
    bodyEn: "Use the Feynman Technique to check whether I truly understand the following concept. Structure your output by number:\n1. Explain this concept in the simplest language for someone who knows nothing about it (no jargon);\n2. Give 2 vivid analogies and 2 counterexamples;\n3. Point out errors or inaccuracies in my understanding;\n4. Design 3 true/false questions to test whether I really get it.\nConcept:\nMy understanding (optional):",
    bodyPt: "Use a técnica de Feynman para verificar se eu realmente entendi o conceito a seguir, em saída estruturada numerada:\n1. Explique o conceito na linguagem mais simples possível, para alguém que não sabe nada do assunto (proibido jargão);\n2. Dê 2 analogias vívidas e 2 contraexemplos;\n3. Aponte erros ou imprecisões na minha compreensão;\n4. Elabore 3 questões de verdadeiro/falso para testar se eu realmente entendi.\nConceito:\nMinha compreensão (opcional):" },
  { id: 'fivewhys', name: '五个为什么', nameEn: 'Five Whys', namePt: 'Cinco Porquês', domain: '思考框架', stage: '执行中', action: ['归因'], labels: ['思考框架', '执行中', '归因'], builtin: true, body: [
    '针对以下问题，请连续追问五个「为什么」，每层基于上一层的事实回答，最后区分根本原因与表层触发因素并给出解决方向：',
    '问题描述：',
  ].join('\n'),
    bodyEn: "For the following problem, ask \"why\" five times in succession. Base each layer on the factual answer from the previous layer. Finally distinguish root causes from surface triggers and give a direction for resolution:\nProblem description:",
    bodyPt: "Para o problema a seguir, faça cinco «porquês» em sequência; cada camada deve se basear na resposta factual da anterior; ao final, distinga a causa raiz dos gatilhos superficiais e indique a direção da solução:\nDescrição do problema:" },
  { id: 'mece', name: 'MECE 拆解', nameEn: 'MECE Decomposition', namePt: 'Decomposição MECE', domain: '思考框架', stage: '执行前', action: ['拆解'], labels: ['思考框架', '执行前', '拆解'], builtin: true, body: [
    '请用 MECE 原则拆解以下问题，按编号结构化输出：',
    '1. 给出 3~6 个相互独立（Mutually Exclusive）的分类维度；',
    '2. 每个维度下列出所有子项，确保完全穷尽（Collectively Exhaustive）；',
    '3. 指出拆解中可能的遗漏与重叠；',
    '4. 给出按重要性排序后的关键子问题清单。',
    '问题：',
  ].join('\n'),
    bodyEn: "Decompose the following problem using the MECE principle. Structure your output by number:\n1. Give 3–6 mutually exclusive classification dimensions;\n2. Under each dimension, list all sub-items and ensure they are collectively exhaustive;\n3. Point out possible gaps and overlaps in the decomposition;\n4. Provide a list of key sub-problems ranked by importance.\nProblem:",
    bodyPt: "Desmembre o problema a seguir com o princípio MECE, em saída estruturada numerada:\n1. Apresente de 3 a 6 dimensões de classificação mutuamente exclusivas (Mutually Exclusive);\n2. Em cada dimensão, liste todos os subitens, garantindo esgotamento coletivo (Collectively Exhaustive);\n3. Aponte possíveis omissões e sobreposições na decomposição;\n4. Apresente a lista de subproblemas-chave ordenados por importância.\nProblema:" },
  { id: 'bias', name: '认知偏差检查', nameEn: 'Cognitive Bias Check', namePt: 'Viés Cognitivo', domain: '思考框架', stage: '执行前', action: ['检验'], labels: ['思考框架', '执行前', '检验'], builtin: true, body: [
    '请审查以下推理/计划/结论中的认知偏差，按编号结构化输出：',
    '1. 列出可能影响它的偏差（确认偏误、沉没成本、可得性、锚定、乐观/悲观偏差、群体思维等），并指出具体证据；',
    '2. 对每条偏差，给出「如何检验是否真的受影响」的方法；',
    '3. 给出一个反事实检验：如果结论被证明是错的，最可能因为哪条偏差？',
    '推理 / 计划 / 结论：',
  ].join('\n'),
    bodyEn: "Review the cognitive biases in the following reasoning/plan/conclusion. Structure your output by number:\n1. List biases that may affect it (confirmation bias, sunk cost, availability, anchoring, optimism/pessimism bias, groupthink, etc.) and point to specific evidence;\n2. For each bias, give a method for \"how to test whether it is truly affecting us\";\n3. Give a counterfactual test: if the conclusion proved wrong, which bias would most likely be the cause?\nReasoning / plan / conclusion:",
    bodyPt: "Examine os vieses cognitivos no raciocínio/plano/conclusão a seguir, em saída estruturada numerada:\n1. Liste os vieses que podem estar influenciando (viés de confirmação, custo afundado, disponibilidade, ancoragem, viés otimista/pessimista, pensamento de grupo etc.) e aponte evidências concretas;\n2. Para cada viés, indique um método de «como testar se realmente está sendo afetado»;\n3. Apresente um teste contrafactual: se a conclusão se provar errada, qual viés seria a causa mais provável?\nRaciocínio / plano / conclusão:" },
  { id: 'learnpath', name: '学习路线设计', nameEn: 'Learning Path', namePt: 'Roteiro de Aprendizado', domain: '学习', stage: '执行前', action: ['路线'], labels: ['学习', '执行前', '路线'], builtin: true, body: [
    '请为以下领域/技能设计一条从零到可实战的学习路线，按编号结构化输出：',
    '1. 按阶段拆分（入门→进阶→实战），每个阶段给出学习目标；',
    '2. 每个阶段推荐 2~3 个核心主题和练习方式；',
    '3. 指出常见的「伪学习陷阱」（只收藏不练习等）；',
    '4. 给出一个 30 天内可完成的最小闭环，以及检验掌握程度的基准。',
    '领域 / 技能：',
    '当前水平（可选）：',
    '目标（可选）：',
  ].join('\n'),
    bodyEn: "Design a learning path from zero to practical competence for the following domain/skill. Structure your output by number:\n1. Break it into stages (beginner → intermediate → practical) with a learning goal for each stage;\n2. For each stage, recommend 2–3 core topics and practice methods;\n3. Point out common \"pseudo-learning traps\" (bookmarking without practicing, etc.);\n4. Give a minimal closed loop that can be completed in 30 days, plus a benchmark for checking mastery.\nDomain / skill:\nCurrent level (optional):\nGoal (optional):",
    bodyPt: "Desenhe um roteiro de aprendizado do zero até a prática aplicável para o domínio/habilidade a seguir, em saída estruturada numerada:\n1. Divida por etapas (iniciante→intermediário→prática), com objetivos de aprendizado em cada etapa;\n2. Em cada etapa, recomende 2~3 temas centrais e formas de prática;\n3. Aponte armadilhas comuns de «pseudoaprendizado» (só salvar e não praticar etc.);\n4. Apresente um ciclo mínimo concluível em 30 dias e critérios para verificar o domínio.\nDomínio / habilidade:\nNível atual (opcional):\nObjetivo (opcional):" },
  { id: 'concept', name: '概念澄清', nameEn: 'Concept Clarification', namePt: 'Clarificação de Conceito', domain: '学习', stage: '执行前', action: ['概念'], labels: ['学习', '执行前', '概念'], builtin: true, body: [
    '请帮我彻底理解以下概念，按编号结构化输出：',
    '1. 一句话定义 + 一个最小例子；',
    '2. 它与常见相近概念的本质区别（各给一个对比场景）；',
    '3. 这个概念在什么情况下不适用（边界）；',
    '4. 给出 3 个由浅入深的练习场景让我检验理解。',
    '概念：',
    '相近概念（可选，不知道可留空，AI 自行选常见相近概念对比）：',
  ].join('\n'),
    bodyEn: "Help me thoroughly understand the following concept. Structure your output by number:\n1. A one-sentence definition + one minimal example;\n2. Its essential differences from common related concepts (give one contrast scenario for each);\n3. When this concept does not apply (boundaries);\n4. Give 3 practice scenarios from shallow to deep so I can check my understanding.\nConcept:\nRelated concepts (optional; leave blank if unsure—the AI will pick common related concepts for comparison):",
    bodyPt: "Ajude-me a compreender de forma completa o conceito a seguir, em saída estruturada numerada:\n1. Definição em uma frase + um exemplo mínimo;\n2. Diferença essencial em relação a conceitos próximos comuns (dê um cenário de comparação para cada um);\n3. Em que situações este conceito não se aplica (limites);\n4. Apresente 3 cenários de exercício, do mais simples ao mais avançado, para eu testar a compreensão.\nConceito:\nConceitos próximos (opcional; se não souber, deixe em branco — a IA escolherá conceitos próximos comuns para comparar):" },
  { id: 'quiz', name: 'AI 反向考验', nameEn: 'AI Quiz', namePt: 'Quiz de IA', domain: '学习', stage: '执行后', action: ['考验'], labels: ['学习', '执行后', '考验'], builtin: true, body: [
    '请通过出题检验我是否真正理解了以下主题/交付内容：',
    '1. 设计选择题/判断题/简答题/案例题（由浅入深）；',
    '2. 我作答后指出错误与盲区；',
    '3. 直到回答正确、知识点无盲区后再确认交付。',
    '主题 / 交付内容：',
  ].join('\n'),
    bodyEn: "Please quiz me to verify that I truly understand the following topic / deliverable:\n1. Design multiple-choice / true-false / short-answer / case questions (from easy to hard);\n2. After I answer, point out mistakes and blind spots;\n3. Confirm the deliverable only once my answers are correct and there are no remaining knowledge gaps.\nTopic / deliverable:",
    bodyPt: "Por favor, avalie se eu realmente entendi o tema/conteúdo a entregar a seguir, elaborando perguntas:\n1. Crie questões de múltipla escolha / verdadeiro ou falso / dissertativas / estudos de caso (do mais simples ao mais avançado);\n2. Após eu responder, aponte erros e pontos cegos;\n3. Só confirme a entrega quando as respostas estiverem corretas e não houver lacunas no conhecimento.\nTema / Conteúdo a entregar:" },
  { id: 'codereview', name: '代码审查', nameEn: 'Code Review', namePt: 'Revisão de Código', domain: '工程', stage: '执行前', action: ['审查'], labels: ['工程', '执行前', '审查'], builtin: true, body: [
    '请审查以下代码，先给总体结论，再按严重程度排序输出，每个问题附具体修改建议（含示例代码）：',
    '1. 正确性：潜在 bug、边界条件、并发/异步问题；',
    '2. 安全：注入、鉴权、敏感信息、依赖风险；',
    '3. 可维护性：命名、结构、重复、可读性；',
    '4. 性能：明显的低效点。',
    '代码过长时可分段审查，但最终汇总为一页结论。',
    '代码 / 文件 / 技术栈：',
  ].join('\n'),
    bodyEn: "Please review the following code. Start with an overall conclusion, then list issues by severity, and for each issue include a concrete fix suggestion (with sample code):\n1. Correctness: potential bugs, edge cases, concurrency/async issues;\n2. Security: injection, auth, sensitive data, dependency risks;\n3. Maintainability: naming, structure, duplication, readability;\n4. Performance: clear inefficiencies.\nIf the code is long, review in sections, but summarize into a one-page conclusion at the end.\nCode / file / tech stack:",
    bodyPt: "Por favor, revise o código a seguir: comece com uma conclusão geral e, em seguida, liste os problemas por gravidade, com sugestões concretas de correção (incluindo exemplos de código) para cada um:\n1. Correção: bugs potenciais, casos de borda, problemas de concorrência/assíncronos;\n2. Segurança: injeção, autenticação/autorização, informações sensíveis, riscos de dependências;\n3. Manutenibilidade: nomenclatura, estrutura, duplicação, legibilidade;\n4. Performance: pontos claramente ineficientes.\nSe o código for longo demais, revise por partes, mas consolide tudo em uma conclusão de uma página ao final.\nCódigo / Arquivo / Stack:" },
  { id: 'testdesign', name: '测试用例设计', nameEn: 'Test Design', namePt: 'Design de Testes', domain: '工程', stage: '执行中', action: ['测试'], labels: ['工程', '执行中', '测试'], builtin: true, body: [
    '请为以下功能设计测试用例，按编号结构化输出：',
    '1. 正常路径用例（含输入/预期输出）；',
    '2. 边界与极端值用例；',
    '3. 异常与错误处理用例；',
    '4. 并发/重复/幂等场景（如适用）；',
    '5. 指出哪些用例最容易漏、以及对应的风险。',
    '功能描述：',
  ].join('\n'),
    bodyEn: "Please design test cases for the following feature, structured and numbered:\n1. Happy-path cases (with inputs / expected outputs);\n2. Boundary and extreme-value cases;\n3. Exception and error-handling cases;\n4. Concurrency / replay / idempotency scenarios (if applicable);\n5. Call out which cases are most often missed and the risks they cover.\nFeature description:",
    bodyPt: "Por favor, projete casos de teste para a funcionalidade a seguir, com saída estruturada e numerada:\n1. Casos de caminho feliz (incluindo entrada/saída esperada);\n2. Casos de borda e valores extremos;\n3. Casos de exceção e tratamento de erros;\n4. Cenários de concorrência / repetição / idempotência (quando aplicável);\n5. Indique quais casos têm mais chance de serem esquecidos e o risco correspondente.\nDescrição da funcionalidade:" },
  { id: 'refactor', name: '重构方案', nameEn: 'Refactoring Plan', namePt: 'Plano de Refatoração', domain: '工程', stage: '执行中', action: ['重构'], labels: ['工程', '执行中', '重构'], builtin: true, body: [
    '请为以下代码提出重构方案，按编号结构化输出：',
    '1. 指出当前结构的主要问题（职责、耦合、可测试性）；',
    '2. 给出目标结构（抽象与拆分建议，含示例）；',
    '3. 按「小步重构」顺序列出步骤，每一步可独立提交且行为不变；',
    '4. 指出哪些重构有风险、需要测试保护。',
    '代码 / 模块：',
  ].join('\n'),
    bodyEn: "Please propose a refactoring plan for the following code, structured and numbered:\n1. Identify the main structural problems (responsibilities, coupling, testability);\n2. Describe the target structure (abstraction and split suggestions, with examples);\n3. List steps in a \"small-step refactor\" order—each step independently committable with unchanged behavior;\n4. Call out which refactors are risky and need test coverage.\nCode / module:",
    bodyPt: "Por favor, proponha um plano de refatoração para o código a seguir, com saída estruturada e numerada:\n1. Aponte os principais problemas da estrutura atual (responsabilidades, acoplamento, testabilidade);\n2. Apresente a estrutura-alvo (sugestões de abstração e divisão, com exemplos);\n3. Liste os passos em ordem de \"refatoração em passos pequenos\", cada um podendo ser commitado isoladamente sem alterar o comportamento;\n4. Indique quais refatorações têm risco e precisam de cobertura de testes.\nCódigo / Módulo:" },
  { id: 'explain', name: '解释代码', nameEn: 'Explain Code', namePt: 'Explicar Código', domain: '工程', stage: '执行中', action: ['解读'], labels: ['工程', '执行中', '解读'], builtin: true, body: [
    '请解释以下代码，按编号结构化输出：',
    '1. 这段代码做什么（一句话）；',
    '2. 逐段讲解执行流程与关键数据结构；',
    '3. 指出其中「为什么这样写」的设计取舍；',
    '4. 指出潜在问题与改进点；',
    '5. 用一句话概括它在我更大的系统里扮演的角色。',
    '代码：',
  ].join('\n'),
    bodyEn: "Please explain the following code, structured and numbered:\n1. What this code does (one sentence);\n2. Walk through the execution flow and key data structures section by section;\n3. Call out the design trade-offs behind \"why it's written this way\";\n4. Point out potential problems and improvements;\n5. In one sentence, summarize its role in my larger system.\nCode:",
    bodyPt: "Por favor, explique o código a seguir, com saída estruturada e numerada:\n1. O que este código faz (em uma frase);\n2. Explique trecho a trecho o fluxo de execução e as estruturas de dados principais;\n3. Aponte as escolhas de design — o \"porquê foi escrito assim\";\n4. Indique problemas potenciais e pontos de melhoria;\n5. Resuma em uma frase o papel que ele desempenha no meu sistema maior.\nCódigo:" },
  { id: 'blindspot', name: '盲区检查', nameEn: 'Blind Spot Pass', namePt: 'Ponto Cego', domain: '执行', stage: '执行前', action: ['启动'], labels: ['执行', '执行前', '启动'], builtin: true, body: [
    '在我开始以下任务之前，请帮我做一次盲区检查，按编号结构化输出：',
    '1. 我可能遗漏的关键变量有哪些？',
    '2. 潜在的风险与最容易忽略的影响因素？',
    '3. 哪些点需要提前决策、哪些可以后置？',
    '4. 给我一个 3 分钟内可完成的快速检查清单。',
    '我的计划（目标 / 约束）：',
  ].join('\n'),
    bodyEn: "Before I start the following task, please run a blind-spot check, structured and numbered:\n1. What key variables might I be missing?\n2. What are the potential risks and the easiest-to-overlook factors?\n3. What needs to be decided up front, and what can wait?\n4. Give me a quick checklist I can finish in 3 minutes.\nMy plan (goal / constraints):",
    bodyPt: "Antes de eu começar a tarefa a seguir, faça uma checagem de pontos cegos, com saída estruturada e numerada:\n1. Quais variáveis-chave eu posso estar deixando de lado?\n2. Quais são os riscos potenciais e os fatores de influência mais fáceis de ignorar?\n3. Quais pontos precisam de decisão antecipada e quais podem ficar para depois?\n4. Me dê uma checklist rápida que eu consiga completar em 3 minutos.\nMeu plano (objetivo / restrições):" },
  { id: 'snapshot', name: '零丢失快照', nameEn: 'Zero-loss Snapshot', namePt: 'Snapshot Sem Perda', domain: '执行', stage: '执行中', action: ['固化'], labels: ['执行', '执行中', '固化'], builtin: true, body: [
    '请执行一次「零丢失快照」：',
    '1. 把我们从会话开始至今的关键信息，按「目的地 / 约束与偏好 / 已确认的决定 / 待决问题 / 雾区（隐约可见但还不清晰）」五类逐条列出——不压缩、不合并，宁可啰嗦不可省略；',
    '2. 每条标注出处（引用我原话）；',
    '3. 单独列一节「可疑遗漏」：凡是我提过但你觉得与主线无关、太模糊或像执行细节而没纳入的，全部摆出并写明理由；',
    '4. 列完后停下等我逐条核对，确认后再落盘。',
  ].join('\n'),
    bodyEn: "Please run a \"zero-loss snapshot\":\n1. List every key item from the start of this session through now under these five categories—\"destination / constraints & preferences / confirmed decisions / open questions / fog (vaguely visible but not yet clear)\"—do not compress or merge; prefer verbosity over omission;\n2. Annotate each item with its source (quote my original words);\n3. Add a separate section \"suspected omissions\": anything I mentioned that you left out because it seemed off-topic, too vague, or like execution detail—list it all and explain why;\n4. After listing, stop and wait for me to verify item by item; only persist after I confirm.",
    bodyPt: "Por favor, execute um \"snapshot sem perdas\":\n1. Liste todas as informações-chave da nossa conversa desde o início, item a item, nas cinco categorias \"destino / restrições e preferências / decisões confirmadas / questões pendentes / zona de névoa (visível de forma vaga, mas ainda pouco clara)\" — sem comprimir nem mesclar; prefira ser verboso a omitir;\n2. Marque a origem de cada item (citando minhas palavras originais);\n3. Inclua uma seção separada \"possíveis omissões\": tudo o que eu mencionei, mas que você considerou irrelevante para a linha principal, demasiado vago ou detalhe de execução e por isso não incluiu — coloque tudo e explique o motivo;\n4. Depois de listar, pare e aguarde eu conferir item a item; só grave no disco após a confirmação." },
  { id: 'kickoff', name: '任务启动', nameEn: 'Task Kickoff', namePt: 'Início de Tarefa', domain: '执行', stage: '执行前', action: ['启动'], labels: ['执行', '执行前', '启动'], builtin: true, body: [
    '在开始以下任务之前，请先确认起点并澄清细节，按编号结构化输出：',
    '1. 最终目标（要做什么）；',
    '2. 当前进度（目前想到哪一步）；',
    '3. 经验水平（新手 / 有经验 / 专家）；',
    '4. 不熟悉的地方；',
    '5. 成功的标准；',
    '6. 通过提问澄清细节（成功标准之外还有哪些约束、有哪些风险现在就该知道）。',
    '最终目标：',
    '当前进度（可选）：',
    '经验水平（新手 / 有经验 / 专家）：',
    '不熟悉的地方（可选）：',
  ].join('\n'),
    bodyEn: "Before starting the following task, please confirm the starting point and clarify details, structured and numbered:\n1. End goal (what to achieve);\n2. Current progress (where I am so far);\n3. Experience level (beginner / experienced / expert);\n4. Areas I'm unfamiliar with;\n5. Success criteria;\n6. Clarify details by asking questions (constraints beyond success criteria, and risks I should know now).\nEnd goal:\nCurrent progress (optional):\nExperience level (beginner / experienced / expert):\nAreas I'm unfamiliar with (optional):",
    bodyPt: "Antes de começar a tarefa a seguir, confirme o ponto de partida e esclareça os detalhes, com saída estruturada e numerada:\n1. Objetivo final (o que fazer);\n2. Progresso atual (até onde já pensei);\n3. Nível de experiência (iniciante / experiente / especialista);\n4. Pontos com os quais não estou familiarizado;\n5. Critérios de sucesso;\n6. Esclareça detalhes com perguntas (além dos critérios de sucesso, quais outras restrições existem e quais riscos já deveriam ser conhecidos agora).\nObjetivo final:\nProgresso atual (opcional):\nNível de experiência (iniciante / experiente / especialista):\nPontos pouco familiares (opcional):" },
  { id: 'prototype', name: '原型验证', nameEn: 'Prototype Validate', namePt: 'Validar Protótipo', domain: '执行', stage: '执行前', action: ['启动'], labels: ['执行', '执行前', '启动'], builtin: true, body: [
    '请为以下主题/想法做原型验证，每轮输出保持克制（方向概要即可，不要太长）：',
    '1. 给出 2~4 个方向差距很大的候选方案；',
    '2. 每个方向给出最小的验证方式（怎么快速试错）；',
    '3. 由我选择和反馈，几轮后逐步收敛到满意的方向；',
    '4. 收敛后给出下一步的执行计划要点。',
    '主题 / 想法：',
  ].join('\n'),
    bodyEn: "Please run prototype validation for the following topic/idea. Keep each round restrained (a brief directional outline is enough—don't go long):\n1. Offer 2–4 candidate approaches that differ substantially in direction;\n2. For each direction, give a minimal validation method (how to fail fast);\n3. I will choose and give feedback; over a few rounds, converge toward a satisfactory direction;\n4. Once converged, outline the key points of the next execution plan.\nTopic / idea:",
    bodyPt: "Por favor, faça uma validação de protótipo para o tema/ideia a seguir; mantenha cada rodada contida (só um resumo de direção, sem alongar):\n1. Apresente 2~4 candidatas com direções bem distintas;\n2. Para cada direção, indique a menor forma de validação (como errar rápido);\n3. Eu escolho e dou feedback; após algumas rodadas, vá convergindo para a direção satisfatória;\n4. Após a convergência, entregue os pontos principais do plano de execução seguinte.\nTema / Ideia:" },
  { id: 'plan', name: '执行计划', nameEn: 'Execution Plan', namePt: 'Plano de Execução', domain: '执行', stage: '执行前', action: ['启动'], labels: ['执行', '执行前', '启动'], builtin: true, body: [
    '请为以下目标制定执行计划，按编号结构化输出（时间安排是可调整的草案）：',
    '1. 明确步骤（含顺序与依赖）；',
    '2. 时间安排（每步预计时长/里程碑）；',
    '3. 所需资源和工具；',
    '4. 交付物和验收标准；',
    '5. 风险和应对方案。',
    '目标：',
    '约束（可选）：',
  ].join('\n'),
    bodyEn: "Please create an execution plan for the following goal, structured and numbered (the schedule is an adjustable draft):\n1. Clear steps (including order and dependencies);\n2. Schedule (estimated duration/milestones per step);\n3. Required resources and tools;\n4. Deliverables and acceptance criteria;\n5. Risks and mitigation plans.\nGoal:\nConstraints (optional):",
    bodyPt: "Por favor, elabore um plano de execução para o objetivo a seguir, com saída estruturada e numerada (o cronograma é um rascunho ajustável):\n1. Passos claros (incluindo ordem e dependências);\n2. Cronograma (duração estimada/marcos de cada passo);\n3. Recursos e ferramentas necessários;\n4. Entregáveis e critérios de aceite;\n5. Riscos e planos de contingência.\nObjetivo:\nRestrições (opcional):" },
  { id: 'deviation', name: '记录偏离', nameEn: 'Deviation Log', namePt: 'Registro de Desvio', domain: '执行', stage: '执行中', action: ['记录'], labels: ['执行', '执行中', '记录'], builtin: true, body: [
    '请担任我的过程记录员（多轮持续角色）：从现在起，在每次交互后更新一份简洁的偏离记录，按编号结构化：',
    '1. 遇到了什么新的情况？',
    '2. 为什么改变了方案？',
    '3. 做了哪些关键决定？',
    '4. 对结果有什么影响？',
    '每次只输出「新增/变更」条目，不要重复已记录内容。',
  ].join('\n'),
    bodyEn: "Please act as my process recorder (a continuing multi-turn role): from now on, after each interaction update a concise deviation log, structured and numbered:\n1. What new situation came up?\n2. Why did the approach change?\n3. What key decisions were made?\n4. What was the impact on the outcome?\nEach time, output only \"new/changed\" entries—do not repeat what was already recorded.",
    bodyPt: "Por favor, atue como meu registrador de processo (papel contínuo em múltiplas rodadas): a partir de agora, após cada interação, atualize um registro conciso de desvios, estruturado e numerado:\n1. Que nova situação surgiu?\n2. Por que o plano mudou?\n3. Quais decisões-chave foram tomadas?\n4. Qual o impacto no resultado?\nEm cada vez, saia apenas com entradas \"novas/alteradas\"; não repita o que já foi registrado." },
  { id: 'retro', name: '过程复盘', nameEn: 'Retrospective', namePt: 'Retrospectiva', domain: '执行', stage: '执行后', action: ['复盘'], labels: ['执行', '执行后', '复盘'], builtin: true, body: [
    '请帮我复盘刚刚完成的以下任务/项目，按编号结构化输出：',
    '1. 整体步骤回顾（实际 vs 计划的差异）；',
    '2. 使用的资料和工具；',
    '3. 遇到的困难；',
    '4. 解决思路与可复用经验；',
    '5. 如果重来一次，哪些地方会做得不同？',
    '任务 / 项目：',
  ].join('\n'),
    bodyEn: "Please help me retrospect on the following task/project just completed, structured and numbered:\n1. Overall step review (actual vs. planned differences);\n2. Materials and tools used;\n3. Difficulties encountered;\n4. Solution approaches and reusable lessons;\n5. If I did it again, what would I do differently?\nTask / project:",
    bodyPt: "Por favor, ajude-me a fazer a retrospectiva da tarefa/projeto que acabei de concluir, com saída estruturada e numerada:\n1. Revisão geral dos passos (diferenças entre o real e o planejado);\n2. Materiais e ferramentas usados;\n3. Dificuldades encontradas;\n4. Abordagens de solução e aprendizados reutilizáveis;\n5. Se fosse refazer, o que faria diferente?\nTarefa / Projeto:" },
]


export function getPresetById(id: string): PromptTemplate | undefined {
  return PRESET_TEMPLATES.find((t) => t.id === id)
}
