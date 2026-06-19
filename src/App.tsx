import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';

type TabKey = 'home' | 'log' | 'meal' | 'graph' | 'move' | 'tips';
type MealType = '朝' | '昼' | '夜' | '間食';
type GraphMetric = 'weight' | 'waist';

type VegetableLevel = '十分' | '普通' | '不足';
type VisceralFatRisk = '低' | '中' | '高';

type MealEstimation = {
  name: string;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  note: string;
  ingredients?: string;
  vegetableLevel?: VegetableLevel;
  visceralFatRisk?: VisceralFatRisk;
  advice?: string[];
  aiAnalyzed?: boolean;
};

type MealRecord = {
  id: string;
  date: string;
  type: MealType;
  photo: string | null;
  estimatedName: string;
  estimatedCalories: number | null;
  manualCalories: string;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
  estimationNote: string;
  memo: string;
  ingredients?: string;
  vegetableLevel?: VegetableLevel;
  visceralFatRisk?: VisceralFatRisk;
  advice?: string[];
  aiAnalyzed?: boolean;
};

type MealEditDraft = {
  id: string;
  type: MealType;
  estimatedName: string;
  manualCalories: string;
  protein: string;
  fat: string;
  carbs: string;
  memo: string;
  visceralFatRisk: VisceralFatRisk | '';
};

type TodayRecord = {
  date: string;
  weight: string;
  waist: string;
  bodyFat: string;
  bloodPressure: string;
  sleep: string;
  steps: string;
  alcohol: string;
  snack: string;
  bowel: string;
  mood: string;
  memo: string;
};

type ExerciseItem = {
  id: string;
  title: string;
  description: string;
  duration: string;
  checked: boolean;
  level: '初心者向け' | '普通' | 'しっかり';
};

type Knowledge = {
  id: string;
  category: string;
  title: string;
  note: string;
};

const MOCK_ESTIMATIONS = [
  { name: '焼き魚定食', calories: 520, protein: 32, fat: 12, carbs: 68, note: '魚は良質なたんぱく質とDHAが豊富です。内臓脂肪対策に取り入れやすい食材です。' },
  { name: '鶏むね肉の炒め物', calories: 420, protein: 38, fat: 10, carbs: 28, note: '高たんぱく・低脂質で理想的です。野菜を加えるとさらにバランスが良くなります。' },
  { name: '野菜たっぷりスープ', calories: 280, protein: 12, fat: 6, carbs: 40, note: '食物繊維が豊富で腸内環境をサポートします。体が温まる効果も期待できます。' },
  { name: '雑穀ごはん定食', calories: 560, protein: 25, fat: 14, carbs: 78, note: '雑穀は白米より食物繊維が多く、血糖値の急上昇を抑える効果が期待できます。' },
  { name: 'サラダチキン＋野菜', calories: 360, protein: 35, fat: 8, carbs: 32, note: 'たんぱく質が豊富で脂質控えめ。積極的に取り入れたい食事です。' },
  { name: 'パスタ料理', calories: 680, protein: 22, fat: 20, carbs: 98, note: '糖質多めです。量を少なめにするか、野菜やたんぱく質を増やすとバランスが良くなります。' },
  { name: 'ラーメン', calories: 750, protein: 24, fat: 28, carbs: 96, note: '塩分・脂質が高めです。スープを残す、野菜トッピングを増やすなどの工夫がおすすめです。' },
  { name: '定食（魚・野菜中心）', calories: 540, protein: 28, fat: 15, carbs: 72, note: 'バランスの取れた食事です。継続的に取り入れることで生活習慣の改善をサポートできます。' },
  { name: 'おにぎり・サンドイッチ', calories: 480, protein: 16, fat: 12, carbs: 80, note: '糖質中心になりやすいです。たんぱく質や野菜を一緒に取ることを意識しましょう。' },
  { name: '鍋料理', calories: 450, protein: 30, fat: 12, carbs: 52, note: '野菜・たんぱく質がバランスよく取れる理想的な食事です。塩分の取りすぎに注意しましょう。' },
];

const defaultExercises: ExerciseItem[] = [
  { id: 'e1', title: '20分ウォーキング', description: 'ゆったりしたペースで20分歩く。内臓脂肪対策の有酸素運動。', duration: '20分', checked: false, level: '初心者向け' },
  { id: 'e2', title: 'スクワット', description: 'ゆっくり10回×2セット。下半身を動かして代謝を高める。', duration: '10回×2', checked: false, level: '普通' },
  { id: 'e3', title: 'プランク', description: '30秒キープ×2。体幹を支え、腹囲改善をサポート。', duration: '30秒×2', checked: false, level: '普通' },
  { id: 'e4', title: 'ヒップリフト', description: '15回×2セット。お尻と腰まわりを安定させる。', duration: '15回×2', checked: false, level: '初心者向け' },
  { id: 'e5', title: 'もも上げ', description: '片足15秒×2セット。階段昇降前の準備にもなる。', duration: '片足15秒×2', checked: false, level: 'しっかり' },
];

const defaultKnowledge: Knowledge[] = [
  { id: '1', category: '冷凍ストック', title: '冷凍野菜は常備しやすい', note: '忙しい日でも野菜不足を防ぎやすい。蒸し調理やスープに使いやすい。' },
  { id: '2', category: '食事', title: 'たんぱく質を意識する', note: '魚・鶏むね肉・豆類を取り入れると、たんぱく質不足を防ぎやすい。' },
  { id: '3', category: '睡眠', title: '良い睡眠は改善の土台', note: '睡眠時間と質を整えることで、内臓脂肪改善に取り組みやすくなる。' },
  { id: '4', category: '食事', title: '食物繊維を取り入れる', note: '野菜や雑穀を意識すると、満足感と腸内環境をサポートできる。' },
];

