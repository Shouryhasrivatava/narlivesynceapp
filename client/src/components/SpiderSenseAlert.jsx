import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, Zap, CheckCircle2, Info, X } from 'lucide-react';

export const SpiderSenseAlert = ({ alert, onClose }) => {
  if (!alert) return null;

  const isError = alert.type === 'error';
  const isSuccess = alert.type === 'success';

  return (
    <AnimatePresence>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-lg pointer-events-none">
        {/* Visual Spider-Sense Lines (Iconic wavy lines radiating) */}
        {isError && (
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center gap-1 spider-sense-active pointer-events-none">
            <span className="text-spidey-red text-2xl font-black">⚡</span>
            <span className="text-spidey-yellow text-3xl font-black">⚡</span>
            <span className="font-headline text-spidey-red bg-spidey-yellow px-2 py-0.5 border-2 border-black tracking-wider text-sm shadow-comic-sm">
              SPIDER-SENSE TINGLING!
            </span>
            <span className="text-spidey-yellow text-3xl font-black">⚡</span>
            <span className="text-spidey-red text-2xl font-black">⚡</span>
          </div>
        )}

        <motion.div
          initial={{ y: -50, scale: 0.8, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: -50, scale: 0.8, opacity: 0 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className={`pointer-events-auto mt-4 p-4 border-4 border-spidey-black shadow-comic-lg ${
            isError
              ? 'bg-spidey-red text-white'
              : isSuccess
              ? 'bg-spidey-yellow text-spidey-black'
              : 'bg-spidey-lightBlue text-spidey-black'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white text-spidey-black border-2 border-black rounded-sm shadow-comic-sm">
                {isError ? (
                  <AlertTriangle className="w-6 h-6 text-spidey-red stroke-[2.5]" />
                ) : isSuccess ? (
                  <CheckCircle2 className="w-6 h-6 text-green-600 stroke-[2.5]" />
                ) : (
                  <Zap className="w-6 h-6 text-spidey-blue stroke-[2.5]" />
                )}
              </div>
              <div>
                <h4 className="font-headline tracking-wide text-lg md:text-xl uppercase">
                  {alert.title || (isError ? 'VILLAIN INTERRUPTION!' : isSuccess ? 'EXCELSIOR!' : 'NOTICE')}
                </h4>
                <p className="font-comic font-bold text-sm md:text-base leading-snug">
                  {alert.message}
                </p>
                {alert.errors && alert.errors.length > 0 && (
                  <ul className="mt-2 list-disc list-inside text-xs font-sans bg-black/10 p-2 border border-black/20 rounded">
                    {alert.errors.map((err, idx) => (
                      <li key={idx} className="font-bold">{err}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 text-current hover:opacity-75 transition-opacity"
              aria-label="Close Alert"
            >
              <X className="w-6 h-6 stroke-[3]" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
