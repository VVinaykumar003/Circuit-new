import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  MdDashboard,
  MdLightMode,
  MdDarkMode,
  MdArrowForward,
  MdInsertChartOutlined,
  MdPrecisionManufacturing,
  MdShoppingCart,
  MdInventory2,
  MdPeopleAlt,
  MdLocalShipping,
  MdBolt,
  MdSecurity,
  MdPublic,
  MdCloudSync,
  MdStar
} from "react-icons/md";

const NAV_LINKS = ["Features", "Modules", "Pricing", "About", "Contact"];

const MODULES = [
  { icon: <MdInsertChartOutlined />, title: "Finance & Accounting", desc: "Real-time P&L, ledgers, invoicing, tax compliance" },
  { icon: <MdPrecisionManufacturing />, title: "Manufacturing", desc: "Production planning, BOM, work orders, quality control" },
  { icon: <MdShoppingCart />, title: "Sales & CRM", desc: "Lead tracking, pipeline, quotations, customer portal" },
  { icon: <MdInventory2 />, title: "Inventory", desc: "Multi-warehouse, lot tracking, reorder automation" },
  { icon: <MdPeopleAlt />, title: "Human Resources", desc: "Payroll, attendance, leave, performance reviews" },
  { icon: <MdLocalShipping />, title: "Supply Chain", desc: "Vendor management, procurement, demand forecasting" },
];

const STATS = [
  { value: "10K+", label: "Active Businesses" },
  { value: "98.9%", label: "Uptime SLA" },
  { value: "150+", label: "Countries" },
  { value: "4.9★", label: "Customer Rating" },
];

const TESTIMONIALS = [
  { name: "Priya Sharma", role: "CFO, TechVentures India", text: "Transformed our entire back-office. Reconciliation that took days now finishes in minutes.", avatar: "PS" },
  { name: "Rahul Mehta", role: "COO, ManufactureX", text: "The manufacturing module alone saved us ₹40L annually in waste reduction.", avatar: "RM" },
  { name: "Anjali Nair", role: "HR Director, GlobalCorp", text: "Payroll for 2000+ employees, zero errors. The automation is phenomenal.", avatar: "AN" },
];