const optionalFields: Array<{ key: keyof TodayRecord; label: string; placeholder: string }> = [
  { key: 'bodyFat', label: '体脂肪率 (%)', placeholder: '例: 25.0' },
  { key: 'bloodPressure', label: '血圧', placeholder: '例: 120/80' },
  { key: 'sleep', label: '睡眠時間 (h)', placeholder: '例: 7.0' },
  { key: 'steps', label: '歩数', placeholder: '例: 8000' },
  { key: 'alcohol', label: '飲酒', placeholder: '例: ビール350ml' },
  { key: 'snack', label: '間食', placeholder: '例: ナッツ少量' },
  { key: 'bowel', label: '便通', placeholder: '例: あり' },
  { key: 'mood', label: '気分', placeholder: '例: 良い' },
];

function emptyRecord(date: string): TodayRecord {
  return { date, weight: '', waist: '', bodyFat: '', bloodPressure: '', sleep: '', steps: '', alcohol: '', snack: '', bowel: '', mood: '', memo: '' };
}

function getStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : fallback;
  } catch {
    return fallback;
  }
}

function setStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function compressImage(dataUrl: string, maxWidth = 800, quality = 0.72): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

async function analyzeWithGemini(base64Image: string): Promise<MealEstimation> {
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) ?? '';
  if (!apiKey) throw new Error('NO_KEY');

  const base64Data = base64Image.replace(/^data:image\/[^;]+;base64,/, '');

  const prompt = `この食事写真を詳しく分析してください。内臓脂肪ダイエットの観点から以下のJSON形式のみで返してください。それ以外のテキストは一切含めないでください。
{
  "dishName": "料理名（日本語）",
  "ingredients": "主な食材（日本語、カンマ区切り）",
  "calories": 推定カロリー（整数、kcal）,
  "protein": タンパク質（整数、g）,
  "fat": 脂質（整数、g）,
  "carbs": 炭水化物（整数、g）,
  "vegetableLevel": "十分" または "普通" または "不足",
  "visceralFatRisk": "低" または "中" または "高",
  "advice": ["改善提案1", "改善提案2", "改善提案3"],
  "note": "内臓脂肪ダイエット観点の一言アドバイス（50文字以内）"
}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [
          { inline_data: { mime_type: 'image/jpeg', data: base64Data } },
          { text: prompt },
        ]}],
        generationConfig: { temperature: 0.1, maxOutputTokens: 1024 },
      }),
    }
  );

  if (!res.ok) {
    if (res.status === 429 || res.status === 503) throw new Error('RATE_LIMIT');
    throw new Error('API_ERROR');
  }

  const json = await res.json();
  const text: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('PARSE_ERROR');

  const parsed = JSON.parse(match[0]);
  return {
    name: String(parsed.dishName ?? '不明な料理'),
    ingredients: parsed.ingredients ? String(parsed.ingredients) : undefined,
    calories: Number(parsed.calories) || 0,
    protein: Number(parsed.protein) || 0,
    fat: Number(parsed.fat) || 0,
    carbs: Number(parsed.carbs) || 0,
    vegetableLevel: (['十分', '普通', '不足'] as VegetableLevel[]).includes(parsed.vegetableLevel)
      ? parsed.vegetableLevel as VegetableLevel : undefined,
    visceralFatRisk: (['低', '中', '高'] as VisceralFatRisk[]).includes(parsed.visceralFatRisk)
      ? parsed.visceralFatRisk as VisceralFatRisk : undefined,
    advice: Array.isArray(parsed.advice) ? parsed.advice.map(String) : [],
    note: String(parsed.note ?? ''),
    aiAnalyzed: true,
  };
}

function calorieBadge(cal: number): { label: string; cls: string } {
  if (cal <= 450) return { label: '適正', cls: 'badge-ok' };
  if (cal <= 700) return { label: 'やや多い', cls: 'badge-warn' };
  return { label: '多い', cls: 'badge-over' };
}

const todayString = new Date().toISOString().slice(0, 10);

type ChartPoint = { y: number; label: string };

function LineChart({ data, color, gradId, unit }: { data: ChartPoint[]; color: string; gradId: string; unit: string }) {
  if (data.length === 0) {
    return <div className="chart-empty">記録が貯まるとグラフが表示されます</div>;
  }
  if (data.length === 1) {
    return (
      <div className="chart-single">
        <span style={{ color, fontSize: '1.8rem', fontWeight: 700 }}>{data[0].y} {unit}</span>
        <span className="chart-single-date">{data[0].label}</span>
      </div>
    );
  }

  const W = 320, H = 110, PAD = 18;
  const ys = data.map(d => d.y);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const rangeY = maxY - minY || 0.1;

  const toX = (i: number) => PAD + (i / (data.length - 1)) * (W - PAD * 2);
  const toY = (v: number) => PAD + (1 - (v - minY) / rangeY) * (H - PAD * 2);

  const pts = data.map((d, i) => ({ sx: toX(i), sy: toY(d.y), label: d.label, val: d.y }));

  const linePath = pts.reduce((acc, p, i) => {
    if (i === 0) return `M ${p.sx.toFixed(1)} ${p.sy.toFixed(1)}`;
    const prev = pts[i - 1];
    const cpx = ((prev.sx + p.sx) / 2).toFixed(1);
    return `${acc} C ${cpx} ${prev.sy.toFixed(1)} ${cpx} ${p.sy.toFixed(1)} ${p.sx.toFixed(1)} ${p.sy.toFixed(1)}`;
  }, '');

  const areaPath = `${linePath} L ${pts[pts.length - 1].sx.toFixed(1)} ${H} L ${pts[0].sx.toFixed(1)} ${H} Z`;

  const latestDelta = data[data.length - 1].y - data[data.length - 2].y;

  return (
    <div className="chart-wrap">
      <div className="chart-trend">
        <span className="chart-latest" style={{ color }}>{data[data.length - 1].y} {unit}</span>
        {latestDelta !== 0 && (
          <span className={`chart-delta ${latestDelta < 0 ? 'down' : 'up'}`}>
            {latestDelta > 0 ? '▲' : '▼'} {Math.abs(latestDelta).toFixed(1)}
          </span>
        )}
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: H, overflow: 'visible', display: 'block' }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map(t => (
          <line key={t}
            x1={PAD} y1={(PAD + (1 - t) * (H - PAD * 2)).toFixed(1)}
            x2={W - PAD} y2={(PAD + (1 - t) * (H - PAD * 2)).toFixed(1)}
            stroke="#e8eed8" strokeWidth="1" strokeDasharray="4 4"
          />
        ))}
        <path d={areaPath} fill={`url(#${gradId})`} />
        <path d={linePath} stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.sx.toFixed(1)} cy={p.sy.toFixed(1)} r="5" fill="white" stroke={color} strokeWidth="2.2" />
            {(i === 0 || i === pts.length - 1 || data.length <= 4) && (
              <text x={p.sx.toFixed(1)} y={(p.sy - 9).toFixed(1)} textAnchor="middle" fontSize="9.5" fill={color} fontWeight="700">{p.val}</text>
            )}
          </g>
        ))}
      </svg>
      <div className="chart-labels">
        {pts.map((p, i) => (
          <span key={i} style={{ left: `${(p.sx / W) * 100}%` }}>{p.label}</span>
        ))}
      </div>
    </div>
  );
}

