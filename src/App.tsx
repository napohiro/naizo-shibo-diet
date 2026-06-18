import { useEffect, useMemo, useState } from 'react';

type TabKey = 'home' | 'log' | 'meal' | 'move' | 'tips';
type SectionKey = 'home' | 'log' | 'meal' | 'exercise' | 'tips';
type MealType = '朝' | '昼' | '夜' | '間食';
type NutritionTag = '高たんぱく' | '食物繊維多め' | '糖質多め' | '脂質多め' | '外食' | 'アルコールあり';

type FreezerItem = {
  id: string;
  name: string;
  stocked: boolean;
  memo: string;
  expires: string;
  restock: boolean;
};

type Knowledge = {
  id: string;
  category: string;
  title: string;
  note: string;
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

type MealRecord = {
  id: string;
  type: MealType;
  tags: NutritionTag[];
  description: string;
};

type ExerciseItem = {
  id: string;
  title: string;
  description: string;
  duration: string;
  checked: boolean;
  level: '初心者向け' | '普通' | 'しっかり';
};

const defaultFreezer: FreezerItem[] = [
  { id: '1', name: '冷凍ブロッコリー', stocked: true, memo: '野菜補給に便利', expires: '2026-07-20', restock: false },
  { id: '2', name: '冷凍ほうれん草', stocked: true, memo: '', expires: '2026-07-18', restock: false },
  { id: '3', name: '冷凍きのこ', stocked: true, memo: '', expires: '2026-07-24', restock: false },
  { id: '4', name: '冷凍オクラ', stocked: false, memo: '', expires: '2026-07-15', restock: true },
  { id: '5', name: '冷凍枝豆', stocked: false, memo: '', expires: '', restock: true },
  { id: '6', name: '冷凍サバ', stocked: true, memo: 'たんぱく質補給', expires: '2026-08-01', restock: false },
  { id: '7', name: '冷凍鮭', stocked: true, memo: '', expires: '2026-07-25', restock: false },
  { id: '8', name: '冷凍鶏むね肉', stocked: true, memo: '', expires: '2026-07-28', restock: false },
  { id: '9', name: '冷凍豆腐', stocked: false, memo: '', expires: '2026-07-12', restock: true },
  { id: '10', name: '雑穀ごはん小分け冷凍', stocked: true, memo: '', expires: '2026-07-30', restock: false },
];

const defaultKnowledge: Knowledge[] = [
  { id: '1', category: '冷凍ストック', title: '冷凍野菜は常備しやすい', note: '忙しい日でも野菜不足を防ぎやすい。蒸し調理やスープに使いやすい。' },
  { id: '2', category: '冷凍ストック', title: 'たんぱく質を冷凍で備える', note: '魚・鶏むね肉・豆類を冷凍しておくと、たんぱく質不足を防ぎやすい。' },
  { id: '3', category: '冷凍ストック', title: '雑穀ごはんを小分け冷凍', note: '食べ過ぎ防止になり、炭水化物の量もコントロールしやすい。' },
  { id: '4', category: '注意点', title: '揚げ物は常備しすぎない', note: '揚げ物系の冷凍食品は習慣的な常備品にしないようにする。' },
  { id: '5', category: '注意点', title: '冷凍スイーツはたまに', note: '甘い冷凍スイーツは「たまに」にし、習慣化を避ける。' },
  { id: '6', category: '睡眠', title: '良い睡眠は改善の土台', note: '睡眠時間と質を整えることで、内臓脂肪改善に取り組みやすくなる。' },
  { id: '7', category: '食事', title: '食物繊維を取り入れる', note: '野菜や雑穀を意識すると、満足感と腸内環境をサポートできる。' },
];

const defaultMeals: MealRecord[] = [
  { id: 'm1', type: '朝', tags: ['高たんぱく', '食物繊維多め'], description: '冷凍ブロッコリーと鶏むね肉のスープ' },
  { id: 'm2', type: '昼', tags: ['高たんぱく', '外食'], description: '定食屋の焼き魚定食、雑穀ごはん小盛り' },
  { id: 'm3', type: '夜', tags: ['食物繊維多め'], description: 'ほうれん草ときのこの和え物、冷凍鮭' },
  { id: 'm4', type: '間食', tags: ['脂質多め'], description: 'ナッツ少量' },
];

const defaultExercises: ExerciseItem[] = [
  { id: 'e1', title: '20分ウォーキング', description: 'ゆったりしたペースで20分歩く。内臓脂肪対策の有酸素運動。', duration: '20分', checked: false, level: '初心者向け' },
  { id: 'e2', title: 'スクワット', description: 'ゆっくり10回×2セット。下半身を動かして代謝を高める。', duration: '10回×2', checked: false, level: '普通' },
  { id: 'e3', title: 'プランク', description: '30秒キープ×2。体幹を支え、腹囲改善をサポート。', duration: '30秒×2', checked: false, level: '普通' },
  { id: 'e4', title: 'ヒップリフト', description: '15回×2セット。お尻と腰まわりを安定させる。', duration: '15回×2', checked: false, level: '初心者向け' },
  { id: 'e5', title: 'もも上げ', description: '片足15秒×2セット。階段昇降前の準備にもなる。', duration: '片足15秒×2', checked: false, level: 'しっかり' },
];

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
  const [freezer, setFreezer] = useState<FreezerItem[]>(() => getStorage('freezer', defaultFreezer));
  const [knowledge, setKnowledge] = useState<Knowledge[]>(() => getStorage('knowledge', defaultKnowledge));
  const [records, setRecords] = useState<TodayRecord[]>(() => getStorage('records', [{
    date: todayString,
    weight: '',
    waist: '',
    bodyFat: '',
    bloodPressure: '',
    sleep: '',
    steps: '',
    alcohol: '',
    snack: '',
    bowel: '',
    mood: '',
    memo: '',
  }]));
  const [meals, setMeals] = useState<MealRecord[]>(() => getStorage('meals', defaultMeals));
  const [exercises, setExercises] = useState<ExerciseItem[]>(() => getStorage('exercises', defaultExercises));
  const [newKnowledge, setNewKnowledge] = useState({ category: '食事', title: '', note: '' });
  const [newFreezer, setNewFreezer] = useState({ name: '', memo: '', expires: '', stocked: false, restock: false });
  const [newRecord, setNewRecord] = useState<TodayRecord>({
    date: todayString,
    weight: '',
    waist: '',
    bodyFat: '',
    bloodPressure: '',
    sleep: '',
    steps: '',
    alcohol: '',
    snack: '',
    bowel: '',
    mood: '',
    memo: '',
  });

  useEffect(() => { setStorage('freezer', freezer); }, [freezer]);
  useEffect(() => { setStorage('knowledge', knowledge); }, [knowledge]);
  useEffect(() => { setStorage('records', records); }, [records]);
  useEffect(() => { setStorage('meals', meals); }, [meals]);
  useEffect(() => { setStorage('exercises', exercises); }, [exercises]);

  const todayRecord = useMemo(() => records.find((item) => item.date === todayString) ?? records[0], [records]);
  const recommendedAction = useMemo(() => {
    const actions = ['水分を意識して、冷凍野菜を活用した簡単メニューを作ろう', '本日の運動は20分ウォーキング＋スクワットで継続習慣を作る', '睡眠時間と間食を振り返って、明日の計画を立てよう'];
    return actions[Math.floor(Math.random() * actions.length)];
  }, [todayString]);

  const addKnowledge = () => {
    if (!newKnowledge.title.trim() || !newKnowledge.note.trim()) return;
    setKnowledge((prev) => [
      ...prev,
      {
        id: `k-${Date.now()}`,
        category: newKnowledge.category,
        title: newKnowledge.title,
        note: newKnowledge.note,
      },
    ]);
    setNewKnowledge({ category: '食事', title: '', note: '' });
  };

  const addFreezer = () => {
    if (!newFreezer.name.trim()) return;
    setFreezer((prev) => [
      ...prev,
      {
        id: `f-${Date.now()}`,
        name: newFreezer.name,
        stocked: newFreezer.stocked,
        memo: newFreezer.memo,
        expires: newFreezer.expires,
        restock: newFreezer.restock,
      },
    ]);
    setNewFreezer({ name: '', memo: '', expires: '', stocked: false, restock: false });
  };

  const addRecord = () => {
    setRecords((prev) => {
      const exists = prev.some((item) => item.date === newRecord.date);
      if (exists) {
        return prev.map((item) => (item.date === newRecord.date ? newRecord : item));
      }
      return [...prev, newRecord];
    });
  };

  const toggleExercise = (id: string) => {
    setExercises((prev) => prev.map((item) => item.id === id ? { ...item, checked: !item.checked } : item));
  };

  const exerciseLevels = ['初心者向け', '普通', 'しっかり'] as const;

  return (
    <div className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">内臓脂肪ダイエット</p>
          <h1>習慣で整える健康管理</h1>
          <p className="header-note">内臓脂肪・腹囲・生活習慣の改善を目指すスマホファーストなアプリです。</p>
        </div>
      </header>

      <main className="content">
        {activeTab === 'home' && (
          <section className="section-card">
            <div className="section-title">ホーム</div>
            <div className="grid-2">
              <div className="status-card">
                <h2>今日の記録</h2>
                <div className="stats-row"><span>腹囲</span><strong>{todayRecord.waist || '－'} cm</strong></div>
                <div className="stats-row"><span>体重</span><strong>{todayRecord.weight || '－'} kg</strong></div>
                <div className="stats-row"><span>睡眠</span><strong>{todayRecord.sleep || '－'} h</strong></div>
                <div className="stats-row"><span>飲酒</span><strong>{todayRecord.alcohol || '－'}</strong></div>
              </div>
              <div className="status-card light">
                <h2>今日のおすすめ</h2>
                <p>{recommendedAction}</p>
                <div className="mini-task">
                  <span>今日はこれだけやればOK</span>
                  <ul>
                    <li>朝の冷凍野菜を使った一品</li>
                    <li>15分の運動 + 20分の歩行</li>
                    <li>水分補給を意識</li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="section-card">
              <h2>今日の記録</h2>
              <div className="summary-row">
                <div><span>食事</span><strong>{meals.length}件</strong></div>
                <div><span>運動</span><strong>{exercises.filter((item) => item.checked).length}/{exercises.length}</strong></div>
                <div><span>水分</span><strong>目標を意識</strong></div>
              </div>
            </div>
          </section>
        )}

        {activeTab === 'log' && (
          <section className="section-card">
            <div className="section-title">記録</div>
            <div className="form-grid">
              {([
                { key: 'weight', label: '体重 (kg)' },
                { key: 'waist', label: '腹囲 (cm)' },
                { key: 'bodyFat', label: '体脂肪率 (%)' },
                { key: 'bloodPressure', label: '血圧' },
                { key: 'sleep', label: '睡眠時間 (h)' },
                { key: 'steps', label: '歩数' },
                { key: 'alcohol', label: '飲酒量' },
                { key: 'snack', label: '間食' },
                { key: 'bowel', label: '便通' },
                { key: 'mood', label: '気分' },
              ] as const).map((input) => (
                <label key={input.key} className="field">
                  <span>{input.label}</span>
                  <input
                    value={(newRecord as any)[input.key]}
                    onChange={(e) => setNewRecord({ ...newRecord, [input.key]: e.target.value })}
                    placeholder="入力または更新"
                  />
                </label>
              ))}
              <label className="field field-full">
                <span>メモ</span>
                <textarea
                  value={newRecord.memo}
                  onChange={(e) => setNewRecord({ ...newRecord, memo: e.target.value })}
                  placeholder="今日の体調や気づき"
                />
              </label>
            </div>
            <button className="primary-button" onClick={addRecord}>今日の記録を保存</button>
            <div className="log-list">
              {records.slice().reverse().map((item) => (
                <div key={item.date} className="log-item">
                  <div className="log-item-header"><strong>{item.date}</strong><span>{item.memo || '習慣を記録しましょう'}</span></div>
                  <div className="mini-grid">
                    <div>体重: {item.weight || '－'}</div>
                    <div>腹囲: {item.waist || '－'}</div>
                    <div>睡眠: {item.sleep || '－'}</div>
                    <div>飲酒: {item.alcohol || '－'}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'meal' && (
          <section className="section-card">
            <div className="section-title">食事管理</div>
            <div className="card-group">
              {['朝', '昼', '夜', '間食'].map((mealType) => (
                <div key={mealType} className="meal-card">
                  <h3>{mealType}</h3>
                  {meals.filter((meal) => meal.type === mealType).map((meal) => (
                    <div key={meal.id} className="meal-item">
                      <div>{meal.description}</div>
                      <div className="meal-tags">{meal.tags.join('・')}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
            <div className="section-card light">
              <h2>1週間の献立例</h2>
              <ul className="tips-list">
                <li>月：雑穀ごはんと鮭、冷凍野菜の煮物</li>
                <li>火：鶏むね肉の塩麹焼きと枝豆サラダ</li>
                <li>水：きのこたっぷり和風パスタとスープ</li>
                <li>木：冷凍豆腐と野菜の炒め物</li>
                <li>金：サバの塩焼き、温野菜と雑穀ごはん</li>
                <li>土：外食は定食屋で魚中心、野菜多め</li>
                <li>日：冷凍野菜を使ったスムージーとタンパク質</li>
              </ul>
            </div>
            <div className="section-card">
              <h2>冷凍庫ストック管理</h2>
              <div className="form-grid">
                <label className="field">
                  <span>商品名</span>
                  <input value={newFreezer.name} onChange={(e) => setNewFreezer({ ...newFreezer, name: e.target.value })} placeholder="例: 冷凍ブロッコリー" />
                </label>
                <label className="field">
                  <span>メモ</span>
                  <input value={newFreezer.memo} onChange={(e) => setNewFreezer({ ...newFreezer, memo: e.target.value })} placeholder="使い方や注意点" />
                </label>
                <label className="field">
                  <span>使い切り期限</span>
                  <input type="date" value={newFreezer.expires} onChange={(e) => setNewFreezer({ ...newFreezer, expires: e.target.value })} />
                </label>
                <label className="field">
                  <span>在庫</span>
                  <select value={newFreezer.stocked ? 'あり' : 'なし'} onChange={(e) => setNewFreezer({ ...newFreezer, stocked: e.target.value === 'あり' })}>
                    <option value="あり">あり</option>
                    <option value="なし">なし</option>
                  </select>
                </label>
                <label className="field">
                  <span>買い足しチェック</span>
                  <select value={newFreezer.restock ? 'yes' : 'no'} onChange={(e) => setNewFreezer({ ...newFreezer, restock: e.target.value === 'yes' })}>
                    <option value="no">不要</option>
                    <option value="yes">要購入</option>
                  </select>
                </label>
              </div>
              <button className="primary-button" onClick={addFreezer}>ストックを追加</button>
              <div className="log-list">
                {freezer.map((item) => (
                  <div key={item.id} className="log-item">
                    <div className="log-item-header">
                      <strong>{item.name}</strong>
                      <span>{item.stocked ? '在庫あり' : '在庫なし'}</span>
                    </div>
                    <div className="mini-grid">
                      <div>期限: {item.expires || '未設定'}</div>
                      <div>買い足し: {item.restock ? '必要' : '不要'}</div>
                      <div className="meal-tags">{item.memo || 'メモなし'}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {activeTab === 'move' && (
          <section className="section-card">
            <div className="section-title">運動</div>
            <div className="exercise-grid">
              {exerciseLevels.map((level) => (
                <div key={level} className="level-card">
                  <h3>{level}</h3>
                  <p>内臓脂肪対策の基本を押さえた運動プラン。</p>
                </div>
              ))}
            </div>
            <div className="exercise-list">
              {exercises.map((item) => (
                <div key={item.id} className="exercise-item">
                  <div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                    <small>{item.duration}・{item.level}</small>
                  </div>
                  <button className={item.checked ? 'secondary-button checked' : 'secondary-button'} onClick={() => toggleExercise(item.id)}>
                    {item.checked ? '完了' : '実施'}
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'tips' && (
          <section className="section-card">
            <div className="section-title">豆知識フォルダ</div>
            <div className="form-grid">
              <label className="field">
                <span>カテゴリ</span>
                <select value={newKnowledge.category} onChange={(e) => setNewKnowledge({ ...newKnowledge, category: e.target.value })}>
                  <option>食事</option>
                  <option>運動</option>
                  <option>冷凍ストック</option>
                  <option>注意点</option>
                  <option>外食</option>
                  <option>飲酒</option>
                  <option>睡眠</option>
                </select>
              </label>
              <label className="field">
                <span>タイトル</span>
                <input value={newKnowledge.title} onChange={(e) => setNewKnowledge({ ...newKnowledge, title: e.target.value })} placeholder="豆知識のタイトル" />
              </label>
              <label className="field field-full">
                <span>詳細</span>
                <textarea value={newKnowledge.note} onChange={(e) => setNewKnowledge({ ...newKnowledge, note: e.target.value })} placeholder="詳しいメモを入力" />
              </label>
            </div>
            <button className="primary-button" onClick={addKnowledge}>豆知識を追加</button>
            <div className="knowledge-list">
              {knowledge.map((item) => (
                <div key={item.id} className="knowledge-item">
                  <div>
                    <div className="tag">{item.category}</div>
                    <h3>{item.title}</h3>
                    <p>{item.note}</p>
                  </div>
                  <button className="tertiary-button" onClick={() => setKnowledge((prev) => prev.filter((value) => value.id !== item.id))}>削除</button>
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
