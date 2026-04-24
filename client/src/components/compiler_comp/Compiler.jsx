import React, { useState } from 'react'
import Web from './web_comp/Web'
import Acecompiler_main from './ace_compiler/Acecompiler_main'

const compilerModes = [
  {
    id: 'comp',
    label: 'Code Runner',
    eyebrow: 'Backend execution',
    description: 'Run C++, JavaScript, and Python with custom stdin and a clean output panel.',
  },
  {
    id: 'web',
    label: 'Web Lab',
    eyebrow: 'Live frontend',
    description: 'Build HTML, CSS, and JavaScript side by side with an instant preview surface.',
  },
]

function Compiler() {
  const [selectedComp, setSelectedComp] = useState('comp')

  return (
    <div className="mx-auto w-[96%] max-w-[1500px] px-4 pb-10 pt-6 lg:px-6">
      <section className="theme-panel rounded-lg border px-5 py-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="theme-badge inline-flex rounded-full px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em]">
              Interactive Compiler
            </div>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight lg:text-5xl">Write, run, preview, iterate.</h1>
            <p className="theme-text-muted mt-4 max-w-2xl text-sm leading-7 lg:text-base">
              The compiler workspace now follows the same premium surface language as the rest of DevLabs. Choose a mode,
              focus on the editor, and keep your input, output, and preview close without visual clutter.
            </p>
          </div>


        </div>

        <div className="mt-8 grid gap-3 lg:grid-cols-2">
          {compilerModes.map((mode) => {
            const isActive = selectedComp === mode.id

            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setSelectedComp(mode.id)}
                className={`rounded-lg border px-5 py-5 text-left transition ${
                  isActive ? 'theme-button-primary' : 'theme-soft-surface'
                }`}
              >
                <div className={`text-[10px] uppercase tracking-[0.22em] ${isActive ? 'opacity-75' : 'theme-text-subtle'}`}>
                  {mode.eyebrow}
                </div>
                <div className="mt-2 text-xl font-semibold">{mode.label}</div>
                <div className={`mt-2 text-sm leading-6 ${isActive ? 'opacity-85' : 'theme-text-muted'}`}>{mode.description}</div>
              </button>
            )
          })}
        </div>
      </section>

      <div className="mt-6">
        {selectedComp === 'comp' ? <Acecompiler_main /> : <Web />}
      </div>
    </div>
  )
}

export default Compiler