function App() {
  const [showFV, setShowFV] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [records, setRecords] = useState<TodayRecord[]>(() => getStorage('records', [emptyRecord(todayString)]));
  const [meals, setMeals] = useState<MealRecord[]>(() => getStorage('meals_v2', []));
  const [exercises, setExercises] = useState<ExerciseItem[]>(() => getStorage('exercises', defaultExercises));
  const [knowledge, setKnowledge] = useState<Knowledge[]>(() => getStorage('knowledge', defaultKnowledge));

  const [optionalOpen, setOptionalOpen] = useState(false);
  const [newRecord, setNewRecord] = useState<TodayRecord>(() => {
    const stored = getStorage<TodayRecord[]>('records', [emptyRecord(todayString)]);
    return stored.find(r => r.date === todayString) ?? emptyRecord(todayString);
  });

  const [activeMealType, setActiveMealType] = useState<MealType | null>(null);
  const [mealPhoto, setMealPhoto] = useState<string | null>(null);
  const [mealEstimation, setMealEstimation] = useState<MealEstimation | null>(null);
  const [mealManualCal, setMealManualCal] = useState('');
  const [mealMemo, setMealMemo] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<MealEditDraft | null>(null);
  const [expandedHomeMealType, setExpandedHomeMealType] = useState<MealType | null>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [newKnowledge, setNewKnowledge] = useState({ category: '食事', title: '', note: '' });
  const [waterDone, setWaterDone] = useState<boolean>(() => getStorage(`water_${todayString}`, false));
  const [graphMetric, setGraphMetric] = useState<GraphMetric>('weight');

  useEffect(() => { setStorage('records', records); }, [records]);
  useEffect(() => { setStorage('meals_v2', meals); }, [meals]);
  useEffect(() => { setStorage('exercises', exercises); }, [exercises]);
  useEffect(() => { setStorage('knowledge', knowledge); }, [knowledge]);
  useEffect(() => { setStorage(`water_${todayString}`, waterDone); }, [waterDone]);

  const todayRecord = useMemo(() => records.find(r => r.date === todayString) ?? emptyRecord(todayString), [records]);
  const todayMeals = useMemo(() => meals.filter(m => m.date === todayString), [meals]);
  const todayCalories = useMemo(() => todayMeals.reduce((sum, m) => {
    const cal = m.manualCalories ? parseInt(m.manualCalories) : (m.estimatedCalories ?? 0);
    return sum + (isNaN(cal) ? 0 : cal);
  }, 0), [todayMeals]);

  const weightPoints = useMemo<ChartPoint[]>(() =>
    records.filter(r => r.weight !== '' && !isNaN(parseFloat(r.weight))).slice(-7)
      .map(r => ({ y: parseFloat(r.weight), label: r.date.slice(5) })),
    [records]);

  const waistPoints = useMemo<ChartPoint[]>(() =>
    records.filter(r => r.waist !== '' && !isNaN(parseFloat(r.waist))).slice(-7)
      .map(r => ({ y: parseFloat(r.waist), label: r.date.slice(5) })),
    [records]);

  const walkDone = exercises.find(e => e.id === 'e1')?.checked ?? false;
  const missions = [
    { id: 'food', label: '食事写真を記録する', done: todayMeals.length > 0, onToggle: () => setActiveTab('meal') },
    { id: 'weight', label: '体重を入力する', done: todayRecord.weight !== '', onToggle: () => setActiveTab('log') },
    { id: 'water', label: '水を1.5L以上飲む', done: waterDone, onToggle: () => setWaterDone(v => !v) },
    { id: 'walk', label: '10分以上歩く', done: walkDone, onToggle: () => toggleExercise('e1') },
  ];
  const missionPercent = Math.round(missions.filter(m => m.done).length / missions.length * 100);

  const saveRecord = () => {
    setRecords(prev => {
      const exists = prev.some(r => r.date === newRecord.date);
      return exists
        ? prev.map(r => r.date === newRecord.date ? newRecord : r)
        : [...prev, newRecord];
    });
  };

  const toggleExercise = (id: string) => {
    setExercises(prev => prev.map(e => e.id === id ? { ...e, checked: !e.checked } : e));
  };

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const compressed = await compressImage(reader.result as string);
      setMealPhoto(compressed);
      setMealEstimation(null);
      setMealManualCal('');
      setHasAnalyzed(false);
      setAiError(null);
    };
    reader.readAsDataURL(file);
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 1800);
  };

  const deleteMeal = (id: string) => {
    if (!window.confirm('この食事記録を削除しますか？')) return;
    setMeals(prev => prev.filter(m => m.id !== id));
    showToast('削除しました');
  };

  const startEditMeal = (meal: MealRecord) => {
    setEditingMealId(meal.id);
    setEditDraft({
      id: meal.id,
      type: meal.type,
      estimatedName: meal.estimatedName,
      manualCalories: meal.manualCalories || String(meal.estimatedCalories ?? ''),
      protein: String(meal.protein ?? ''),
      fat: String(meal.fat ?? ''),
      carbs: String(meal.carbs ?? ''),
      memo: meal.memo,
      visceralFatRisk: meal.visceralFatRisk ?? '',
    });
  };

  const saveEditMeal = () => {
    if (!editDraft) return;
    setMeals(prev => prev.map(m => {
      if (m.id !== editDraft.id) return m;
      const p = editDraft.protein !== '' ? Number(editDraft.protein) : null;
      const f = editDraft.fat !== '' ? Number(editDraft.fat) : null;
      const c = editDraft.carbs !== '' ? Number(editDraft.carbs) : null;
      return {
        ...m,
        type: editDraft.type,
        estimatedName: editDraft.estimatedName,
        manualCalories: editDraft.manualCalories,
        protein: p != null && !isNaN(p) ? p : m.protein,
        fat: f != null && !isNaN(f) ? f : m.fat,
        carbs: c != null && !isNaN(c) ? c : m.carbs,
        memo: editDraft.memo,
        visceralFatRisk: editDraft.visceralFatRisk !== '' ? editDraft.visceralFatRisk : m.visceralFatRisk,
      };
    }));
    setEditingMealId(null);
    setEditDraft(null);
    showToast('更新しました');
  };

  const cancelEditMeal = () => {
    setEditingMealId(null);
    setEditDraft(null);
  };

  const startAiAnalysis = async () => {
    if (!mealPhoto || isAnalyzing) return;
    setIsAnalyzing(true);
    setAiError(null);
    try {
      const result = await analyzeWithGemini(mealPhoto);
      setMealEstimation(result);
      setMealManualCal(String(result.calories));
      setHasAnalyzed(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'API_ERROR';
      if (msg === 'RATE_LIMIT') {
        setAiError('AI分析上限に達しました。しばらく待ってから再試行してください。');
      } else if (msg === 'NO_KEY') {
        setAiError('APIキーが設定されていません（VITE_GEMINI_API_KEY）。');
      } else {
        setAiError('AI分析に失敗しました。写真の保存は続行できます。');
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const openMealForm = (type: MealType) => {
    setActiveMealType(type);
    setMealPhoto(null);
    setMealEstimation(null);
    setMealManualCal('');
    setMealMemo('');
    setHasAnalyzed(false);
    setAiError(null);
    if (photoInputRef.current) photoInputRef.current.value = '';
  };

  const saveMeal = () => {
    if (!activeMealType) return;
    setMeals(prev => [...prev, {
      id: `m-${Date.now()}`,
      date: todayString,
      type: activeMealType,
      photo: mealPhoto,
      estimatedName: mealEstimation?.name ?? '',
      estimatedCalories: mealEstimation?.calories ?? null,
      manualCalories: mealManualCal,
      protein: mealEstimation?.protein ?? null,
      fat: mealEstimation?.fat ?? null,
      carbs: mealEstimation?.carbs ?? null,
      estimationNote: mealEstimation?.note ?? '',
      memo: mealMemo,
      ingredients: mealEstimation?.ingredients,
      vegetableLevel: mealEstimation?.vegetableLevel,
      visceralFatRisk: mealEstimation?.visceralFatRisk,
      advice: mealEstimation?.advice,
      aiAnalyzed: mealEstimation?.aiAnalyzed,
    }]);
    setActiveMealType(null);
    setMealPhoto(null);
    setMealEstimation(null);
    setMealManualCal('');
    setMealMemo('');
    setHasAnalyzed(false);
    setAiError(null);
    showToast('記録しました');
  };

  const cancelMealForm = () => {
    setActiveMealType(null);
    setMealPhoto(null);
    setMealEstimation(null);
    setMealManualCal('');
    setMealMemo('');
    setHasAnalyzed(false);
    setAiError(null);
  };

  const addKnowledge = () => {
    if (!newKnowledge.title.trim() || !newKnowledge.note.trim()) return;
    setKnowledge(prev => [...prev, { id: `k-${Date.now()}`, ...newKnowledge }]);
    setNewKnowledge({ category: '食事', title: '', note: '' });
  };

  // ─── FV ───────────────────────────────────────────────
  if (showFV) {
    return (
      <div className="fv-screen">
        <div className="fv-overlay" />
        <img src="/FV.png" alt="内臓脂肪ダイエット" className="fv-image" />
        <div className="fv-bottom">
          <p className="fv-tagline">内側から変わる、未来の自分へ</p>
          <button className="fv-button" onClick={() => setShowFV(false)}>
            タップする
          </button>
          <div className="fv-arrow">↓</div>
        </div>
      </div>
    );
  }

  // ─── App ─────────────────────────────────────────────
  return (
    <div className="app-shell">
      {toastMsg && (
        <div className="meal-success">
          <div className="meal-success-inner">
            <div className="meal-success-icon">✓</div>
            <div className="meal-success-text">{toastMsg}</div>
          </div>
        </div>
      )}

      <header className="app-header">
        <p className="eyebrow">内臓脂肪ダイエット</p>
        <h1>習慣で整える健康管理</h1>
      </header>

      <main className="content">

        {/* ─── ホーム ─── */}
        {activeTab === 'home' && (
          <section>
            {/* ミッションカード */}
            <div className="section-card mission-card">
              <div className="mission-header">
                <div className="section-title" style={{ marginBottom: 0 }}>今日のミッション</div>
                <div className="mission-percent">{missionPercent}%</div>
              </div>
              <div className="mission-bar-track">
                <div className="mission-bar-fill" style={{ width: `${missionPercent}%` }} />
              </div>
              <ul className="mission-list">
                {missions.map(m => (
                  <li key={m.id} className={m.done ? 'done' : ''} onClick={m.onToggle}>
                    <span className="mission-check">{m.done ? '✓' : ''}</span>
                    {m.label}
                  </li>
                ))}
              </ul>
            </div>

            {/* 統計カード */}
            <div className="grid-3" style={{ marginTop: 14 }}>
              <div className="stat-card">
                <div className="stat-label">今日の体重</div>
                <div className="stat-value">{todayRecord.weight || '－'}</div>
                <div className="stat-unit">kg</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">今日の腹囲</div>
                <div className="stat-value">{todayRecord.waist || '－'}</div>
                <div className="stat-unit">cm</div>
              </div>
              <div className="stat-card accent">
                <div className="stat-label">摂取カロリー</div>
                <div className="stat-value">{todayCalories > 0 ? todayCalories : '－'}</div>
                <div className="stat-unit">kcal</div>
              </div>
            </div>

            {/* 今日の食事 */}
            {todayMeals.length > 0 && (
              <div className="section-card" style={{ marginTop: 14 }}>
                <div className="section-title">今日の食事</div>
                {(['朝', '昼', '夜', '間食'] as MealType[]).map(type => {
                  const ms = todayMeals.filter(m => m.type === type);
                  if (ms.length === 0) return null;
                  const typeCal = ms.reduce((s, m) => {
                    const c = parseInt(m.manualCalories || String(m.estimatedCalories ?? '0'));
                    return s + (isNaN(c) ? 0 : c);
                  }, 0);
                  const photos = ms.filter(m => m.photo).map(m => m.photo!);
                  const isExpanded = expandedHomeMealType === type;
                  return (
                    <div key={type}>
                      <div
                        className="home-meal-row home-meal-row-tap"
                        onClick={() => setExpandedHomeMealType(isExpanded ? null : type)}
                      >
                        <span className="meal-type-badge">{type}</span>
                        {photos.length > 0 && (
                          <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                            {photos.slice(0, 2).map((src, i) => (
                              <img key={i} src={src} alt="食事" style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 6 }} />
                            ))}
                          </div>
                        )}
                        <span className="home-meal-name">{ms.map(m => m.estimatedName || 'メモあり').join('、')}</span>
                        <span className="cal-badge">{typeCal} kcal</span>
                        <span className="home-expand-icon">{isExpanded ? '▲' : '▼'}</span>
                      </div>
                      {isExpanded && (
                        <div className="home-meal-detail">
                          {ms.map(m => {
                            const cal = parseInt(m.manualCalories || String(m.estimatedCalories ?? '0'));
                            return (
                              <div key={m.id} className="home-meal-detail-item">
                                <div className="home-detail-left">
                                  {m.photo && (
                                    <img src={m.photo} alt="食事" className="home-detail-thumb" />
                                  )}
                                  <div className="home-detail-info">
                                    <div className="home-detail-name">{m.estimatedName || 'メモあり'}</div>
                                    <div className="home-detail-cal">{isNaN(cal) ? '－' : cal} kcal</div>
                                    {m.visceralFatRisk && (
                                      <span className={`risk-badge risk-${m.visceralFatRisk}`} style={{ fontSize: '0.7rem' }}>
                                        リスク：{m.visceralFatRisk}
                                      </span>
                                    )}
                                    {m.memo && <div className="home-detail-memo">{m.memo}</div>}
                                  </div>
                                </div>
                                <div className="home-detail-actions">
                                  <button
                                    className="card-edit-btn"
                                    onClick={e => { e.stopPropagation(); startEditMeal(m); setActiveTab('meal'); setExpandedHomeMealType(null); }}
                                  >編集</button>
                                  <button
                                    className="card-delete-btn"
                                    onClick={e => { e.stopPropagation(); deleteMeal(m.id); }}
                                  >削除</button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ─── 記録 ─── */}
        {activeTab === 'log' && (
          <section className="section-card">
            <div className="section-title">今日の記録</div>
            <p className="hint-text">毎日すべて入力する必要はありません。体重・腹囲だけでもOKです。</p>

            <div className="form-grid">
              <label className="field">
                <span>体重 (kg)</span>
                <input type="number" inputMode="decimal" value={newRecord.weight}
                  onChange={e => setNewRecord({ ...newRecord, weight: e.target.value })}
                  placeholder="例: 72.5" />
              </label>
              <label className="field">
                <span>腹囲 (cm)</span>
                <input type="number" inputMode="decimal" value={newRecord.waist}
                  onChange={e => setNewRecord({ ...newRecord, waist: e.target.value })}
                  placeholder="例: 88.0" />
              </label>
            </div>

            <button className="collapse-btn" onClick={() => setOptionalOpen(v => !v)}>
              {optionalOpen ? '▲ 詳細入力を閉じる' : '▼ 詳細入力を開く（体脂肪・血圧・睡眠など）'}
            </button>

            {optionalOpen && (
              <div className="form-grid optional-grid">
                {optionalFields.map(({ key, label, placeholder }) => (
                  <label key={key} className="field">
                    <span>{label}</span>
                    <input value={newRecord[key]}
                      onChange={e => setNewRecord({ ...newRecord, [key]: e.target.value })}
                      placeholder={placeholder} />
                  </label>
                ))}
                <label className="field field-full">
                  <span>メモ</span>
                  <textarea value={newRecord.memo}
                    onChange={e => setNewRecord({ ...newRecord, memo: e.target.value })}
                    placeholder="今日の体調や気づき" />
                </label>
              </div>
            )}

            <button className="primary-button" onClick={saveRecord}>記録を保存</button>

            <div className="log-list">
              <div className="subsection-title">記録履歴</div>
              {records.slice().reverse().map(item => (
                <div key={item.date} className="log-item">
                  <div className="log-item-header">
                    <strong>{item.date}</strong>
                    <span>{item.memo || '－'}</span>
                  </div>
                  <div className="mini-grid">
                    <div>体重: {item.weight || '－'} kg</div>
                    <div>腹囲: {item.waist || '－'} cm</div>
                    {item.sleep && <div>睡眠: {item.sleep} h</div>}
                    {item.bodyFat && <div>体脂肪: {item.bodyFat}%</div>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── 食事 ─── */}
        {activeTab === 'meal' && (
          <section className="section-card">
            <div className="section-title">食事記録</div>

            {todayCalories > 0 && (
              <div className="calorie-summary">
                <span>本日の合計摂取カロリー</span>
                <strong>{todayCalories} kcal</strong>
              </div>
            )}

            <input ref={photoInputRef} type="file" accept="image/*"
              style={{ display: 'none' }} onChange={handlePhotoUpload} />

            {(['朝', '昼', '夜', '間食'] as MealType[]).map(type => (
              <div key={type} className="meal-section">
                <div className="meal-section-header">
                  <h3>{type}</h3>
                  {activeMealType !== type && (
                    <button className="add-meal-btn" onClick={() => openMealForm(type)}>＋ 写真を記録</button>
                  )}
                </div>

                {todayMeals.filter(m => m.type === type).map(m => {
                  const cal = parseInt(m.manualCalories || String(m.estimatedCalories ?? '0'));
                  const badge = !isNaN(cal) && cal > 0 ? calorieBadge(cal) : null;
                  const isEditing = editingMealId === m.id;
                  return (
                    <div key={m.id} className="meal-record-card" style={{ flexDirection: 'column', gap: 8 }}>
                      {isEditing && editDraft ? (
                        /* ── 編集フォーム ── */
                        <div className="meal-edit-form">
                          <div className="meal-edit-title">食事記録を編集</div>
                          <div className="meal-edit-grid">
                            <label className="field">
                              <span>食事区分</span>
                              <select
                                value={editDraft.type}
                                onChange={e => setEditDraft({ ...editDraft, type: e.target.value as MealType })}
                              >
                                <option value="朝">朝食</option>
                                <option value="昼">昼食</option>
                                <option value="夜">夕食</option>
                                <option value="間食">間食</option>
                              </select>
                            </label>
                            <label className="field">
                              <span>料理名</span>
                              <input
                                value={editDraft.estimatedName}
                                onChange={e => setEditDraft({ ...editDraft, estimatedName: e.target.value })}
                                placeholder="料理名"
                              />
                            </label>
                            <label className="field">
                              <span>カロリー (kcal)</span>
                              <input
                                type="number" inputMode="numeric"
                                value={editDraft.manualCalories}
                                onChange={e => setEditDraft({ ...editDraft, manualCalories: e.target.value })}
                                placeholder="例: 600"
                              />
                            </label>
                            <label className="field">
                              <span>P たんぱく質 (g)</span>
                              <input
                                type="number" inputMode="numeric"
                                value={editDraft.protein}
                                onChange={e => setEditDraft({ ...editDraft, protein: e.target.value })}
                                placeholder="例: 30"
                              />
                            </label>
                            <label className="field">
                              <span>F 脂質 (g)</span>
                              <input
                                type="number" inputMode="numeric"
                                value={editDraft.fat}
                                onChange={e => setEditDraft({ ...editDraft, fat: e.target.value })}
                                placeholder="例: 15"
                              />
                            </label>
                            <label className="field">
                              <span>C 炭水化物 (g)</span>
                              <input
                                type="number" inputMode="numeric"
                                value={editDraft.carbs}
                                onChange={e => setEditDraft({ ...editDraft, carbs: e.target.value })}
                                placeholder="例: 70"
                              />
                            </label>
                            <label className="field">
                              <span>内臓脂肪リスク</span>
                              <select
                                value={editDraft.visceralFatRisk}
                                onChange={e => setEditDraft({ ...editDraft, visceralFatRisk: e.target.value as VisceralFatRisk | '' })}
                              >
                                <option value="">未設定</option>
                                <option value="低">低</option>
                                <option value="中">中</option>
                                <option value="高">高</option>
                              </select>
                            </label>
                            <label className="field field-full">
                              <span>メモ</span>
                              <input
                                value={editDraft.memo}
                                onChange={e => setEditDraft({ ...editDraft, memo: e.target.value })}
                                placeholder="例: 塩分少なめにした"
                              />
                            </label>
                          </div>
                          <div className="form-actions">
                            <button className="primary-button save-btn" onClick={saveEditMeal}>更新</button>
                            <button className="cancel-button" onClick={cancelEditMeal}>キャンセル</button>
                          </div>
                        </div>
                      ) : (
                        /* ── 通常表示 ── */
                        <>
                          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                            {m.photo && <img src={m.photo} alt="食事写真" className="meal-thumb" />}
                            <div className="meal-record-body">
                              <div style={{ marginBottom: 5 }}>
                                <span className="meal-type-badge">
                                  {m.type === '朝' ? '朝食' : m.type === '昼' ? '昼食' : m.type === '夜' ? '夕食' : '間食'}
                                </span>
                              </div>
                              {m.estimatedName && <div className="meal-record-name">{m.estimatedName}</div>}
                              <div className="meal-record-cal-row">
                                <span className="meal-record-cal">{!isNaN(cal) ? cal : '－'} kcal</span>
                                {badge && <span className={`cal-eval-badge ${badge.cls}`}>{badge.label}</span>}
                              </div>
                              {m.protein != null && (
                                <div className="pfc-text">P:{m.protein}g F:{m.fat}g C:{m.carbs}g</div>
                              )}
                              {(m.vegetableLevel || m.visceralFatRisk) && (
                                <div className="ai-metrics-row" style={{ marginTop: 4 }}>
                                  {m.vegetableLevel && (
                                    <span className={`ai-veggie veggie-${m.vegetableLevel}`} style={{ fontSize: '0.72rem' }}>
                                      野菜：{m.vegetableLevel}
                                    </span>
                                  )}
                                  {m.visceralFatRisk && (
                                    <span className={`risk-badge risk-${m.visceralFatRisk}`} style={{ fontSize: '0.72rem' }}>
                                      リスク：{m.visceralFatRisk}
                                    </span>
                                  )}
                                </div>
                              )}
                              {m.memo && <div className="meal-record-memo">{m.memo}</div>}
                            </div>
                            <div className="card-actions">
                              <button className="card-edit-btn" onClick={() => startEditMeal(m)}>編集</button>
                              <button className="card-delete-btn" onClick={() => deleteMeal(m.id)}>削除</button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}

                {activeMealType === type && (
                  <div className="meal-form">
                    {!mealPhoto ? (
                      <button className="photo-upload-btn" onClick={() => photoInputRef.current?.click()}>
                        <span className="photo-upload-icon">📷</span>
                        <span>食事写真を追加</span>
                        <span className="photo-upload-sub">タップして写真を選ぶ</span>
                      </button>
                    ) : (
                      <div>
                        <img src={mealPhoto} alt="プレビュー" className="meal-photo-preview" />
                        <button className="change-photo-btn" onClick={() => photoInputRef.current?.click()}>写真を変更</button>
                      </div>
                    )}

                    {/* AI分析ボタン */}
                    {mealPhoto && (
                      <div style={{ marginTop: 12 }}>
                        {!hasAnalyzed ? (
                          <button
                            className="ai-analyze-btn"
                            onClick={startAiAnalysis}
                            disabled={isAnalyzing}
                          >
                            {isAnalyzing ? (
                              <><span className="ai-spinner" />AI分析中…</>
                            ) : (
                              <>🤖 AI分析する</>
                            )}
                          </button>
                        ) : (
                          <button
                            className="ai-reanalyze-btn"
                            onClick={() => { setHasAnalyzed(false); setMealEstimation(null); setAiError(null); }}
                          >
                            🔄 再分析する
                          </button>
                        )}
                      </div>
                    )}

                    {/* エラー表示 */}
                    {aiError && (
                      <div className="ai-error-box">{aiError}</div>
                    )}

                    {/* AI分析結果 */}
                    {mealEstimation?.aiAnalyzed && (
                      <div className="estimation-card ai-result-card">
                        <div className="estimation-title">🤖 AI分析結果</div>
                        <div className="estimation-name">{mealEstimation.name}</div>
                        {mealEstimation.ingredients && (
                          <div className="ai-ingredients">食材：{mealEstimation.ingredients}</div>
                        )}
                        <div className="pfc-row">
                          <span>P（たんぱく質）：{mealEstimation.protein}g</span>
                          <span>F（脂質）：{mealEstimation.fat}g</span>
                          <span>C（炭水化物）：{mealEstimation.carbs}g</span>
                        </div>
                        <div className="ai-metrics-row">
                          <div className="ai-metric">
                            <span className="ai-metric-label">野菜量</span>
                            <span className={`ai-veggie veggie-${mealEstimation.vegetableLevel ?? '普通'}`}>
                              {mealEstimation.vegetableLevel ?? '－'}
                            </span>
                          </div>
                          <div className="ai-metric">
                            <span className="ai-metric-label">内臓脂肪リスク</span>
                            <span className={`risk-badge risk-${mealEstimation.visceralFatRisk ?? '中'}`}>
                              {mealEstimation.visceralFatRisk ?? '－'}
                            </span>
                          </div>
                        </div>
                        {mealEstimation.advice && mealEstimation.advice.length > 0 && (
                          <div className="ai-advice-box">
                            <div className="ai-advice-title">改善提案</div>
                            <ul className="ai-advice-list">
                              {mealEstimation.advice.map((a, i) => <li key={i}>{a}</li>)}
                            </ul>
                          </div>
                        )}
                        {mealEstimation.note && (
                          <div className="estimation-note">💡 {mealEstimation.note}</div>
                        )}
                        <div className="estimation-warning">
                          ※ AIによる推定です。実際のカロリー・栄養成分とは異なる場合があります。
                        </div>
                      </div>
                    )}

                    <label className="field" style={{ marginTop: 12 }}>
                      <span>カロリー (kcal)</span>
                      <input type="number" inputMode="numeric" value={mealManualCal}
                        onChange={e => setMealManualCal(e.target.value)}
                        placeholder={mealEstimation ? 'AI推定値を修正できます' : '手動で入力'} />
                    </label>

                    <label className="field" style={{ marginTop: 12 }}>
                      <span>メモ</span>
                      <input value={mealMemo} onChange={e => setMealMemo(e.target.value)}
                        placeholder="例: 塩分少なめにした" />
                    </label>

                    <div className="form-actions">
                      <button className="primary-button save-btn" onClick={saveMeal}>保存</button>
                      <button className="cancel-button" onClick={cancelMealForm}>キャンセル</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* ─── グラフ ─── */}
        {activeTab === 'graph' && (
          <section className="section-card">
            <div className="section-title">記録グラフ</div>
            <div className="graph-metric-tabs">
              <button className={`graph-metric-btn ${graphMetric === 'weight' ? 'active' : ''}`}
                onClick={() => setGraphMetric('weight')}>体重 (kg)</button>
              <button className={`graph-metric-btn ${graphMetric === 'waist' ? 'active' : ''}`}
                onClick={() => setGraphMetric('waist')}>腹囲 (cm)</button>
            </div>
            <LineChart
              data={graphMetric === 'weight' ? weightPoints : waistPoints}
              color={graphMetric === 'weight' ? '#5aad3e' : '#4a8fba'}
              gradId={graphMetric === 'weight' ? 'grad-weight' : 'grad-waist'}
              unit={graphMetric === 'weight' ? 'kg' : 'cm'}
            />
            <p style={{ fontSize: '0.78rem', color: '#8a9a82', marginTop: 16, textAlign: 'center' }}>
              直近7件のデータを表示しています
            </p>
          </section>
        )}

        {/* ─── 運動 ─── */}
        {activeTab === 'move' && (
          <section className="section-card">
            <div className="section-title">運動</div>
            <div className="exercise-list">
              {exercises.map(item => (
                <div key={item.id} className="exercise-item">
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <small>{item.duration}・{item.level}</small>
                  </div>
                  <button className={item.checked ? 'secondary-button checked' : 'secondary-button'}
                    onClick={() => toggleExercise(item.id)}>
                    {item.checked ? '完了' : '実施'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── 豆知識 ─── */}
        {activeTab === 'tips' && (
          <section className="section-card">
            <div className="section-title">豆知識フォルダ</div>
            <div className="form-grid">
              <label className="field">
                <span>カテゴリ</span>
                <select value={newKnowledge.category} onChange={e => setNewKnowledge({ ...newKnowledge, category: e.target.value })}>
                  <option>食事</option><option>運動</option><option>睡眠</option>
                  <option>冷凍ストック</option><option>注意点</option><option>外食</option><option>飲酒</option>
                </select>
              </label>
              <label className="field">
                <span>タイトル</span>
                <input value={newKnowledge.title}
                  onChange={e => setNewKnowledge({ ...newKnowledge, title: e.target.value })}
                  placeholder="豆知識のタイトル" />
              </label>
              <label className="field field-full">
                <span>詳細</span>
                <textarea value={newKnowledge.note}
                  onChange={e => setNewKnowledge({ ...newKnowledge, note: e.target.value })}
                  placeholder="詳しいメモを入力" />
              </label>
            </div>
            <button className="primary-button" onClick={addKnowledge}>豆知識を追加</button>
            <div className="knowledge-list">
              {knowledge.map(item => (
                <div key={item.id} className="knowledge-item">
                  <div>
                    <div className="tag">{item.category}</div>
                    <h3>{item.title}</h3>
                    <p>{item.note}</p>
                  </div>
                  <button className="tertiary-button"
                    onClick={() => setKnowledge(prev => prev.filter(v => v.id !== item.id))}>削除</button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <nav className="bottom-nav">
        {([
          { key: 'home', icon: '🏠', label: 'ホーム' },
          { key: 'log',  icon: '✏️', label: '記録'  },
          { key: 'meal', icon: '🍽', label: '食事'  },
          { key: 'graph',icon: '📈', label: 'グラフ' },
          { key: 'move', icon: '🏃', label: '運動'  },
          { key: 'tips', icon: '💡', label: '豆知識' },
        ] as const).map(({ key, icon, label }) => (
          <button key={key}
            className={activeTab === key ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setActiveTab(key)}>
            <span className="nav-icon">{icon}</span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export default App;
