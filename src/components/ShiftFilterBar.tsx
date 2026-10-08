import React from 'react';
import { motion } from 'framer-motion';
import { ViewPerspective } from '../types/shift';
import { Users, User, Heart, Sun } from 'lucide-react';

interface Props {
  currentPerspective: ViewPerspective;
  onChange: (p: ViewPerspective) => void;
  userNames: { userNameA: string; userNameB: string; currentUserRole: 'A' | 'B' };
}

export const ShiftFilterBar: React.FC<Props> = ({ currentPerspective, onChange, userNames }) => {
  const meName = userNames.currentUserRole === 'A' ? userNames.userNameA : userNames.userNameB;
  const partnerName = userNames.currentUserRole === 'A' ? userNames.userNameB : userNames.userNameA;

  return (
    <div className="liquid-glass-capsule p-1.5 rounded-full flex items-center justify-between text-xs mb-2 shadow-lg mx-4">
      <span className="text-[9px] text-white/90 font-bold pl-2.5 tracking-wider uppercase">透视视角:</span>
      <div className="flex items-center gap-0.5">
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
          onClick={() => onChange('both')}
          className={`px-2.5 py-1 rounded-full text-[10px] motion-liquid-pill flex items-center gap-1 ${
            currentPerspective === 'both' ? 'liquid-droplet-active' : 'text-white/90 hover:text-white'
          }`}
        >
          <Users className="w-3 h-3" />
          <span>全显</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
          onClick={() => onChange('me')}
          className={`px-2.5 py-1 rounded-full text-[10px] motion-liquid-pill flex items-center gap-1 truncate max-w-[60px] ${
            currentPerspective === 'me' ? 'liquid-droplet-active' : 'text-white/90 hover:text-white'
          }`}
        >
          <User className="w-3 h-3 text-sunrise-500" />
          <span className="truncate">{meName}</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
          onClick={() => onChange('partner')}
          className={`px-2.5 py-1 rounded-full text-[10px] motion-liquid-pill flex items-center gap-1 truncate max-w-[60px] ${
            currentPerspective === 'partner' ? 'liquid-droplet-active' : 'text-white/90 hover:text-white'
          }`}
        >
          <Heart className="w-3 h-3 text-tealpartner-500" />
          <span className="truncate">{partnerName}</span>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
          onClick={() => onChange('together')}
          className={`px-2.5 py-1 rounded-full text-[10px] motion-liquid-pill flex items-center gap-0.5 font-bold ${
            currentPerspective === 'together' ? 'liquid-droplet-active' : 'text-white/90 hover:text-white'
          }`}
        >
          <Sun className="w-3 h-3 text-rose-500 motion-sun-spin" />
          <span>同休</span>
        </motion.button>
      </div>
    </div>
  );
};
