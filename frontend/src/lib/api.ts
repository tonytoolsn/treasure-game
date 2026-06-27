export interface ScoreRecord {
  score: number;
  result: 'win' | 'tie' | 'loss';
  created_at: string;
}

async function request(path: string, options: RequestInit = {}) {
  const { headers: optHeaders, ...rest } = options;
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...optHeaders },
    ...rest,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '請求失敗');
  return data;
}

export async function register(username: string, password: string): Promise<{ token: string; username: string }> {
  return request('/api/auth/register', { method: 'POST', body: JSON.stringify({ username, password }) });
}

export async function login(username: string, password: string): Promise<{ token: string; username: string }> {
  return request('/api/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) });
}

export async function saveScore(score: number, result: string, token: string): Promise<void> {
  return request('/api/scores', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: JSON.stringify({ score, result }),
  });
}

export async function getMyScores(token: string): Promise<ScoreRecord[]> {
  return request('/api/scores/me', { headers: { Authorization: `Bearer ${token}` } });
}