export default function ERPLanding() {
  const [theme, setTheme] = useState("lighttheme");
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () =>
    setTheme((t) => (t === "lighttheme" ? "darktheme" : "lighttheme"));

  return (
    <div className="min-h-screen bg-base-100 text-base-content font-['Outfit',sans-serif]">
      {/* HEADER */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-base-100/90 backdrop-blur-md shadow-sm" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-white">
              <MdDashboard className="w-5 h-5 opacity-90" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Nova<span className="text-primary">ERP</span>
            </span>
          </div>

          {/* Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a
                key={l}
                href="#"
                className="text-sm font-medium opacity-70 hover:opacity-100 hover:text-primary transition-all"
              >
                {l}
              </a>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="btn btn-ghost btn-sm btn-circle"
              aria-label="Toggle theme"
            >
              {theme === "lighttheme" ? (
                <MdDarkMode className="w-5 h-5" />
              ) : (
                <MdLightMode className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="btn btn-primary btn-sm px-5 rounded-full"
            >
              Sign In
            </button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* BG Grid */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, oklch(42% 0.16 295 / 0.15) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* BG Blobs */}
        <div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full opacity-20"
          style={{ background: "radial-gradient(circle, oklch(42% 0.16 295), transparent 70%)" }}
        />
        <div
          className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full opacity-15"
          style={{ background: "radial-gradient(circle, oklch(60% 0.14 240), transparent 70%)" }}
        />

        <div className="max-w-7xl mx-auto px-6 pt-28 pb-16 grid lg:grid-cols-2 gap-16 items-center w-full">
          {/* Left */}
          <div>
            <div className="badge badge-outline border-primary text-primary text-xs px-4 py-3 mb-6 font-medium">
              🚀 Next-Gen Enterprise Platform
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight mb-6">
              Run Your Entire
              <br />
              <span className="text-primary">Business</span> From
              <br />
              One Platform
            </h1>
            <p className="text-lg opacity-60 leading-relaxed mb-8 max-w-lg">
              NovaERP unifies Finance, Manufacturing, HR, Sales, and Supply Chain into a single, intelligent system. Built for modern enterprises that demand speed and precision.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/organizationRegister")}
                className="btn btn-primary px-8 rounded-full"
              >
                Start Free Trial
              </button>
              <button className="btn btn-outline rounded-full px-8">
                Watch Demo ▶
              </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4 mt-12">
              {STATS.map((s) => (
                <div key={s.label}>
                  <div className="text-2xl font-bold text-primary">{s.value}</div>
                  <div className="text-xs opacity-50 mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Dashboard Preview */}
          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden border border-base-300 shadow-2xl bg-base-200">
              {/* Fake browser bar */}
              <div className="bg-base-300 px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-error opacity-70" />
                <div className="w-3 h-3 rounded-full bg-warning opacity-70" />
                <div className="w-3 h-3 rounded-full bg-success opacity-70" />
                <div className="flex-1 ml-3 bg-base-100 rounded-full h-5 flex items-center px-3">
                  <span className="text-xs opacity-40">app.novaerp.com/dashboard</span>
                </div>
              </div>

              {/* Dashboard UI */}
              <div className="p-4 space-y-4">
                {/* Top metrics */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Revenue", value: "₹84.2L", trend: "+12%", color: "text-success" },
                    { label: "Orders", value: "2,847", trend: "+8%", color: "text-info" },
                    { label: "Pending", value: "₹6.1L", trend: "-3%", color: "text-warning" },
                  ].map((m) => (
                    <div key={m.label} className="bg-base-100 rounded-xl p-3">
                      <div className="text-xs opacity-50 mb-1">{m.label}</div>
                      <div className="text-lg font-bold">{m.value}</div>
                      <div className={`text-xs font-semibold ${m.color}`}>{m.trend}</div>
                    </div>
                  ))}
                </div>

                {/* Chart placeholder */}
                <div className="bg-base-100 rounded-xl p-3 h-28 relative overflow-hidden">
                  <div className="text-xs opacity-40 mb-2">Monthly Revenue</div>
                  <svg viewBox="0 0 300 60" className="w-full h-16">
                    <polyline
                      points="0,55 40,42 80,48 120,30 160,35 200,18 240,22 300,8"
                      fill="none"
                      stroke="oklch(42% 0.16 295)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <polyline
                      points="0,55 40,42 80,48 120,30 160,35 200,18 240,22 300,8 300,60 0,60"
                      fill="oklch(42% 0.16 295 / 0.08)"
                    />
                  </svg>
                </div>

                {/* Recent activity */}
                <div className="bg-base-100 rounded-xl p-3 space-y-2">
                  <div className="text-xs opacity-40 mb-1">Recent Orders</div>
                  {[
                    { id: "#ORD-8821", client: "Reliance Ltd.", amount: "₹1,24,500", status: "Delivered" },
                    { id: "#ORD-8820", client: "Tata Steel", amount: "₹88,200", status: "Processing" },
                    { id: "#ORD-8819", client: "Infosys", amount: "₹2,10,000", status: "Pending" },
                  ].map((o) => (
                    <div key={o.id} className="flex justify-between items-center text-xs">
                      <span className="opacity-50">{o.id}</span>
                      <span className="font-medium">{o.client}</span>
                      <span className="font-semibold">{o.amount}</span>
                      <span className={`badge badge-xs ${o.status === "Delivered" ? "badge-success" : o.status === "Processing" ? "badge-info" : "badge-warning"}`}>
                        {o.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating badges */}
            <div className="absolute -left-8 top-1/3 bg-base-100 border border-base-300 rounded-2xl px-4 py-3 shadow-xl text-sm">
              <div className="text-xs opacity-50 mb-1">Inventory Alert</div>
              <div className="font-semibold text-warning">⚠ 3 items low stock</div>
            </div>
            <div className="absolute -right-6 bottom-1/4 bg-primary text-primary-content rounded-2xl px-4 py-3 shadow-xl text-sm">
              <div className="text-xs opacity-70 mb-1">Payroll Run</div>
              <div className="font-bold">✓ Processed 847 staff</div>
            </div>
          </div>
        </div>
      </section>

      {/* MODULES */}
      <section className="py-24 bg-base-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="badge badge-outline border-primary text-primary text-xs px-4 py-3 mb-4">
              All-in-One Suite
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-4">
              Every Module You Need
            </h2>
            <p className="opacity-50 max-w-lg mx-auto">
              Deeply integrated modules that share data in real-time — no silos, no exports, no waiting.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {MODULES.map((m) => (
              <div
                key={m.title}
                className="card bg-base-100 border border-base-300 hover:border-primary hover:shadow-lg transition-all duration-300 group cursor-pointer"
              >
                <div className="card-body">
                  <div className="text-3xl mb-3">{m.icon}</div>
                  <h3 className="font-bold text-lg group-hover:text-primary transition-colors">
                    {m.title}
                  </h3>
                  <p className="text-sm opacity-50 leading-relaxed">{m.desc}</p>
                  <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore module
                    <MdArrowForward className="w-4 h-4 translate-x-0 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY NOVA — Image-rich section */}
      <section className="py-24 bg-base-100">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          {/* Left visual */}
          <div className="relative">
            <div className="aspect-square max-w-lg rounded-3xl bg-base-200 border border-base-300 overflow-hidden relative">
              {/* Abstract network visualization */}
              <svg viewBox="0 0 400 400" className="w-full h-full opacity-80">
                <defs>
                  <radialGradient id="node-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="oklch(42% 0.16 295)" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="oklch(42% 0.16 295)" stopOpacity="0" />
                  </radialGradient>
                </defs>
                {/* Connection lines */}
                {[
                  [200, 200, 80, 80], [200, 200, 320, 80], [200, 200, 80, 320],
                  [200, 200, 320, 320], [200, 200, 200, 60], [200, 200, 200, 340],
                  [200, 200, 60, 200], [200, 200, 340, 200],
                ].map(([x1, y1, x2, y2], i) => (
                  <line
                    key={i} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="oklch(42% 0.16 295)" strokeWidth="1" opacity="0.3"
                    strokeDasharray="4 4"
                  />
                ))}
                {/* Center hub */}
                <circle cx="200" cy="200" r="50" fill="url(#node-glow)" />
                <circle cx="200" cy="200" r="28" fill="oklch(42% 0.16 295)" />
                <text x="200" y="196" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">NOVA</text>
                <text x="200" y="210" textAnchor="middle" fill="white" fontSize="9" opacity="0.8">ERP</text>
                {/* Satellite nodes */}
                {[
                  [80, 80, "Finance"], [320, 80, "HR"], [80, 320, "Sales"],
                  [320, 320, "Supply"], [200, 60, "MFG"], [200, 340, "CRM"],
                  [60, 200, "WMS"], [340, 200, "BI"],
                ].map(([cx, cy, label]) => (
                  <g key={label}>
                    <circle cx={cx} cy={cy} r="26" fill="oklch(42% 0.16 295 / 0.1)" stroke="oklch(42% 0.16 295 / 0.4)" strokeWidth="1" />
                    <text x={cx} y={cy + 4} textAnchor="middle" fill="oklch(42% 0.16 295)" fontSize="9" fontWeight="600">{label}</text>
                  </g>
                ))}
              </svg>
            </div>
            {/* Floating card */}
            <div className="absolute bottom-6 right-0 bg-base-100 border border-base-300 rounded-2xl p-4 shadow-xl w-48">
              <div className="text-xs opacity-40 mb-1">Data Sync Speed</div>
              <div className="text-2xl font-bold text-success">99ms</div>
              <div className="text-xs opacity-50">Real-time across modules</div>
              <div className="mt-2 h-1.5 rounded-full bg-base-300 overflow-hidden">
                <div className="h-full bg-success rounded-full" style={{ width: "92%" }} />
              </div>
            </div>
          </div>

          {/* Right */}
          <div>
            <div className="badge badge-outline border-primary text-primary text-xs px-4 py-3 mb-6">
              Why NovaERP
            </div>
            <h2 className="text-4xl font-bold tracking-tight mb-6">
              Built for the Way
              <br />
              <span className="text-primary">India Does Business</span>
            </h2>
            <div className="space-y-6">
              {[
                { icon: <MdBolt />, title: "Real-Time Everything", desc: "Every transaction, every movement — reflected instantly across Finance, Inventory, and Reports." },
                { icon: <MdSecurity />, title: "Enterprise-Grade Security", desc: "SOC 2 Type II, ISO 27001, end-to-end encryption. Your data stays yours." },
                { icon: <MdPublic />, title: "India-Ready Compliance", desc: "Built-in GST, TDS, PF, ESI, e-Way Bill, and MSME compliance out of the box." },
                { icon: <MdCloudSync />, title: "Scales With You", desc: "From 10 users to 10,000 — same platform, same speed, same reliability." },
              ].map((f) => (
                <div key={f.title} className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-lg flex-shrink-0">
                    {f.icon}
                  </div>
                  <div>
                    <div className="font-semibold mb-1">{f.title}</div>
                    <div className="text-sm opacity-50 leading-relaxed">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-base-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold tracking-tight mb-4">Trusted by Leaders</h2>
            <p className="opacity-50">Real results from real businesses across India</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card bg-base-100 border border-base-300 p-6">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <MdStar key={i} className="text-warning text-lg" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed opacity-70 mb-6">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-content text-sm font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs opacity-40">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="py-20 bg-primary text-primary-content relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="max-w-3xl mx-auto px-6 text-center relative">
          <h2 className="text-4xl font-bold mb-4">Ready to Modernize Your Business?</h2>
          <p className="opacity-70 mb-8">
            Join 10,000+ businesses already running on NovaERP. Start your 30-day free trial today — no credit card required.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => navigate("/organizationRegister")}
              className="btn bg-white text-primary hover:bg-base-100 border-0 px-8 rounded-full"
            >
              Get Started Free
            </button>
            <button className="btn btn-outline border-white/40 text-white hover:bg-white/10 px-8 rounded-full">
              Schedule Demo
            </button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-base-200 py-10 border-t border-base-300">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white">
              <MdDashboard className="w-4 h-4 opacity-90" />
            </div>
            <span className="font-bold">Nova<span className="text-primary">ERP</span></span>
          </div>
          <p className="text-xs opacity-40">© 2025 NovaERP Technologies Pvt. Ltd. All rights reserved.</p>
          <div className="flex gap-6 text-xs opacity-40">
            <a href="#" className="hover:opacity-80">Privacy</a>
            <a href="#" className="hover:opacity-80">Terms</a>
            <a href="#" className="hover:opacity-80">Support</a>
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.96) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
      `}</style>
    </div>
  );
}
