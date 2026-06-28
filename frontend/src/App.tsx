import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Button } from './components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import keyIcon from './assets/key.png';
import closedChest from './assets/treasure_closed.png';
import treasureChest from './assets/treasure_opened.png';
import skeletonChest from './assets/treasure_opened_skeleton.png';
import chestOpenSound from './audios/chest_open.mp3';
import evilLaughSound from './audios/chest_open_with_evil_laugh.mp3';
import { login, register, saveScore, getMyScores, ScoreRecord } from './lib/api';

interface Box {
  id: number;
  isOpen: boolean;
  hasTreasure: boolean;
}

export default function App() {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [score, setScore] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);

  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register' | null>(null);
  const [authUsername, setAuthUsername] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [scoreHistory, setScoreHistory] = useState<ScoreRecord[]>([]);

  const initializeGame = () => {
    const treasureBoxIndex = Math.floor(Math.random() * 3);
    const newBoxes: Box[] = Array.from({ length: 3 }, (_, index) => ({
      id: index,
      isOpen: false,
      hasTreasure: index === treasureBoxIndex,
    }));
    setBoxes(newBoxes);
    setScore(0);
    setGameEnded(false);
  };

  useEffect(() => {
    initializeGame();
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('username');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setCurrentUser(savedUser);
      fetchScores(savedToken);
    }
  }, []);

  const fetchScores = async (t: string) => {
    try {
      const data = await getMyScores(t);
      setScoreHistory(data);
    } catch {
      // ignore
    }
  };

  const openBox = (boxId: number) => {
    if (gameEnded) return;

    setBoxes(prevBoxes => {
      const updatedBoxes = prevBoxes.map(box => {
        if (box.id === boxId && !box.isOpen) {
          new Audio(box.hasTreasure ? chestOpenSound : evilLaughSound).play();
          const newScore = box.hasTreasure ? score + 200 : score - 50;
          setScore(newScore);
          return { ...box, isOpen: true };
        }
        return box;
      });

      const treasureFound = updatedBoxes.some(box => box.isOpen && box.hasTreasure);
      const allOpened = updatedBoxes.every(box => box.isOpen);
      if (treasureFound || allOpened) {
        setGameEnded(true);
      }

      return updatedBoxes;
    });
  };

  useEffect(() => {
    if (!gameEnded || !token) return;
    const result = score > 0 ? 'win' : score === 0 ? 'tie' : 'loss';
    saveScore(score, result, token).then(() => fetchScores(token)).catch(() => {});
  }, [gameEnded]);

  const handleAuth = async () => {
    setAuthError('');
    try {
      const fn = authView === 'login' ? login : register;
      const res = await fn(authUsername, authPassword);
      localStorage.setItem('token', res.token);
      localStorage.setItem('username', res.username);
      setToken(res.token);
      setCurrentUser(res.username);
      setAuthView(null);
      setAuthUsername('');
      setAuthPassword('');
      fetchScores(res.token);
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : '發生錯誤');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setCurrentUser(null);
    setScoreHistory([]);
  };

  const openAuthDialog = (view: 'login' | 'register') => {
    setAuthView(view);
    setAuthError('');
    setAuthUsername('');
    setAuthPassword('');
  };

  const resultLabel = (r: string) =>
    r === 'win' ? '贏' : r === 'tie' ? '平' : '輸';

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-8">

      {/* Header */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {currentUser ? (
          <>
            <span className="text-amber-800 text-sm">👤 {currentUser}</span>
            <Button variant="outline" size="sm" onClick={handleLogout} className="text-amber-700 border-amber-400">
              登出
            </Button>
          </>
        ) : (
          <>
            <Button variant="outline" size="sm" onClick={() => openAuthDialog('login')} className="text-amber-700 border-amber-400">
              登入
            </Button>
            <Button variant="outline" size="sm" onClick={() => openAuthDialog('register')} className="text-amber-700 border-amber-400">
              註冊
            </Button>
          </>
        )}
      </div>

      {/* Auth Dialog */}
      <Dialog open={authView !== null} onOpenChange={(open) => !open && setAuthView(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{authView === 'login' ? '登入' : '註冊'}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="username">帳號</Label>
              <Input
                id="username"
                value={authUsername}
                onChange={e => setAuthUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
                placeholder="輸入帳號"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="password">密碼</Label>
              <Input
                id="password"
                type="password"
                value={authPassword}
                onChange={e => setAuthPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
                placeholder="輸入密碼"
              />
            </div>
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <Button onClick={handleAuth} className="bg-amber-600 hover:bg-amber-700 text-white">
              {authView === 'login' ? '登入' : '註冊'}
            </Button>
            <button
              className="text-amber-700 text-sm underline text-center"
              onClick={() => openAuthDialog(authView === 'login' ? 'register' : 'login')}
            >
              {authView === 'login' ? '還沒有帳號？點此註冊' : '已有帳號？點此登入'}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <div className="text-center mb-8">
        <h1 className="text-4xl mb-4 text-amber-900">🏴‍☠️ Treasure Hunt Game 🏴‍☠️</h1>
        <p className="text-amber-800 mb-4">
          Click on the treasure chests to discover what's inside!
        </p>
        <p className="text-amber-700 text-sm">
          💰 Treasure: +$200 | 💀 Skeleton: -$50
        </p>
      </div>

      <div className="mb-8">
        <div className="text-2xl text-center p-4 bg-amber-200/80 backdrop-blur-sm rounded-lg shadow-lg border-2 border-amber-400 flex items-center justify-center gap-4">
          <span className="text-amber-900">Current Score: </span>
          <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            ${score}
          </span>
          {gameEnded && (
            <span className={`text-xl font-bold px-3 py-1 rounded-lg ${
              score > 0 ? 'bg-green-100 text-green-700 border border-green-400' :
              score === 0 ? 'bg-gray-100 text-gray-600 border border-gray-400' :
              'bg-red-100 text-red-700 border border-red-400'
            }`}>
              {score > 0 ? '贏' : score === 0 ? '平' : '輸'}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {boxes.map((box) => (
          <motion.div
            key={box.id}
            className="flex flex-col items-center"
            style={{ cursor: box.isOpen ? 'default' : `url(${keyIcon}) 16 16, pointer` }}
            whileHover={{ scale: box.isOpen ? 1 : 1.05 }}
            whileTap={{ scale: box.isOpen ? 1 : 0.95 }}
            onClick={() => openBox(box.id)}
          >
            <motion.div
              initial={{ rotateY: 0 }}
              animate={{
                rotateY: box.isOpen ? 180 : 0,
                scale: box.isOpen ? 1.1 : 1
              }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="relative"
            >
              <img
                src={box.isOpen ? (box.hasTreasure ? treasureChest : skeletonChest) : closedChest}
                alt={box.isOpen ? (box.hasTreasure ? "Treasure!" : "Skeleton!") : "Treasure Chest"}
                className="w-48 h-48 object-contain drop-shadow-lg"
              />
              {box.isOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                >
                  {box.hasTreasure ? (
                    <div className="text-2xl animate-bounce">✨💰✨</div>
                  ) : (
                    <div className="text-2xl animate-pulse">💀👻💀</div>
                  )}
                </motion.div>
              )}
            </motion.div>

            <div className="mt-4 text-center">
              {box.isOpen ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                  className={`text-lg p-2 rounded-lg ${
                    box.hasTreasure
                      ? 'bg-green-100 text-green-800 border border-green-300'
                      : 'bg-red-100 text-red-800 border border-red-300'
                  }`}
                >
                  {box.hasTreasure ? '+$200' : '-$50'}
                </motion.div>
              ) : (
                <div className="text-amber-700 p-2">Click to open!</div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {gameEnded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="mb-4 p-6 bg-amber-200/80 backdrop-blur-sm rounded-xl shadow-lg border-2 border-amber-400">
            <h2 className="text-2xl mb-2 text-amber-900">Game Over!</h2>
            <p className="text-lg text-amber-800">
              Final Score:{' '}
              <span className={`${score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${score}
              </span>
            </p>
            <p className="text-sm text-amber-600 mt-2">
              {boxes.some(box => box.isOpen && box.hasTreasure)
                ? 'Treasure found! Well done, treasure hunter! 🎉'
                : 'No treasure found this time! Better luck next time! 💀'}
            </p>
            {!currentUser && (
              <p className="text-sm text-amber-500 mt-2">
                <button className="underline" onClick={() => openAuthDialog('register')}>註冊</button>
                {' '}或{' '}
                <button className="underline" onClick={() => openAuthDialog('login')}>登入</button>
                {' '}以儲存分數紀錄
              </p>
            )}
          </div>

          <Button
            onClick={initializeGame}
            className="text-lg px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white"
          >
            Play Again
          </Button>
        </motion.div>
      )}

      {/* Score History */}
      {currentUser && scoreHistory.length > 0 && (
        <div className="mt-10 w-full max-w-md">
          <h3 className="text-lg font-semibold text-amber-900 mb-3 text-center">📋 歷史紀錄</h3>
          <div className="bg-amber-200/80 backdrop-blur-sm rounded-xl border-2 border-amber-400 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-amber-300/60 text-amber-900">
                  <th className="py-2 px-3 text-left">日期</th>
                  <th className="py-2 px-3 text-center">結果</th>
                  <th className="py-2 px-3 text-right">分數</th>
                </tr>
              </thead>
              <tbody>
                {scoreHistory.map((s, i) => (
                  <tr key={i} className="border-t border-amber-300/50 text-amber-800">
                    <td className="py-2 px-3">{new Date(s.created_at).toLocaleDateString('zh-TW')}</td>
                    <td className="py-2 px-3 text-center">
                      <span className={`font-bold ${
                        s.result === 'win' ? 'text-green-600' :
                        s.result === 'tie' ? 'text-gray-600' : 'text-red-600'
                      }`}>
                        {resultLabel(s.result)}
                      </span>
                    </td>
                    <td className={`py-2 px-3 text-right font-mono ${s.score >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      ${s.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
