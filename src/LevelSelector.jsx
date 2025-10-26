import React from 'react';

export default function LevelSelector({ levels, onSelect }) {
  return (
    <div>
      <h2>Seleziona un livello</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {levels.map(level => (
          <div
            key={level.id}
            onClick={() => onSelect(level.id)}
            style={{
              width: '100px',
              height: '100px',
              backgroundColor: '#FFD700',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              cursor: 'pointer',
              borderRadius: '10px',
              boxShadow: '2px 2px 5px rgba(0,0,0,0.3)',
              fontWeight: 'bold',
              fontSize: '20px',
            }}
          >
            Lvl {level.id}
          </div>
        ))}
      </div>
    </div>
  );
}
