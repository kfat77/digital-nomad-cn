import { useState, useCallback } from 'react';
import { calculateEquity } from './wasm';

function App() {
    const [hero, setHero] = useState('AsKs');
    const [villain, setVillain] = useState('QdQc');
    const [board, setBoard] = useState('');
    const [exact, setExact] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCalculate = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await calculateEquity(hero, villain, board, exact);
            setResult(res);
        } catch (e: any) {
            setError(e.toString());
        } finally {
            setLoading(false);
        }
    }, [hero, villain, board, exact]);

    return (
        <div style={{ maxWidth: 600, margin: '0 auto', padding: 20, fontFamily: 'system-ui, sans-serif' }}>
            <h1 style={{ textAlign: 'center', color: '#1a1a2e' }}>♠️ OpenPoker</h1>
            <p style={{ textAlign: 'center', color: '#666' }}>WASM-powered Equity Calculator</p>

            <div style={{ background: '#f8f9fa', padding: 20, borderRadius: 12, marginTop: 20 }}>
                <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Hero Hand</label>
                    <input
                        value={hero}
                        onChange={e => setHero(e.target.value)}
                        placeholder="e.g. AsKs"
                        style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd', fontSize: 16 }}
                    />
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Villain Hand</label>
                    <input
                        value={villain}
                        onChange={e => setVillain(e.target.value)}
                        placeholder="e.g. QdQc"
                        style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd', fontSize: 16 }}
                    />
                </div>

                <div style={{ marginBottom: 12 }}>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: 4 }}>Board (optional)</label>
                    <input
                        value={board}
                        onChange={e => setBoard(e.target.value)}
                        placeholder="e.g. TsJs2h"
                        style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #ddd', fontSize: 16 }}
                    />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, cursor: 'pointer' }}>
                    <input type="checkbox" checked={exact} onChange={e => setExact(e.target.checked)} />
                    <span>Force exact enumeration</span>
                </label>

                <button
                    onClick={handleCalculate}
                    disabled={loading}
                    style={{
                        width: '100%', padding: 12, borderRadius: 6, border: 'none',
                        background: loading ? '#999' : '#e94560', color: 'white',
                        fontSize: 16, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Calculating...' : 'Calculate Equity'}
                </button>

                {error && (
                    <div style={{ marginTop: 12, padding: 10, background: '#ffe0e0', borderRadius: 6, color: '#c00' }}>
                        {error}
                    </div>
                )}

                {result && (
                    <div style={{ marginTop: 20, padding: 16, background: '#1a1a2e', borderRadius: 12, color: 'white' }}>
                        <h3 style={{ margin: '0 0 12px 0', textAlign: 'center' }}>Equity Result</h3>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span>Hero Equity:</span>
                            <span style={{ fontWeight: 700, color: '#4ecca3' }}>{(result.hero_equity * 100).toFixed(2)}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span>Villain Equity:</span>
                            <span style={{ fontWeight: 700, color: '#e94560' }}>{(result.villain_equity * 100).toFixed(2)}%</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                            <span>Method:</span>
                            <span>{result.is_exact ? 'Exact' : 'Monte Carlo'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span>Sample Size:</span>
                            <span>{result.sample_size.toLocaleString()}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;
