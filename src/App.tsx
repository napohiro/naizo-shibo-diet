import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';

type TabKey = 'home' | 'log' | 'meal' | 'move' | 'tips';
type MealType = '朝' | '昼' | '夜' | '間食';

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

function setStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

const todayString = new Date().toISOString().slice(0, 10);

function App() {
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
  const [mealEstimation, setMealEstimation] = useState<typeof MOCK_ESTIMATIONS[number] | null>(null);
  const [mealManualCal, setMealManualCal] = useState('');
  const [mealMemo, setMealMemo] = useState('');
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [newKnowledge, setNewKnowledge] = useState({ category: '食事', title: '', note: '' });

  useEffect(() => { setStorage('records', records); }, [records]);
  useEffect(() => { setStorage('meals_v2', meals); }, [meals]);
  useEffect(() => { setStorage('exercises', exercises); }, [exercises]);
  useEffect(() => { setStorage('knowledge', knowledge); }, [knowledge]);

  const todayRecord = useMemo(() => records.find(r => r.date === todayString) ?? emptyRecord(todayString), [records]);
  const todayMeals = useMemo(() => meals.filter(m => m.date === todayString), [meals]);
  const todayCalories = useMemo(() => todayMeals.reduce((sum, m) => {
    const cal = m.manualCalories ? parseInt(m.manualCalories) : (m.estimatedCalories ?? 0);
    return sum + (isNaN(cal) ? 0 : cal);
  }, 0), [todayMeals]);

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
    reader.onload = () => {
      const base64 = reader.result as string;
      setMealPhoto(base64);
      const est = MOCK_ESTIMATIONS[Math.floor(Math.random() * MOCK_ESTIMATIONS.length)];
      setMealEstimation(est);
      setMealManualCal(String(est.calories));
    };
    reader.readAsDataURL(file);
  };

  const openMealForm = (type: MealType) => {
    setActiveMealType(type);
    setMealPhoto(null);
    setMealEstimation(null);
    setMealManualCal('');
    setMealMemo('');
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
    }]);
    setActiveMealType(null);
    setMealPhoto(null);
    setMealEstimation(null);
    setMealManualCal('');
    setMealMemo('');
  };

  const cancelMealForm = () => {
    setActiveMealType(null);
    setMealPhoto(null);
    setMealEstimation(null);
    setMealManualCal('');
    setMealMemo('');
  };

  const addKnowledge = () => {
    if (!newKnowledge.title.trim() || !newKnowledge.note.trim()) return;
    setKnowledge(prev => [...prev, { id: `k-${Date.now()}`, ...newKnowledge }]);
    setNewKnowledge({ category: '食事', title: '', note: '' });
  };

  return (
    <div className="app-shell">
      <header className="app-header">
        <p className="eyebrow">内臓脂肪ダイエット</p>
        <h1>習慣で整える健康管理</h1>
        <p className="header-note">生活習慣の改善をサポートするアプリです。</p>
      </header>

      <main className="content">

        {/* ホーム */}
        {activeTab === 'home' && (
          <section>
            <div className="grid-3">
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

            <div className="section-card" style={{ marginTop: 16 }}>
              <div className="section-title">今日やること</div>
              <ul className="today-tasks">
                <li className={todayMeals.length > 0 ? 'done' : ''}>
                  <span className="task-icon">{todayMeals.length > 0 ? '✓' : '○'}</span>
                  食事写真を1枚記録する
                </li>
                <li className={exercises.some(e => e.checked) ? 'done' : ''}>
                  <span className="task-icon">{exercises.some(e => e.checked) ? '✓' : '○'}</span>
                  15分歩く
                </li>
                <li>
                  <span className="task-icon">○</span>
                  水分を意識する
                </li>
              </ul>
            </div>

            {todayMeals.length > 0 && (
              <div className="section-card" style={{ marginTop: 16 }}>
                <div className="section-title">今日の食事</div>
                {(['朝', '昼', '夜', '間食'] as MealType[]).map(type => {
                  const ms = todayMeals.filter(m => m.type === type);
                  if (ms.length === 0) return null;
                  const typeCal = ms.reduce((s, m) => {
                    const c = parseInt(m.manualCalories || String(m.estimatedCalories ?? '0'));
                    return s + (isNaN(c) ? 0 : c);
                  }, 0);
                  return (
                    <div key={type} className="home-meal-row">
                      <span className="meal-type-badge">{type}</span>
                      <span className="home-meal-name">{ms.map(m => m.estimatedName || 'メモあり').join('、')}</span>
                      <span className="cal-badge">{typeCal} kcal</span>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* 記録 */}
        {activeTab === 'log' && (
          <section className="section-card">
            <div className="section-title">今日の記録</div>
            <p className="hint-text">毎日すべて入力する必要はありません。体重・腹囲・食事写真だけでもOKです。</p>

            <div className="form-grid">
              <label className="field">
                <span>体重 (kg)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={newRecord.weight}
                  onChange={e => setNewRecord({ ...newRecord, weight: e.target.value })}
                  placeholder="例: 72.5"
                />
              </label>
              <label className="field">
                <span>腹囲 (cm)</span>
                <input
                  type="number"
                  inputMode="decimal"
                  value={newRecord.waist}
                  onChange={e => setNewRecord({ ...newRecord, waist: e.target.value })}
                  placeholder="例: 88.0"
                />
              </label>
            </div>

            <button className="collapse-btn" onClick={() => setOptionalOpen(v => !v)}>
              {optionalOpen ? '▲ 任意記録を閉じる' : '▼ 任意記録を開く（体脂肪・血圧・睡眠など）'}
            </button>

            {optionalOpen && (
              <div className="form-grid optional-grid">
                {optionalFields.map(({ key, label, placeholder }) => (
                  <label key={key} className="field">
                    <span>{label}</span>
                    <input
                      value={newRecord[key]}
                      onChange={e => setNewRecord({ ...newRecord, [key]: e.target.value })}
                      placeholder={placeholder}
                    />
                  </label>
                ))}
                <label className="field field-full">
                  <span>メモ</span>
                  <textarea
                    value={newRecord.memo}
                    onChange={e => setNewRecord({ ...newRecord, memo: e.target.value })}
                    placeholder="今日の体調や気づき"
                  />
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

        {/* 食事 */}
        {activeTab === 'meal' && (
          <section className="section-card">
            <div className="section-title">食事記録</div>

            {todayCalories > 0 && (
              <div className="calorie-summary">
                <span>本日の合計摂取カロリー</span>
                <strong>{todayCalories} kcal</strong>
              </div>
            )}

            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoUpload}
            />

            {(['朝', '昼', '夜', '間食'] as MealType[]).map(type => (
              <div key={type} className="meal-section">
                <div className="meal-section-header">
                  <h3>{type}</h3>
                  {activeMealType !== type && (
                    <button className="add-meal-btn" onClick={() => openMealForm(type)}>＋ 写真を記録</button>
                  )}
                </div>

                {todayMeals.filter(m => m.type === type).map(m => (
                  <div key={m.id} className="meal-record-card">
                    {m.photo && <img src={m.photo} alt="食事写真" className="meal-thumb" />}
                    <div className="meal-record-body">
                      {m.estimatedName && <div className="meal-record-name">{m.estimatedName}</div>}
                      <div className="meal-record-cal">
                        {m.manualCalories || m.estimatedCalories} kcal
                        {m.protein != null && (
                          <span className="pfc-text">P:{m.protein}g F:{m.fat}g C:{m.carbs}g</span>
                        )}
                      </div>
                      {m.memo && <div className="meal-record-memo">{m.memo}</div>}
                    </div>
                    <button className="delete-btn" onClick={() => setMeals(prev => prev.filter(x => x.id !== m.id))}>✕</button>
                  </div>
                ))}

                {activeMealType === type && (
                  <div className="meal-form">
                    {!mealPhoto ? (
                      <button className="photo-upload-btn" onClick={() => photoInputRef.current?.click()}>
                        📷 食事写真を追加
                      </button>
                    ) : (
                      <div>
                        <img src={mealPhoto} alt="プレビュー" className="meal-photo-preview" />
                        <button className="change-photo-btn" onClick={() => photoInputRef.current?.click()}>写真を変更</button>
                      </div>
                    )}

                    {mealEstimation && (
                      <div className="estimation-card">
                        <div className="estimation-title">推定結果（デモ）</div>
                        <div className="estimation-name">{mealEstimation.name}</div>
                        <div className="pfc-row">
                          <span>たんぱく質: {mealEstimation.protein}g</span>
                          <span>脂質: {mealEstimation.fat}g</span>
                          <span>糖質: {mealEstimation.carbs}g</span>
                        </div>
                        <div className="estimation-note">💡 {mealEstimation.note}</div>
                        <div className="estimation-warning">
                          ※ 写真からの推定カロリーは目安です。量・調味料・油の量によって実際とは異なります。
                        </div>
                        <label className="field" style={{ marginTop: 12 }}>
                          <span>カロリーを修正 (kcal)</span>
                          <input
                            type="number"
                            inputMode="numeric"
                            value={mealManualCal}
                            onChange={e => setMealManualCal(e.target.value)}
                          />
                        </label>
                      </div>
                    )}

                    {!mealEstimation && (
                      <label className="field" style={{ marginTop: 12 }}>
                        <span>カロリー (kcal)</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          value={mealManualCal}
                          onChange={e => setMealManualCal(e.target.value)}
                          placeholder="手動で入力"
                        />
                      </label>
                    )}

                    <label className="field" style={{ marginTop: 12 }}>
                      <span>メモ</span>
                      <input
                        value={mealMemo}
                        onChange={e => setMealMemo(e.target.value)}
                        placeholder="例: 塩分少なめにした"
                      />
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

        {/* 運動 */}
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
                  <button
                    className={item.checked ? 'secondary-button checked' : 'secondary-button'}
                    onClick={() => toggleExercise(item.id)}
                  >
                    {item.checked ? '完了' : '実施'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 豆知識 */}
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
                <input value={newKnowledge.title} onChange={e => setNewKnowledge({ ...newKnowledge, title: e.target.value })} placeholder="豆知識のタイトル" />
              </label>
              <label className="field field-full">
                <span>詳細</span>
                <textarea value={newKnowledge.note} onChange={e => setNewKnowledge({ ...newKnowledge, note: e.target.value })} placeholder="詳しいメモを入力" />
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
                  <button className="tertiary-button" onClick={() => setKnowledge(prev => prev.filter(v => v.id !== item.id))}>削除</button>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <nav className="bottom-nav">
        <button className={activeTab === 'home' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveTab('home')}>ホーム</button>
        <button className={activeTab === 'log' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveTab('log')}>記録</button>
        <button className={activeTab === 'meal' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveTab('meal')}>食事</button>
        <button className={activeTab === 'move' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveTab('move')}>運動</button>
        <button className={activeTab === 'tips' ? 'nav-btn active' : 'nav-btn'} onClick={() => setActiveTab('tips')}>豆知識</button>
      </nav>
    </div>
  );
}

export default App;
