import { useState } from "react";
import { Coffee } from "lucide-react";
import { ThemeProvider } from "./contexts/ThemeContext";
import Header from "./components/Header";
import HomePanel from "./components/HomePanel";
import TeacherGuidePanel from "./components/TeacherGuidePanel";
import LabWorksheetPanel from "./components/LabWorksheetPanel";
import CasimirPanel from "./components/CasimirPanel";
import RotatingFieldPanel from "./components/RotatingFieldPanel";
import CavityCouplingPanel from "./components/CavityCouplingPanel";
import NmCavityPanel from "./components/NmCavityPanel";
import NonlinearCouplingPanel from "./components/NonlinearCouplingPanel";
import DeviceModelPanel from "./components/DeviceModelPanel";
import DiagnosticPanel from "./components/DiagnosticPanel";
import ThrustDiagnosticPanel from "./components/ThrustDiagnosticPanel";

const TABS = [
  {
    id: "home",
    label: "Home",
    description: "Welcome to the simulator – start here",
  },
  {
    id: "teacher",
    label: "Teacher's Guide",
    description: "Structured lesson plans for classroom use",
  },
  {
    id: "worksheet",
    label: "Lab Worksheet",
    description: "Interactive experiments and challenges",
  },
  {
    id: "casimir",
    label: "Casimir Effect",
    description: "Vacuum force between parallel conducting plates",
  },
  {
    id: "rotating",
    label: "Rotating Field",
    description: "Circularly polarized wave propagation",
  },
  {
    id: "coupling",
    label: "Cavity Coupling",
    description: "Resonant coupling and Lorentzian response (RF/acoustic scale)",
  },
  {
    id: "nm-cavity",
    label: "nm-Cavity (Optical)",
    description:
      "Nanometre-gap cavity with resonance in the optical / UV band",
  },
  {
    id: "nonlinear",
    label: "Non-linear Coupling (Up-conversion)",
    description:
      "Bessel-sideband frequency comb from modulating an optical carrier at fₘ",
  },
  {
    id: "device",
    label: "Device Model — Power from Vacuum",
    description:
      "End-to-end prediction combining Casimir gap, rotor drive and Bessel up-conversion, with experimental claim overlay",
  },
  {
    id: "diagnostic",
    label: "Leakage & Artifact Diagnostic",
    description:
      "Quantitative leakage budget: compare a claimed output against ohmic, RF, blackbody and mechanical channels to isolate any true residual",
  },
  {
    id: "thrust",
    label: "Thrust & Weight Diagnostic",
    description:
      "Quantitative force-artifact budget: compare a claimed weight change against ion wind, vibration, electrostatic, and thermal convection channels",
  },
];

function AppContent() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="min-h-screen">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r dark-mode:from-cyan-400 dark-mode:to-blue-400 light-mode:from-blue-600 light-mode:to-cyan-600 coffee-mode:from-amber-500 coffee-mode:to-orange-600 bg-clip-text text-transparent mb-3">
            Quantum Vacuum &amp; Cavity Physics
          </h1>
          <p className="dark-mode:text-slate-400 light-mode:text-slate-700 coffee-mode:text-amber-700 max-w-3xl text-lg leading-relaxed">
            Honest numerical simulations of the Casimir effect, rotating polarization waves, and resonant cavity coupling. Compare claimed outputs against quantifiable leakage channels.
          </p>
          <div className="mt-6 max-w-3xl card-bg px-5 py-4 text-sm leading-relaxed dark-mode:border-cyan-500/20 dark-mode:bg-cyan-600/5 dark-mode:text-cyan-100/80 light-mode:border-blue-200/50 light-mode:bg-blue-50/60 light-mode:text-blue-900 coffee-mode:border-amber-600/30 coffee-mode:bg-amber-900/20 coffee-mode:text-amber-100">
            <span className="font-semibold dark-mode:text-cyan-300 light-mode:text-blue-600 coffee-mode:text-amber-200">New here?</span> Each tab below is a mini experiment. Drag the sliders to change the inputs and watch the numbers and charts update live. Every panel has a "In plain English" box at the top that explains what's going on without any jargon.
          </div>
        </div>

        <nav className="flex flex-wrap gap-2 mb-8 p-2 panel-bg rounded-xl border" role="tablist" aria-label="Simulator sections">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              role="tab"
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "button-primary shadow-lg"
                  : "dark-mode:text-slate-300 dark-mode:hover:text-slate-100 dark-mode:hover:bg-slate-800/50 light-mode:text-slate-600 light-mode:hover:text-slate-900 light-mode:hover:bg-slate-100 coffee-mode:text-amber-100 coffee-mode:hover:text-amber-50 coffee-mode:hover:bg-amber-900/40"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="mb-6">
          {TABS.filter((t) => t.id === activeTab).map((tab) => (
            <p key={tab.id} className="text-sm dark-mode:text-slate-500 light-mode:text-slate-700 coffee-mode:text-amber-700">
              {tab.description}
            </p>
          ))}
        </div>

        <section className="min-h-[600px]" role="tabpanel" id={`panel-${activeTab}`}>
          {activeTab === "home" && <HomePanel />}
          {activeTab === "teacher" && <TeacherGuidePanel />}
          {activeTab === "worksheet" && <LabWorksheetPanel />}
          {activeTab === "casimir" && <CasimirPanel />}
          {activeTab === "rotating" && <RotatingFieldPanel />}
          {activeTab === "coupling" && <CavityCouplingPanel />}
          {activeTab === "nm-cavity" && <NmCavityPanel />}
          {activeTab === "nonlinear" && <NonlinearCouplingPanel />}
          {activeTab === "device" && <DeviceModelPanel />}
          {activeTab === "diagnostic" && <DiagnosticPanel />}
          {activeTab === "thrust" && <ThrustDiagnosticPanel />}
        </section>

        <footer className="mt-20 pt-8 dark-mode:border-slate-800/50 light-mode:border-slate-200 coffee-mode:border-amber-800/40 border-t">
          <div className="space-y-6">
            <div className="text-xs dark-mode:text-slate-500 light-mode:text-slate-700 coffee-mode:text-amber-700 space-y-1.5">
              <p>Casimir force formula: F/A = −π²ℏc / (240 d⁴) — Casimir (1948), Proc. Kon. Ned. Akad. Wetensch. 51, 793.</p>
              <p>Experimental confirmation: Lamoreaux (1997) PRL 78, 5; Mohideen &amp; Roy (1998) PRL 81, 4549.</p>
              <p>Cavity QED field enhancement: Haroche &amp; Raimond, "Exploring the Quantum", Oxford UP (2006).</p>
            </div>
            <div className="pt-4 dark-mode:border-slate-800/40 light-mode:border-slate-200 coffee-mode:border-amber-800/30 border-t">
              <a
                href="https://www.paypal.com/paypalme/2r0v3"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg button-primary text-xs font-medium"
              >
                <Coffee className="w-4 h-4" />
                Buy me a coffee
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
