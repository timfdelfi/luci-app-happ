'use strict';
'require view';
'require rpc';
'require ui';

/* ───────────────────────── RPC ───────────────────────── */

var H = function (method, params) {
	return rpc.declare({ object: 'happ', method: method, params: params || [] });
};
var rState      = H('state');
var rStatus     = H('status');
var rConnect    = H('connect');
var rDisconnect = H('disconnect');
var rAdd        = H('add', ['text']);
var rRemove     = H('remove', ['id']);
var rRefresh    = H('refresh', ['id']);
var rSelect     = H('select', ['id']);
var rSet        = H('set', ['settings']);
var rCheck      = H('check');
var rPing       = H('ping');
var rPingOne    = H('ping', ['id']);
var rDevices    = H('devices');
var rLogs       = H('logs');
var rClear      = H('clear');
var rClearLog   = H('clearlog');

/* ───────────────────────── стили (Happ-inspired) ───────────────────────── */

var CSS = [
/* root */
'.hv{--bg:#f0f2f5;--card:#ffffff;--card2:#f7f8fa;--line:#e4e7ec;--tx:#1a1d26;--tx2:#8b92a5;--ac:#5b6af0;--ac2:#7b88f7;--acs:rgba(91,106,240,.12);--ok:#22c55e;--bad:#ef4444;--warn:#f59e0b;--sh:0 4px 24px rgba(0,0,0,.06);',
'  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;color:var(--tx);width:100%;max-width:100%;margin:0;padding:0 0 24px;line-height:1.45;box-sizing:border-box;overflow-x:hidden}',
'.hv[data-theme=dark]{--bg:#12141a;--card:#1c1f28;--card2:#252836;--line:#2e3340;--tx:#eef0f6;--tx2:#9aa3b5;--acs:rgba(123,136,247,.18);--sh:0 4px 24px rgba(0,0,0,.35)}',
'.hv *{box-sizing:border-box}',
'.hv svg{width:1em;height:1em;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;display:block}',

/* top bar */
'.hv-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 16px;flex-wrap:wrap;padding:0 2px}',
'.hv-logo{display:flex;align-items:center;gap:10px;font-size:18px;font-weight:700;letter-spacing:-.02em;min-width:0}',
'.hv-logo i{width:32px;height:32px;border-radius:10px;background:linear-gradient(135deg,var(--ac2),var(--ac));display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;flex:none}',
'.hv-logo small{display:block;font-size:11px;font-weight:500;color:var(--tx2);letter-spacing:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
'.hv-tabs{display:flex;gap:2px;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:3px;flex:none}',
'.hv-tabs button{border:0;background:none;color:var(--tx2);font:inherit;font-size:13px;font-weight:600;padding:7px 14px;border-radius:9px;cursor:pointer;display:flex;align-items:center;gap:6px;white-space:nowrap}',
'.hv-tabs button:hover{color:var(--tx)}',
'.hv-tabs button.on{background:var(--acs);color:var(--ac)}',
'.hv[data-theme=dark] .hv-tabs button.on{color:var(--ac2)}',

/* main layout — two columns, no overflow */
'.hv-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(280px,380px);gap:16px;align-items:stretch;width:100%;min-width:0}',
'@media (max-width:860px){.hv-grid{grid-template-columns:1fr}}',

/* cards */
'.hv-card{background:var(--card);border:1px solid var(--line);border-radius:16px;box-shadow:var(--sh);padding:16px;min-width:0;overflow:hidden}',
'.hv-h{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 0 12px;font-size:15px;font-weight:700;min-width:0}',
'.hv-h span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',

/* buttons */
'.hv-ibtn{border:1px solid var(--line);background:var(--card2);color:var(--tx2);width:34px;height:34px;border-radius:10px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;font-size:16px;padding:0;transition:.15s;flex:none}',
'.hv-ibtn:hover{color:var(--ac);border-color:var(--ac)}',
'.hv-ibtn.spin svg{animation:hvspin 1s linear infinite}',
'.hv-ibtn.sm{width:26px;height:26px;border-radius:8px;font-size:13px}',
'.hv-btn{border:0;background:linear-gradient(135deg,var(--ac2),var(--ac));color:#fff;font:inherit;font-weight:700;font-size:13px;padding:0 18px;height:40px;border-radius:11px;cursor:pointer;transition:.15s;white-space:nowrap;flex:none}',
'.hv-btn:hover{filter:brightness(1.06)}.hv-btn:active{transform:scale(.98)}.hv-btn[disabled]{opacity:.5;cursor:default}',
'.hv-btn.ghost{background:var(--card2);color:var(--tx);border:1px solid var(--line)}',
'.hv .hv-btn.hv-danger{background:rgba(239,68,68,.12)!important;color:#ef4444!important;border:1px solid rgba(239,68,68,.45)!important;text-shadow:none!important}',
'.hv .hv-btn.hv-danger:hover{background:#ef4444!important;color:#fff!important}',
'.hv-btn i,.hv-btn .hv-bi{display:inline-flex;vertical-align:middle}',
'.hv-btn.spin svg{animation:hvspin 1s linear infinite}',
'.hv-sr{display:flex;gap:8px;align-items:flex-start;margin-bottom:10px;min-width:0}',
'.hv-sr .hv-search{flex:1;margin-bottom:0}',
'.hv-sr .hv-btn{height:38px;display:inline-flex;align-items:center;gap:6px;padding:0 14px}',
'.hv-pgsel{grid-column:1/-1;display:inline-flex;align-items:center;justify-content:center;gap:6px;height:36px;margin-top:2px}',
'.hv-bar.inf span{width:100%;background:linear-gradient(90deg,var(--ac),var(--ac2),var(--ac));background-size:200% 100%;animation:hvflow 3s linear infinite}',

/* add + search */
'.hv-add{display:flex;gap:8px;align-items:stretch;margin-bottom:12px;min-width:0}',
'.hv-add textarea,.hv-in,.hv-sel,.hv-ta{width:100%;border:1.5px solid var(--line);background:var(--card2);color:var(--tx);font:inherit;font-size:13px;border-radius:11px;padding:10px 12px;outline:none;transition:.15s;resize:none;min-width:0}',
'.hv-add textarea{min-height:40px;height:40px;max-height:100px;padding-top:10px}',
'.hv-add textarea:focus,.hv-in:focus,.hv-sel:focus,.hv-ta:focus{border-color:var(--ac);box-shadow:0 0 0 3px var(--acs)}',
'.hv-in,.hv-sel{height:38px;padding:0 11px}',
'.hv-ta{min-height:80px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px}',
'.hv-search{position:relative;margin-bottom:10px;min-width:0}',
'.hv-search input{width:100%;height:38px;border:1.5px solid var(--line);background:var(--card2);color:var(--tx);font:inherit;font-size:13px;border-radius:11px;padding:0 12px 0 36px;outline:none;min-width:0}',
'.hv-search input:focus{border-color:var(--ac)}',
'.hv-search i{position:absolute;left:11px;top:10px;color:var(--tx2);font-size:16px;pointer-events:none}',

/* server list */
'.hv-list{max-height:min(520px,calc(100vh - 280px));overflow-y:auto;overflow-x:hidden;margin:0 -4px;padding:0 4px;min-width:0}',
'.hv-list::-webkit-scrollbar{width:5px}',
'.hv-list::-webkit-scrollbar-thumb{background:var(--line);border-radius:5px}',
'.hv-grp{display:flex;align-items:center;gap:6px;padding:12px 4px 5px;font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:var(--tx2);min-width:0}',
'.hv-grp b{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}',
'.hv-grp .hv-ibtn{background:none;border:0}',
'.hv-usage{font-size:11px;color:var(--tx2);padding:0 4px 6px}',
'.hv-bar{height:4px;border-radius:4px;background:var(--line);overflow:hidden;margin-top:4px}',
'.hv-bar span{display:block;height:100%;background:linear-gradient(90deg,var(--ac2),var(--ac));border-radius:4px}',

/* server row — Happ style */
'.hv-row{display:flex;align-items:center;gap:10px;padding:9px 10px;border-radius:12px;cursor:pointer;border:1.5px solid transparent;transition:.12s;margin-bottom:2px;min-width:0}',
'.hv-row:hover{background:var(--card2)}',
'.hv-row.sel{background:var(--acs);border-color:rgba(91,106,240,.25)}',
'.hv-row.off{opacity:.42;cursor:not-allowed}',
'.hv-fl{width:30px;height:30px;border-radius:50%;flex:none;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:800;letter-spacing:.02em;text-shadow:0 1px 2px rgba(0,0,0,.25)}',
'.hv-fl.auto{background:linear-gradient(135deg,var(--ac2),var(--ac));font-size:15px}',
'.hv-nm{flex:1;min-width:0;overflow:hidden}',
'.hv-nm b{display:block;font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
'.hv-nm span{display:block;font-size:10.5px;color:var(--tx2);letter-spacing:.01em;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-top:1px}',
'.hv-ms{font-size:11px;font-weight:700;padding:2px 7px;border-radius:7px;background:var(--card2);color:var(--tx2);flex:none}',
'.hv-ms.g{color:var(--ok);background:rgba(34,197,94,.12)}.hv-ms.y{color:var(--warn);background:rgba(245,158,11,.13)}.hv-ms.r{color:var(--bad);background:rgba(239,68,68,.12)}',
'.hv-ck{width:18px;height:18px;border-radius:50%;border:2px solid var(--line);flex:none;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px}',
'.hv-row.sel .hv-ck{background:var(--ac);border-color:var(--ac)}',
'.hv-x{opacity:0;transition:.12s;flex:none}.hv-row:hover .hv-x{opacity:1}@media(hover:none){.hv-x{opacity:1}}',
'.hv-empty{text-align:center;padding:28px 10px 12px;color:var(--tx2);font-size:13px}',
'.hv-empty big{display:block;font-size:36px;margin-bottom:4px}',

/* right panel — power button (Happ style) */
'.hv-right{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:420px;padding:20px 12px;position:relative}',
'.hv-power{display:flex;flex-direction:column;align-items:center;width:100%}',
'.hv-pw{position:relative;width:170px;height:170px;display:flex;align-items:center;justify-content:center;margin:0 0 16px}',
'.hv-pw:before,.hv-pw:after{content:"";position:absolute;inset:0;border-radius:50%;border:1.5px solid var(--line);transition:.4s}',
'.hv-pw:after{inset:-12px;opacity:.4}',
'.hv-pb{position:relative;z-index:1;width:120px;height:120px;border-radius:50%;border:0;cursor:pointer;background:var(--card2);color:var(--tx2);font-size:48px;display:flex;align-items:center;justify-content:center;box-shadow:inset 0 -4px 12px rgba(0,0,0,.04),0 10px 28px rgba(0,0,0,.08);transition:.3s;padding:0}',
'.hv[data-theme=dark] .hv-pb{background:#2a2e3a;box-shadow:inset 0 -4px 12px rgba(0,0,0,.2),0 10px 28px rgba(0,0,0,.4)}',
'.hv-pb:hover{transform:scale(1.03)}.hv-pb:active{transform:scale(.97)}',
'.hv-pb svg{stroke-width:2.2}',
'.hv-power.on .hv-pb{background:linear-gradient(145deg,var(--ac2),var(--ac));color:#fff;box-shadow:0 0 0 0 rgba(91,106,240,.45),0 12px 36px rgba(91,106,240,.4);animation:hvpulse 2.4s infinite}',
'.hv-power.on .hv-pw:before{border-color:var(--ac)}',
'.hv-power.on .hv-pw:after{border-color:var(--ac2);opacity:.4}',
'.hv-power.busy .hv-pw:before{border-color:var(--ac) transparent transparent transparent;animation:hvspin .9s linear infinite}',
'.hv-power.busy .hv-pb{color:var(--ac)}',
'.hv-power.err .hv-pb{color:var(--bad)}',
'.hv-st{font-size:18px;font-weight:800;letter-spacing:-.01em;text-align:center}',
'.hv-st.on{color:var(--ok)}',
'.hv-sub{color:var(--tx2);font-size:13px;margin-top:2px;text-align:center;min-height:18px}',
'.hv-timer{font-size:15px;font-weight:600;color:var(--tx2);margin-top:4px;font-variant-numeric:tabular-nums}',

/* current server under power */
'.hv-cur{display:flex;align-items:center;gap:10px;margin:20px auto 0;padding:10px 14px;background:var(--card2);border:1px solid var(--line);border-radius:12px;max-width:100%;min-width:0}',
'.hv-cur .hv-nm{flex:1;min-width:0}',
'.hv-stats{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:14px;width:100%;max-width:280px}',
'.hv-stat{background:var(--card2);border:1px solid var(--line);border-radius:11px;padding:9px 12px;min-width:0}',
'.hv-stat span{display:block;font-size:10px;color:var(--tx2);font-weight:600;letter-spacing:.03em;text-transform:uppercase}',
'.hv-stat b{display:block;font-size:14px;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
'.hv-err{margin-top:12px;padding:10px 12px;border-radius:11px;background:rgba(239,68,68,.1);color:var(--bad);font-size:12px;word-break:break-word;max-width:100%}',

/* banners */
'.hv-banner{display:flex;gap:10px;padding:12px 14px;border-radius:12px;margin-bottom:12px;font-size:13px;border:1px solid;min-width:0}',
'.hv-banner.bad{background:rgba(239,68,68,.08);border-color:rgba(239,68,68,.3)}',
'.hv-banner.warn{background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.35)}',
'.hv-banner i{font-size:18px;flex:none;margin-top:1px}',
'.hv-banner code{display:block;margin-top:5px;padding:7px 9px;border-radius:8px;background:var(--card);font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;user-select:all;word-break:break-all;white-space:pre-wrap}',

/* empty hero */
'.hv-hero{text-align:center;padding:24px 10px 8px}',
'.hv-hero h2{margin:0 0 4px;font-size:18px;font-weight:800;border:0;padding:0}',
'.hv-hero p{margin:0 auto 14px;color:var(--tx2);max-width:360px;font-size:13px}',
'.hv-steps{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px;color:var(--tx2);font-size:12px}',
'.hv-steps span{display:flex;align-items:center;gap:5px}',
'.hv-steps em{font-style:normal;width:20px;height:20px;border-radius:50%;background:var(--acs);color:var(--ac);font-weight:800;font-size:11px;display:flex;align-items:center;justify-content:center}',

/* settings */
'.hv-set{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px;align-items:start;width:100%;min-width:0}',
'@media (max-width:720px){.hv-set{grid-template-columns:1fr}}',
'.hv-sec h3{margin:0 0 3px;font-size:14px;font-weight:700;border:0;padding:0}',
'.hv-sec>p{margin:0 0 8px;color:var(--tx2);font-size:12px}',
'.hv-opt{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;border-top:1px solid var(--line);min-width:0}',
'.hv-opt:first-of-type{border-top:0}',
'.hv-opt .t{flex:1;min-width:0}.hv-opt .t b{display:block;font-size:13px;font-weight:600}.hv-opt .t span{display:block;font-size:11.5px;color:var(--tx2);margin-top:1px}',
'.hv-opt .c{flex:none;width:min(180px,40%)}',
'.hv-col{display:block;padding:10px 0;border-top:1px solid var(--line)}',
'.hv-col .t b{display:block;font-size:13px;font-weight:600}.hv-col .t span{display:block;font-size:11.5px;color:var(--tx2);margin:1px 0 7px}',
'.hv-sw{position:relative;width:42px;height:24px;flex:none;display:block;cursor:pointer}',
'.hv-sw input{position:absolute;opacity:0;inset:0;margin:0;cursor:pointer;z-index:1}',
'.hv-sw i{position:absolute;inset:0;border-radius:24px;background:var(--line);transition:.2s}',
'.hv-sw i:after{content:"";position:absolute;left:2px;top:2px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:.2s}',
'.hv-sw input:checked+i{background:var(--ac)}.hv-sw input:checked+i:after{transform:translateX(18px)}',
'.hv-devs{max-height:180px;overflow:auto;border:1px solid var(--line);border-radius:10px;background:var(--card2)}',
'.hv-dev{display:flex;align-items:center;gap:8px;padding:7px 10px;font-size:12px;cursor:pointer;border-top:1px solid var(--line);min-width:0}',
'.hv-dev:first-child{border-top:0}.hv-dev input{width:14px;height:14px;accent-color:var(--ac);margin:0;flex:none}.hv-dev span{color:var(--tx2);margin-left:auto;flex:none}',
'.hv-chips{display:flex;flex-wrap:wrap;gap:8px}',
'.hv-chip{position:relative;display:flex;align-items:center;padding:7px 13px;border:1.5px solid var(--line);background:var(--card2);border-radius:999px;font-size:12.5px;font-weight:600;cursor:pointer;user-select:none;transition:.12s}',
'.hv-chip input{position:absolute;opacity:0;inset:0;margin:0;cursor:pointer}',
'.hv-chip:hover{border-color:var(--ac)}',
'.hv-chip.on{background:var(--acs);border-color:var(--ac);color:var(--ac)}',
'.hv[data-theme=dark] .hv-chip.on{color:var(--ac2)}',
'.hv-note{font-size:11.5px;color:var(--tx2);margin-top:8px}',
'.hv-save{position:sticky;bottom:10px;display:flex;gap:8px;justify-content:flex-end;margin-top:14px}',
'.hv-save .in{display:flex;gap:8px;padding:8px;background:var(--card);border:1px solid var(--line);border-radius:14px;box-shadow:var(--sh)}',
'.hv-log{white-space:pre-wrap;word-break:break-all;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:11.5px;background:var(--card2);border:1px solid var(--line);border-radius:12px;padding:12px;max-height:min(520px,calc(100vh - 220px));overflow:auto;margin:0;color:var(--tx)}',
'.hv-foot{margin-top:14px;text-align:center;font-size:11px;color:var(--tx2)}',
'.hv-toast{position:fixed;left:50%;bottom:24px;transform:translate(-50%,30px);background:#1e2030;color:#fff;padding:11px 18px;border-radius:12px;font-size:13px;font-weight:600;opacity:0;pointer-events:none;transition:.25s;z-index:9999;max-width:90vw;box-shadow:0 8px 32px rgba(0,0,0,.3)}',
'.hv-toast.show{opacity:1;transform:translate(-50%,0)}.hv-toast.bad{background:#c0343a}',
'@keyframes hvspin{to{transform:rotate(360deg)}}',
'@keyframes hvflow{from{background-position:0 0}to{background-position:200% 0}}',
'@keyframes hvpulse{0%{box-shadow:0 0 0 0 rgba(91,106,240,.4),0 12px 36px rgba(91,106,240,.4)}70%{box-shadow:0 0 0 22px rgba(91,106,240,0),0 12px 36px rgba(91,106,240,.4)}100%{box-shadow:0 0 0 0 rgba(91,106,240,0),0 12px 36px rgba(91,106,240,.4)}}'
].join('\n');

/* ───────────────────────── иконки ───────────────────────── */

var ICON = {
	bolt: '<svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
	globe: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
	gear: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
	doc: '<svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
	power: '<svg viewBox="0 0 24 24"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>',
	plus: '<svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
	refresh: '<svg viewBox="0 0 24 24"><path d="M23 4v6h-6"/><path d="M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>',
	trash: '<svg viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
	search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
	check: '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg>',
	zap: '<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
	warn: '<svg viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>'
};

function ic(name) {
	var s = E('i');
	s.innerHTML = ICON[name] || '';
	return s;
}

/* ───────────────────────── страны / флаги ───────────────────────── */

var COUNTRY = [
	['DE', /герман|german|deutsch|frankfurt|de\b/i],
	['GB', /великобритан|britain|london|uk\b|england|british/i],
	['US', /сша|america|united.?states|new.?york|los.?angeles|miami|chicago|us\b|usa/i],
	['NL', /нидерланд|holland|amsterdam|netherlands|nl\b/i],
	['SE', /швеци|sweden|stockholm|se\b/i],
	['FI', /финлянд|finland|helsinki|fi\b/i],
	['NO', /норвег|norway|oslo|no\b/i],
	['PL', /польш|poland|warsaw|pl\b/i],
	['IT', /итал|italy|milan|rome|it\b/i],
	['RS', /серби|serbia|belgrade|rs\b/i],
	['BG', /болгар|bulgaria|sofia|bg\b/i],
	['HR', /хорват|croatia|zagreb|hr\b/i],
	['CZ', /чехи|czech|prague|cz\b/i],
	['FR', /франц|france|paris|fr\b/i],
	['ES', /испан|spain|madrid|es\b/i],
	['TR', /турц|turkey|istanbul|tr\b/i],
	['JP', /япон|japan|tokyo|jp\b/i],
	['KR', /коре|korea|seoul|kr\b/i],
	['SG', /сингапур|singapore|sg\b/i],
	['HK', /гонконг|hong.?kong|hk\b/i],
	['CA', /канад|canada|toronto|ca\b/i],
	['AU', /австрал|australia|sydney|au\b/i],
	['CH', /швейцар|switzerland|zurich|ch\b/i],
	['AT', /австр|austria|vienna|at\b/i],
	['BE', /бельг|belgium|brussels|be\b/i],
	['IE', /ирланд|ireland|dublin|ie\b/i],
	['PT', /португал|portugal|lisbon|pt\b/i],
	['RO', /румын|romania|bucharest|ro\b/i],
	['UA', /украин|ukraine|kyiv|kiev|ua\b/i],
	['RU', /росси|russia|moscow|ru\b/i],
	['IN', /инди|india|mumbai|in\b/i],
	['BR', /бразил|brazil|sao.?paulo|br\b/i],
	['AE', /оаэ|dubai|uae|ae\b/i],
	['IL', /израил|israel|tel.?aviv|il\b/i]
];

function flagInfo(name) {
	var clean = String(name || ''), code = '', m;
	m = clean.match(/^([A-Z]{2})\b/);
	if (m) { code = m[1]; clean = clean.slice(m[0].length); }
	if (!code) for (var i = 0; i < COUNTRY.length; i++) if (COUNTRY[i][1].test(clean)) { code = COUNTRY[i][0]; break; }
	return { code: code || '··', name: clean.replace(/^[\s|·•\-–—]+/, '') || String(name) };
}

function flagColor(code) {
	var h = 0; for (var i = 0; i < code.length; i++) h = (h * 31 + code.charCodeAt(i)) % 360;
	return 'hsl(' + h + ',52%,48%)';
}

function flagEl(code, cls) {
	var f = E('div', { 'class': 'hv-fl' + (cls ? ' ' + cls : '') }, code);
	if (!cls) f.style.background = flagColor(code);
	return f;
}

function fmtBytes(n) {
	n = +n || 0;
	var u = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'], i = 0;
	while (n >= 1024 && i < u.length - 1) { n /= 1024; i++; }
	return (n >= 100 || i === 0 ? n.toFixed(0) : n.toFixed(1)) + ' ' + u[i];
}

function fmtTime(s) {
	s = Math.max(0, s | 0);
	var h = (s / 3600) | 0, m = ((s % 3600) / 60) | 0, x = s % 60;
	var p = function (v) { return (v < 10 ? '0' : '') + v; };
	return (h ? h + ':' : '') + p(m) + ':' + p(x);
}

function fmtDate(ts) {
	var d = new Date(ts * 1000);
	return ('0' + d.getDate()).slice(-2) + '.' + ('0' + (d.getMonth() + 1)).slice(-2) + '.' + d.getFullYear();
}

/* ключи совпадают с PRESET_KEYS в /usr/bin/happ и presets в build.jq */
var PRESETS = [
	['telegram', 'Telegram', ''],
	['youtube', 'YouTube', ''],
	['discord', 'Discord', ''],
	['meta', 'Meta', 'Instagram, Facebook, WhatsApp, Threads'],
	['x', 'X (Twitter)', ''],
	['ai', 'ИИ-сервисы', 'ChatGPT, Claude, Gemini, Perplexity, Grok'],
	['adult', '18+', 'Сайты для взрослых']
];

/* бэкенд отдаёт IP объектом {ip, country, code} */
function ipText(ip) {
	if (!ip) return '—';
	if (typeof ip === 'string') return ip;
	return (ip.ip || '—') + (ip.code ? ' · ' + ip.code : '');
}

function msClass(ms) { return ms < 250 ? 'g' : ms < 600 ? 'y' : 'r'; }

function isDarkTheme() {
	var els = [document.body, document.documentElement];
	for (var i = 0; i < els.length; i++) {
		var c = getComputedStyle(els[i]).backgroundColor, m = c && c.match(/[\d.]+/g);
		if (m && m.length >= 3 && !(m.length > 3 && +m[3] === 0))
			return (0.299 * m[0] + 0.587 * m[1] + 0.114 * m[2]) < 140;
	}
	return !!(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches);
}

function sw(checked) {
	var inp = E('input', { type: 'checkbox' });
	inp.checked = !!checked;
	return { el: E('label', { 'class': 'hv-sw' }, [inp, E('i')]), inp: inp };
}

/* ───────────────────────── представление ───────────────────────── */

return view.extend({
	load: function () {
		return rState().catch(function () { return null; });
	},

	render: function (st) {
		var self = this;
		this.S = st || { servers: [], sources: [], settings: {}, status: {}, delays: {}, singbox: '', tun: true };
		this.tab = 'main';
		this.busy = null;
		this.check = null;
		this.search = '';
		this.timers = [];
		this._upSince = 0;

		this.root = E('div', { 'class': 'hv' });
		this.toastEl = E('div', { 'class': 'hv-toast' });

		var style = E('style');
		style.textContent = CSS;
		this.root.appendChild(style);

		/* шапка */
		this.tabBtns = {};
		var tabs = E('div', { 'class': 'hv-tabs' });
		[['main', 'globe', 'Подключение'], ['settings', 'gear', 'Настройки'], ['log', 'doc', 'Журнал']].forEach(function (t) {
			var b = E('button', { click: function () { self.setTab(t[0]); } }, [ic(t[1]), E('span', {}, t[2])]);
			self.tabBtns[t[0]] = b;
			tabs.appendChild(b);
		});
		var logoI = E('i'); logoI.innerHTML = ICON.bolt;
		this.root.appendChild(E('div', { 'class': 'hv-top' }, [
			E('div', { 'class': 'hv-logo' }, [logoI, E('div', {}, [E('div', {}, 'VPN'), E('small', {}, 'Вставил ссылку — нажал кнопку — работает')])]),
			tabs
		]));

		this.banners = E('div');
		this.root.appendChild(this.banners);

		this.paneMain = this.buildMain();
		this.paneSet = E('div', { style: 'display:none' });
		this.paneLog = E('div', { style: 'display:none' });
		this.root.appendChild(this.paneMain);
		this.root.appendChild(this.paneSet);
		this.root.appendChild(this.paneLog);
		this.foot = E('div', { 'class': 'hv-foot' });
		this.root.appendChild(this.foot);
		this.root.appendChild(this.toastEl);

		this.buildSettings();
		this.setTab('main');
		this.afterState();
		this.refreshAll();

		/* опрос состояния */
		var tick = 0;
		var loop = setInterval(function () {
			if (!document.body.contains(self.root)) { clearInterval(loop); return; }
			tick++;
			self.root.setAttribute('data-theme', isDarkTheme() ? 'dark' : 'light');
			if (document.hidden) return;
			if (self.tab === 'main' || self.busy) {
				if (tick % 10 === 0) { self.refreshAll(); if (self.phase() === 'on') self.doPing(); }
				else self.pollStatus();
			}
			/* обновляем таймер аптайма */
			if (self.phase() === 'on' && self._upSince) {
				var el = self.root.querySelector('.hv-timer');
				if (el) el.textContent = fmtTime(Math.floor(Date.now() / 1000) - self._upSince);
			}
		}, 3000);
		this.root.setAttribute('data-theme', isDarkTheme() ? 'dark' : 'light');
		setTimeout(function () { self.root.setAttribute('data-theme', isDarkTheme() ? 'dark' : 'light'); }, 300);

		return this.root;
	},

	handleSave: null, handleSaveApply: null, handleReset: null,

	/* ───── утилиты интерфейса ───── */

	toast: function (msg, bad) {
		var t = this.toastEl;
		t.textContent = msg;
		t.className = 'hv-toast show' + (bad ? ' bad' : '');
		clearTimeout(this._tt);
		this._tt = setTimeout(function () { t.className = 'hv-toast' + (bad ? ' bad' : ''); }, bad ? 5200 : 2600);
	},

	setTab: function (name) {
		this.tab = name;
		var self = this;
		Object.keys(this.tabBtns).forEach(function (k) { self.tabBtns[k].className = (k === name ? 'on' : ''); });
		this.paneMain.style.display = name === 'main' ? '' : 'none';
		this.paneSet.style.display = name === 'settings' ? '' : 'none';
		this.paneLog.style.display = name === 'log' ? '' : 'none';
		if (name === 'log') this.loadLogs();
		if (name === 'settings') this.loadDevices();
	},

	servers: function () { return this.S.servers || []; },
	serverById: function (id) {
		var list = this.servers();
		for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
		return null;
	},

	/* ───── главная вкладка ───── */

	buildMain: function () {
		var self = this;
		var left = E('div', { 'class': 'hv-card' });
		var right = E('div', { 'class': 'hv-card hv-right' });

		/* --- левая колонка: добавление + список --- */
		var addTa = E('textarea', { placeholder: 'vless://…  или  https://подписка…', spellcheck: 'false' });
		addTa.addEventListener('keydown', function (ev) {
			if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); self.doAdd(addTa); }
		});
		this.addTa = addTa;
		var addBtn = E('button', { 'class': 'hv-btn', click: function () { self.doAdd(addTa); } }, [ic('plus'), document.createTextNode(' Добавить')]);
		left.appendChild(E('div', { 'class': 'hv-add' }, [addTa, addBtn]));

		var searchIn = E('input', { type: 'search', placeholder: 'Введите текст для поиска' });
		searchIn.addEventListener('input', function () {
			self.search = searchIn.value.trim().toLowerCase();
			self.drawList();
		});
		var pingAllLbl = document.createTextNode(' Пинг всех');
		var pingAllBtn = E('button', { 'class': 'hv-btn ghost', title: 'Проверить пинг всех серверов',
			click: function () { self.doPing(pingAllBtn, pingAllLbl); } }, [ic('zap'), pingAllLbl]);
		left.appendChild(E('div', { 'class': 'hv-sr' }, [E('div', { 'class': 'hv-search' }, [ic('search'), searchIn]), pingAllBtn]));

		this.listEl = E('div', { 'class': 'hv-list' });
		left.appendChild(this.listEl);

		/* --- правая колонка: кнопка питания --- */
		this.powerEl = E('div', { 'class': 'hv-power' });
		var pw = E('div', { 'class': 'hv-pw' });
		this.pbEl = E('button', {
			'class': 'hv-pb', title: 'Включить / выключить VPN',
			click: function () { self.toggle(); }
		});
		this.pbEl.innerHTML = ICON.power;
		pw.appendChild(this.pbEl);
		this.powerEl.appendChild(pw);

		this.stEl = E('div', { 'class': 'hv-st' }, 'Отключено');
		this.subEl = E('div', { 'class': 'hv-sub' }, '');
		this.timerEl = E('div', { 'class': 'hv-timer' }, '');
		this.powerEl.appendChild(this.stEl);
		this.powerEl.appendChild(this.subEl);
		this.powerEl.appendChild(this.timerEl);

		this.curEl = E('div');
		this.statsEl = E('div', { 'class': 'hv-stats' });
		this.errEl = E('div', { 'class': 'hv-err', style: 'display:none' });

		right.appendChild(this.powerEl);
		right.appendChild(this.curEl);
		right.appendChild(this.statsEl);
		right.appendChild(this.errEl);

		return E('div', { 'class': 'hv-grid' }, [left, right]);
	},

	drawList: function () {
		var self = this, S = this.S, list = this.listEl;
		list.innerHTML = '';
		var servers = this.servers();
		if (!servers.length) {
			list.appendChild(E('div', { 'class': 'hv-hero' }, [
				E('h2', {}, 'Нет серверов'),
				E('p', {}, 'Вставьте ссылку на подписку или ключ выше и нажмите «Добавить»'),
				E('div', { 'class': 'hv-steps' }, [
					E('span', {}, [E('em', {}, '1'), ' Вставьте ссылку']),
					E('span', {}, [E('em', {}, '2'), ' Нажмите кнопку питания'])
				])
			]));
			return;
		}

		/* Auto row */
		var selected = (S.settings && S.settings.selected) || 'auto';
		list.appendChild(this.rowEl({
			id: 'auto', flag: flagEl('★', 'auto'), name: 'Авто',
			sub: 'Лучший сервер по пингу', ms: null, sel: selected === 'auto', ok: true, removable: false
		}));

		var q = this.search;
		var groups = {}, order = [];
		servers.forEach(function (s) {
			var f = flagInfo(s.name);
			if (q && (f.name + ' ' + s.server + ' ' + (s.proto || '')).toLowerCase().indexOf(q) < 0) return;
			if (!groups[s.source]) { groups[s.source] = []; order.push(s.source); }
			groups[s.source].push({ s: s, f: f });
		});

		var sources = {};
		(S.sources || []).forEach(function (x) { sources[x.id] = x; });
		var multi = (S.sources || []).length > 1 || (S.sources || []).some(function (x) { return x.kind === 'sub'; });

		order.forEach(function (sid) {
			var src = sources[sid];
			if (multi && src) {
				list.appendChild(E('div', { 'class': 'hv-grp' }, [
					E('b', {}, src.name || 'Серверы'),
					src.kind === 'sub' ? E('button', { 'class': 'hv-ibtn sm', title: 'Обновить эту подписку', click: function (ev) { self.doRefresh(src.id, ev.currentTarget); } }, [ic('refresh')]) : null,
					E('button', { 'class': 'hv-ibtn sm', title: 'Удалить', click: function () { self.doRemove(src.id, src.name); } }, [ic('trash')])
				].filter(Boolean)));
				if (src.total) {
					var used = (src.upload || 0) + (src.download || 0);
					var pct = Math.min(100, Math.round(used * 100 / src.total));
					var line = fmtBytes(used) + ' из ' + fmtBytes(src.total) + (src.expire ? ' · до ' + fmtDate(src.expire) : '');
					var bar = E('div', { 'class': 'hv-bar' }, [E('span')]);
					bar.firstChild.style.width = pct + '%';
					list.appendChild(E('div', { 'class': 'hv-usage' }, [line, bar]));
				} else if (src.total === 0 || (src.upload || 0) + (src.download || 0) > 0) {
					// трафик без лимита: панель отдаёт total=0 — показываем сколько израсходовано
					var used0 = (src.upload || 0) + (src.download || 0);
					var parts = [];
					if (used0 > 0) parts.push('Использовано ' + fmtBytes(used0));
					if (src.total === 0) parts.push('безлимит');
					if (src.expire) parts.push('до ' + fmtDate(src.expire));
					var infBar = E('div', { 'class': 'hv-bar inf' }, [E('span')]);
					list.appendChild(E('div', { 'class': 'hv-usage' }, [parts.join(' · '), infBar]));
				} else if (src.expire) {
					list.appendChild(E('div', { 'class': 'hv-usage' }, 'Действует до ' + fmtDate(src.expire)));
				}
			}
			groups[sid].forEach(function (g) {
				var s = g.s;
				var meta = [s.proto, s.net, s.sec].filter(function (x) { return x && x !== 'none'; }).join(' / ').toUpperCase();
				list.appendChild(self.rowEl({
					id: s.id, flag: flagEl(g.f.code), name: g.f.name,
					sub: s.supported ? meta : (s.reason || 'не поддерживается'),
					ms: (S.delays || {})[s.id], sel: selected === s.id, ok: s.supported,
					removable: true
				}));
			});
		});

		if (!list.childNodes.length)
			list.appendChild(E('div', { 'class': 'hv-empty' }, 'Ничего не найдено'));
	},

	rowEl: function (o) {
		var self = this;
		var row = E('div', {
			'class': 'hv-row' + (o.sel ? ' sel' : '') + (o.ok ? '' : ' off'),
			click: function () { if (o.ok) self.doSelect(o.id); else self.toast('Этот сервер не поддерживается', true); }
		}, [
			o.flag,
			E('div', { 'class': 'hv-nm' }, [E('b', {}, o.name), E('span', {}, o.sub)])
		]);
		if (typeof o.ms === 'number') row.appendChild(E('div', { 'class': 'hv-ms ' + msClass(o.ms) }, o.ms + ' мс'));
		if (o.ok && o.id !== 'auto')
			row.appendChild(E('button', {
				'class': 'hv-ibtn sm hv-x', title: 'Пинг этого сервера',
				click: function (ev) { ev.stopPropagation(); self.doPingOne(o.id, ev.currentTarget); }
			}, [ic('zap')]));
		if (o.removable)
			row.appendChild(E('button', {
				'class': 'hv-ibtn sm hv-x', title: 'Удалить',
				click: function (ev) { ev.stopPropagation(); self.doRemove(o.id, o.name); }
			}, [ic('trash')]));
		var ck = E('div', { 'class': 'hv-ck' }, o.sel ? [ic('check')] : []);
		row.appendChild(ck);
		return row;
	},

	routeSummary: function () {
		var s = this.S.settings || {};
		if (s.scope === 'selected') {
			var names = (s.presets || []).map(function (k) {
				for (var i = 0; i < PRESETS.length; i++) if (PRESETS[i][0] === k) return PRESETS[i][1];
				return null;
			}).filter(Boolean);
			if ((s.proxy_domains || []).length) names.push('свои сайты');
			return 'Только: ' + (names.join(', ') || '—');
		}
		return s.bypass_ru ? 'Всё, кроме российских сайтов' : '';
	},

	/* ───── кнопка питания ───── */

	phase: function () {
		var st = this.S.status || {};
		if (st.connected) return 'on';
		if (this.busy) return 'busy';
		if (st.running) return 'busy';
		return 'off';
	},

	updatePower: function () {
		var me = this, S = this.S, st = S.status || {}, ph = this.phase();
		var errMsg = '';
		if (ph === 'off' && st.error) errMsg = st.error;
		this.powerEl.className = 'hv-power ' + ph + (errMsg ? ' err' : '');
		this.stEl.className = 'hv-st' + (ph === 'on' ? ' on' : '');
		this.stEl.textContent = ph === 'on' ? 'ПОДКЛЮЧЁН' : ph === 'busy' ? 'Подключение…' : 'Отключено';

		var servers = this.servers();
		if (ph === 'on') {
			this.subEl.textContent = this.routeSummary();
			if (typeof st.uptime === 'number') this._upSince = Math.floor(Date.now() / 1000) - st.uptime;
			else if (!this._upSince) this._upSince = Math.floor(Date.now() / 1000);
			this.timerEl.textContent = fmtTime(Math.floor(Date.now() / 1000) - this._upSince);
		} else {
			this._upSince = 0;
			this.timerEl.textContent = '';
			if (ph === 'busy') this.subEl.textContent = 'Поднимаем туннель…';
			else this.subEl.textContent = servers.length ? 'Нажмите, чтобы подключиться' : 'Сначала добавьте ссылку слева';
		}

		/* текущий сервер */
		this.curEl.innerHTML = '';
		var sel = (S.settings && S.settings.selected) || 'auto';
		var activeId = ph === 'on' && st.active ? st.active : (sel !== 'auto' ? sel : '');
		var cur = activeId ? this.serverById(activeId) : null;
		if (servers.length && (cur || sel === 'auto')) {
			var f = cur ? flagInfo(cur.name) : null;
			var title = cur ? f.name : 'Авто';
			var subt = cur ? (sel === 'auto' && ph === 'on' ? 'Авто · лучший сервер' : [cur.proto, cur.net, cur.sec].filter(function (x) { return x && x !== 'none'; }).join(' / ').toUpperCase()) : 'Лучший сервер выбирается автоматически';
			this.curEl.appendChild(E('div', { 'class': 'hv-cur' }, [
				cur ? flagEl(f.code) : flagEl('★', 'auto'),
				E('div', { 'class': 'hv-nm' }, [E('b', {}, title), E('span', {}, subt)])
			]));
		}

		/* статистика */
		this.statsEl.innerHTML = '';
		if (ph === 'on') {
			var ck = this.check || {}, ip = ck.ip || st.ip;
			var cell = function (label, val) { return E('div', { 'class': 'hv-stat' }, [E('span', {}, label), E('b', {}, val)]); };
			var tgt = sel !== 'auto' ? sel : (st.active || '');
			var pd = tgt && S.delays ? S.delays[tgt] : undefined;
			var cells = [
				cell('Пинг', typeof pd === 'number' ? pd + ' мс' : (typeof ck.delay === 'number' ? ck.delay + ' мс' : '—')),
				cell('IP', ipText(ip))
			];
			cells.forEach(function (c) { me.statsEl.appendChild(c); });
			me.statsEl.appendChild(E('button', { 'class': 'hv-btn ghost hv-pgsel', title: 'Замерить пинг выбранного сервера',
				click: function (ev) { me.doPingOne(tgt, ev.currentTarget); } }, [ic('zap'), document.createTextNode(' Пинг выбранного сервера')]));
		}

		/* ошибка */
		if (errMsg) {
			this.errEl.style.display = '';
			this.errEl.textContent = errMsg;
		} else {
			this.errEl.style.display = 'none';
			this.errEl.textContent = '';
		}
	},

	/* ───── действия ───── */

	toggle: function () {
		if (this.phase() === 'on' || this.phase() === 'busy') this.disconnect();
		else this.connect();
	},

	connect: function () {
		var self = this;
		if (!this.servers().length) { this.toast('Сначала добавьте ссылку', true); return; }
		this.busy = Date.now();
		this.updatePower();
		rConnect().then(function (r) {
			self.busy = null;
			if (!r || !r.ok) {
				self.toast((r && r.error) || 'Не удалось подключиться', true);
				self.pollStatus();
				return;
			}
			self.toast('VPN подключён');
			self.refreshAll();
			self.doCheck();
		}).catch(function () {
			self.busy = null;
			self.toast('Ошибка соединения', true);
			self.pollStatus();
		});
	},

	disconnect: function () {
		var self = this;
		this.busy = Date.now();
		this.updatePower();
		rDisconnect().then(function () {
			self.busy = null;
			self.S.status = Object.assign({}, self.S.status, { connected: false, running: false, error: '' });
			self.updatePower();
			self.toast('VPN отключён');
			self.refreshAll();
		}).catch(function () {
			self.busy = null;
			self.toast('Не удалось отключить', true);
			self.pollStatus();
		});
	},

	doAdd: function (ta) {
		var self = this, text = (ta.value || '').trim();
		if (!text) { this.toast('Вставьте ссылку', true); return; }
		ta.disabled = true;
		rAdd(text).then(function (r) {
			ta.disabled = false;
			if (!r || !r.ok) { self.toast((r && r.error) || 'Не удалось добавить', true); return; }
			ta.value = '';
			self.toast(r.kind === 'sub' ? ('Подписка: +' + r.added + ' серверов') : ('Добавлено: ' + r.added));
			self.refreshAll();
		}).catch(function () { ta.disabled = false; self.toast('Ошибка добавления', true); });
	},

	doSelect: function (id) {
		var self = this;
		rSelect(id).then(function (r) {
			if (!r || !r.ok) { self.toast((r && r.error) || 'Не удалось выбрать', true); return; }
			if (self.S.settings) self.S.settings.selected = id;
			self.drawList();
			self.updatePower();
			if (self.phase() === 'on') self.connect();
		});
	},

	doRemove: function (id, name) {
		var self = this;
		if (!window.confirm('Удалить «' + (name || id) + '»?')) return;
		rRemove(id).then(function (r) {
			if (!r || !r.ok) { self.toast((r && r.error) || 'Не удалось удалить', true); return; }
			self.toast('Удалено');
			self.refreshAll();
		});
	},

	doRefresh: function (id, btn) {
		var self = this;
		if (btn) btn.classList.add('spin');
		rRefresh(id || 'all').then(function (r) {
			if (btn) btn.classList.remove('spin');
			if (!r || !r.ok) { self.toast((r && r.error) || 'Не удалось обновить', true); return; }
			self.toast('Подписки обновлены');
			self.refreshAll();
		}).catch(function () { if (btn) btn.classList.remove('spin'); self.toast('Ошибка обновления', true); });
	},

	doCheck: function () {
		var self = this;
		rCheck().then(function (r) {
			if (r && r.ok) self.check = r;
			self.updatePower();
		}).catch(function () {});
	},

	doPing: function (btn, lbl) {
		var self = this;
		if (this._pinging) return;
		this._pinging = true;
		if (btn) { btn.disabled = true; btn.classList.add('spin'); if (lbl) lbl.textContent = ' Измеряю…'; }
		var done = function () {
			self._pinging = false;
			if (btn) { btn.disabled = false; btn.classList.remove('spin'); if (lbl) lbl.textContent = ' Пинг всех'; }
		};
		rPing().then(function (r) {
			done();
			if (r && r.delays) self.S.delays = r.delays;
			if (btn) {
				if (!r || !r.ok) self.toast((r && r.error) || 'Не удалось измерить пинг', true);
				else self.toast('Пинг обновлён');
			}
			self.drawList();
			self.updatePower();
		}).catch(function () { done(); if (btn) self.toast('Ошибка измерения пинга', true); });
	},

	doPingOne: function (id, btn) {
		var self = this;
		if (!id) { this.toast('Сначала выберите сервер или подключитесь', true); return; }
		if (btn) btn.classList.add('spin');
		rPingOne(id).then(function (r) {
			if (btn) btn.classList.remove('spin');
			if (r && r.delays) self.S.delays = r.delays;
			if (!r || !r.ok) self.toast((r && r.error) || 'Сервер не ответил', true);
			else self.toast('Пинг: ' + r.ms + ' мс');
			self.drawList();
			self.updatePower();
		}).catch(function () { if (btn) btn.classList.remove('spin'); self.toast('Ошибка измерения пинга', true); });
	},

	/* ───── опрос ───── */

	pollStatus: function () {
		var self = this;
		rStatus().then(function (r) {
			if (!r) return;
			self.S.status = r;
			self.updatePower();
		}).catch(function () {});
	},

	refreshAll: function () {
		var self = this;
		rState().then(function (st) {
			if (!st) return;
			self.S = st;
			self.afterState();
		}).catch(function () {});
	},

	afterState: function () {
		this.drawList();
		this.updatePower();
		this.drawBanners();
		this.foot.textContent = (this.S.singbox ? 'sing-box ' + this.S.singbox : '') + (this.S.tun ? ' · TUN' : '');
		if (this.phase() === 'on' && !this.check) this.doCheck();
		if (this.servers().length && !(this.S.delays && Object.keys(this.S.delays).length)) this.doPing();
	},

	drawBanners: function () {
		var self = this, b = this.banners;
		b.innerHTML = '';
		var S = this.S;
		if (!S.tun) {
			b.appendChild(E('div', { 'class': 'hv-banner bad' }, [
				ic('warn'),
				E('div', {}, [E('b', {}, 'Модуль TUN не найден'), E('div', {}, 'Установите kmod-tun и перезагрузите роутер')])
			]));
		}
		if (S.status && S.status.error && !S.status.connected) {
			b.appendChild(E('div', { 'class': 'hv-banner bad' }, [
				ic('warn'),
				E('div', {}, [E('b', {}, 'Ошибка'), E('div', {}, S.status.error)])
			]));
		}
	},

	/* ───── настройки ───── */

	loadDevices: function () {
		var self = this;
		rDevices().then(function (r) {
			self.devList = (r && r.devices) || [];
			self.drawDevices();
		}).catch(function () { self.devList = []; self.drawDevices(); });
	},

	drawDevices: function () {
		if (!this.devBox) return;
		var self = this, box = this.devBox;
		box.innerHTML = '';
		var chosen = this.chosenDevices;
		var seen = {};
		(this.devList || []).forEach(function (d) {
			seen[d.ip] = true;
			var cb = E('input', { type: 'checkbox' });
			cb.checked = chosen.indexOf(d.ip) >= 0;
			cb.addEventListener('change', function () {
				var i = chosen.indexOf(d.ip);
				if (cb.checked && i < 0) chosen.push(d.ip);
				if (!cb.checked && i >= 0) chosen.splice(i, 1);
			});
			box.appendChild(E('label', { 'class': 'hv-dev' }, [cb, E('div', {}, d.name || d.mac), E('span', {}, d.ip)]));
		});
		chosen.forEach(function (ip) {
			if (seen[ip]) return;
			var cb = E('input', { type: 'checkbox' });
			cb.checked = true;
			cb.addEventListener('change', function () {
				var i = chosen.indexOf(ip);
				if (!cb.checked && i >= 0) chosen.splice(i, 1);
			});
			box.appendChild(E('label', { 'class': 'hv-dev' }, [cb, E('div', {}, 'Адрес вручную'), E('span', {}, ip)]));
		});
		if (!box.childNodes.length) box.appendChild(E('div', { 'class': 'hv-empty' }, 'Устройства не найдены'));
	},

	buildSettings: function () {
		var self = this, s = this.S.settings || {};
		var F = {};
		this.F = F;
		this.chosenDevices = (s.devices || []).slice();

		var opt = function (title, desc, ctl) {
			return E('div', { 'class': 'hv-opt' }, [E('div', { 'class': 't' }, [E('b', {}, title), desc ? E('span', {}, desc) : null].filter(Boolean)), E('div', { 'class': 'c' }, [ctl])]);
		};
		var toggle = function (key, val) { var t = sw(val); F[key] = t.inp; return t.el; };
		var tg = function (title, desc, key, val) { var el = toggle(key, val); return E('div', { 'class': 'hv-opt' }, [E('div', { 'class': 't' }, [E('b', {}, title), E('span', {}, desc)]), el]); };
		var select = function (key, items, val) {
			var el = E('select', { 'class': 'hv-sel' }, items.map(function (it) { return E('option', { value: it[0] }, it[1]); }));
			el.value = String(val);
			F[key] = el; return el;
		};
		var input = function (key, val, ph) { var el = E('input', { 'class': 'hv-in', type: 'text', value: val == null ? '' : val, placeholder: ph || '' }); F[key] = el; return el; };

		var dnsPresets = ['1.1.1.1', '8.8.8.8', '9.9.9.9'];
		var dnsCur = s.remote_dns || '1.1.1.1';
		var dnsSel = select('dns_sel', [['1.1.1.1', 'Cloudflare (1.1.1.1)'], ['8.8.8.8', 'Google (8.8.8.8)'], ['9.9.9.9', 'Quad9 (9.9.9.9)'], ['custom', 'Свой адрес…']], dnsPresets.indexOf(dnsCur) >= 0 ? dnsCur : 'custom');
		var dnsCustom = input('dns_custom', dnsPresets.indexOf(dnsCur) >= 0 ? '' : dnsCur, '1.2.3.4');
		dnsCustom.style.marginTop = '8px';
		var syncDns = function () { dnsCustom.style.display = dnsSel.value === 'custom' ? '' : 'none'; };
		dnsSel.addEventListener('change', syncDns); syncDns();

		this.devBox = E('div', { 'class': 'hv-devs' });
		var devWrap = E('div');
		var modeSel = select('mode', [['all', 'Все устройства в сети'], ['include', 'Только выбранные'], ['exclude', 'Все, кроме выбранных']], s.mode || 'all');
		var devManual = E('input', { 'class': 'hv-in', type: 'text', placeholder: 'Добавить адрес вручную, например 192.168.1.50', style: 'margin-top:8px' });
		devManual.addEventListener('keydown', function (ev) {
			if (ev.key !== 'Enter') return;
			var v = devManual.value.trim();
			if (/^\d{1,3}(\.\d{1,3}){3}(\/\d{1,2})?$/.test(v) && self.chosenDevices.indexOf(v) < 0) { self.chosenDevices.push(v); devManual.value = ''; self.drawDevices(); }
			else self.toast('Введите IP-адрес, например 192.168.1.50', true);
		});
		devWrap.appendChild(this.devBox);
		devWrap.appendChild(devManual);
		var syncDev = function () { devWrap.style.display = modeSel.value === 'all' ? 'none' : ''; };
		modeSel.addEventListener('change', syncDev); syncDev();

		var directTa = E('textarea', { 'class': 'hv-ta', spellcheck: 'false', placeholder: 'example.com\nbank.ru\n203.0.113.0/24' });
		directTa.value = (s.direct_domains || []).join('\n');
		F.direct_domains = directTa;

		var routeNow = s.scope === 'selected' ? 'selected' : (s.bypass_ru ? 'no_ru' : 'all');
		var routeSel = select('route', [['all', 'Весь трафик'], ['no_ru', 'Всё, кроме российских сайтов'], ['selected', 'Только выбранные сервисы']], routeNow);
		this.chosenPresets = (s.presets || []).slice();
		var chipBox = E('div', { 'class': 'hv-chips' });
		PRESETS.forEach(function (p) {
			var cb = E('input', { type: 'checkbox' });
			cb.checked = self.chosenPresets.indexOf(p[0]) >= 0;
			var chip = E('label', { 'class': 'hv-chip' + (cb.checked ? ' on' : ''), title: p[2] || '' }, [cb, E('span', {}, p[1])]);
			cb.addEventListener('change', function () {
				var i = self.chosenPresets.indexOf(p[0]);
				if (cb.checked && i < 0) self.chosenPresets.push(p[0]);
				if (!cb.checked && i >= 0) self.chosenPresets.splice(i, 1);
				chip.className = 'hv-chip' + (cb.checked ? ' on' : '');
			});
			chipBox.appendChild(chip);
		});
		var proxyTa = E('textarea', { 'class': 'hv-ta', spellcheck: 'false', placeholder: 'example.com\n203.0.113.0/24' });
		proxyTa.value = (s.proxy_domains || []).join('\n');
		F.proxy_domains = proxyTa;
		var presetBox = E('div', { style: 'margin-top:12px' }, [
			E('div', { 'class': 't' }, [E('b', {}, 'Сервисы'), E('span', {}, 'Отметьте, что должно идти через VPN')]),
			chipBox,
			E('div', { 'class': 't', style: 'margin-top:12px' }, [E('b', {}, 'Свои сайты через VPN'), E('span', {}, 'Домены или подсети, по одному в строке')]),
			proxyTa,
			E('div', { 'class': 'hv-note' }, 'Остальное идёт напрямую, но всё равно проходит через sing-box — на слабых роутерах скорость может быть ниже.')
		]);
		var syncRoute = function () { presetBox.style.display = routeSel.value === 'selected' ? '' : 'none'; };
		routeSel.addEventListener('change', syncRoute); syncRoute();

		var ifacesIn = input('ifaces', (s.ifaces || ['lan']).join(' '), 'lan');

		var left = E('div', { 'class': 'hv-card hv-sec' }, [
			E('h3', {}, 'Основное'), E('p', {}, 'Всё уже настроено — менять ничего не обязательно.'),
			tg('Запускать при включении роутера', 'VPN поднимется сам после перезагрузки', 'autostart', s.autostart),
			opt('Автообновление подписок', 'Подтягивает новые серверы от провайдера', select('update_interval', [['0', 'Выключено'], ['6', 'Каждые 6 часов'], ['12', 'Каждые 12 часов'], ['24', 'Раз в сутки'], ['72', 'Раз в 3 дня'], ['168', 'Раз в неделю']], s.update_interval == null ? 24 : s.update_interval)),
			E('div', { 'class': 'hv-col' }, [E('div', { 'class': 't' }, [E('b', {}, 'Для каких устройств включать VPN'), E('span', {}, 'По умолчанию VPN работает для всех, кто подключён к роутеру')]), modeSel, devWrap]),
			E('h3', { style: 'margin-top:18px' }, 'Авто-переключение'),
			E('p', {}, 'В режиме «Авто» роутер сам замеряет пинг и переключается на самый быстрый сервер.'),
			opt('Частота проверки', 'Как часто заново измерять пинг серверов', select('auto_interval', [['30s', 'Каждые 30 секунд'], ['1m', 'Каждую минуту'], ['3m', 'Каждые 3 минуты'], ['5m', 'Каждые 5 минут'], ['10m', 'Каждые 10 минут']], s.auto_interval || '3m')),
			opt('Порог переключения', 'Переключится, если другой сервер быстрее на это число мс', input('auto_tolerance', s.auto_tolerance == null ? 80 : s.auto_tolerance)),
			opt('Адрес проверки', 'URL, по которому сервер замеряет задержку', input('auto_test_url', s.auto_test_url || 'https://www.gstatic.com/generate_204')),
			E('h3', { style: 'margin-top:18px' }, 'Маршрутизация'),
			E('div', { 'class': 'hv-col' }, [E('div', { 'class': 't' }, [E('b', {}, 'Что пускать через VPN'), E('span', {}, 'Весь трафик, всё кроме российских сайтов или только нужные сервисы')]), routeSel, presetBox]),
			E('div', { 'class': 'hv-col' }, [E('div', { 'class': 't' }, [E('b', {}, 'Свои исключения'), E('span', {}, 'Домены или подсети, которые идут напрямую')]), directTa]),
			tg('Kill Switch', 'Блокировать интернет, если VPN упал', 'kill_switch', s.kill_switch)
		]);

		var right = E('div', { 'class': 'hv-card hv-sec' }, [
			E('h3', {}, 'DNS и сеть'), E('p', {}, 'Тонкие настройки — обычно трогать не нужно.'),
			tg('DNS через VPN', 'DNS-запросы клиентов уходят через туннель (DoT)', 'dns_vpn', (s.dns_mode || 'vpn') === 'vpn'),
			E('div', { 'class': 'hv-col' }, [E('div', { 'class': 't' }, [E('b', {}, 'Удалённый DNS'), E('span', {}, 'DNS-сервер внутри VPN')]), dnsSel, dnsCustom]),
			tg('Блокировать IPv6', 'Весь IPv6-трафик клиентов блокируется, чтобы не утекал мимо VPN', 'block_ipv6', s.block_ipv6 !== false),
			tg('Блокировать QUIC', 'Отключает UDP/443 (может помочь с YouTube)', 'block_quic', s.block_quic !== false),
			tg('VPN-серверы мимо туннеля', 'Если на телефоне или ПК запущен свой VPN с теми же серверами, он продолжит работать', 'bypass_vpn', s.bypass_vpn !== false),
			opt('Стек TUN', 'system — быстрее, gvisor — совместимее', select('tun_stack', [['system', 'system'], ['gvisor', 'gvisor'], ['mixed', 'mixed']], s.tun_stack || 'system')),
			opt('MTU', 'Размер пакета (обычно 1400)', input('mtu', s.mtu || 1400)),
			opt('Интерфейсы', 'Из каких зон брать клиентов', ifacesIn),
			opt('Уровень логов', '', select('log_level', [['error', 'error'], ['warn', 'warn'], ['info', 'info'], ['debug', 'debug']], s.log_level || 'warn')),
			opt('User-Agent', 'При скачивании подписок (Happ — как с Android). HWID: ' + (s.hwid || '—'), input('user_agent', s.user_agent || 'Happ/3.13.0'))
		]);

		var saveBtn = E('button', { 'class': 'hv-btn', click: function () { self.saveSettings(saveBtn); } }, 'Сохранить');
		var resetBtn = E('button', { 'class': 'hv-btn hv-danger', click: function () { self.resetAll(); } }, 'Сбросить серверы');

		this.paneSet.appendChild(E('div', { 'class': 'hv-set' }, [left, right]));
		this.paneSet.appendChild(E('div', { 'class': 'hv-save' }, [E('div', { 'class': 'in' }, [resetBtn, saveBtn])]));
	},

	saveSettings: function (btn) {
		var self = this, F = this.F;
		var dns = F.dns_sel.value === 'custom' ? F.dns_custom.value.trim() : F.dns_sel.value;
		if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(dns)) { this.toast('DNS-сервер должен быть IP-адресом, например 1.1.1.1', true); return; }
		var mtu = parseInt(F.mtu.value, 10);
		if (!(mtu >= 1000 && mtu <= 9000)) { this.toast('MTU должен быть от 1000 до 9000', true); return; }
		var mode = F.mode.value;
		if (mode !== 'all' && !this.chosenDevices.length) { this.toast('Выберите хотя бы одно устройство или оставьте «Все устройства»', true); return; }
		var tolerance = parseInt(F.auto_tolerance.value, 10);
		if (!(tolerance >= 0 && tolerance <= 1000)) { this.toast('Порог переключения должен быть от 0 до 1000 мс', true); return; }

		var route = F.route.value;
		var proxyList = F.proxy_domains.value.split(/[\s,;]+/).filter(Boolean);
		if (route === 'selected' && !this.chosenPresets.length && !proxyList.length) { this.toast('Отметьте хотя бы один сервис или добавьте свой сайт', true); return; }

		var settings = {
			scope: route === 'selected' ? 'selected' : 'all',
			presets: this.chosenPresets,
			proxy_domains: proxyList,
			mode: mode,
			devices: this.chosenDevices,
			update_interval: parseInt(F.update_interval.value, 10),
			bypass_ru: route === 'no_ru',
			direct_domains: F.direct_domains.value.split(/[\s,;]+/).filter(Boolean),
			kill_switch: F.kill_switch.checked,
			dns_mode: F.dns_vpn.checked ? 'vpn' : 'system',
			block_ipv6: F.block_ipv6.checked,
			block_quic: F.block_quic.checked,
			bypass_vpn: F.bypass_vpn.checked,
			remote_dns: dns,
			tun_stack: F.tun_stack.value,
			mtu: mtu,
			log_level: F.log_level.value,
			ifaces: F.ifaces.value.split(/[\s,]+/).filter(Boolean),
			user_agent: F.user_agent.value.trim() || 'Happ/3.13.0',
			autostart: F.autostart.checked,
			auto_interval: F.auto_interval.value,
			auto_tolerance: tolerance,
			auto_test_url: F.auto_test_url.value.trim() || 'https://www.gstatic.com/generate_204'
		};
		btn.disabled = true;
		rSet(settings).then(function (r) {
			btn.disabled = false;
			if (!r || !r.ok) { self.toast((r && r.error) || 'Не удалось сохранить', true); return; }
			var running = self.S.status && (self.S.status.running || self.S.status.connected);
			self.toast(running ? 'Сохранено — перезапускаю VPN…' : 'Сохранено');
			Object.assign(self.S.settings, settings);
			if (running) { self.connect(); }
			self.refreshAll();
		}).catch(function () { btn.disabled = false; self.toast('Не удалось сохранить', true); });
	},

	resetAll: function () {
		var self = this;
		if (!window.confirm('Удалить все подписки и серверы?')) return;
		this.busy = null;
		rClear().then(function () {
			self.S.status = Object.assign({}, self.S.status, { connected: false, running: false, error: '' });
			self.toast('Серверы удалены');
			self.setTab('main');
			self.refreshAll();
		});
	},

	/* ───── журнал ───── */

	loadLogs: function () {
		var self = this;
		if (!this.logBox) {
			this.logBox = E('pre', { 'class': 'hv-log' }, 'Загрузка…');
			var refreshBtn = E('button', { 'class': 'hv-ibtn', title: 'Обновить', click: function () { self.loadLogs(); } }, [ic('refresh')]);
			var clearBtn = E('button', { 'class': 'hv-ibtn', title: 'Очистить', click: function () {
				rClearLog().then(function () { self.loadLogs(); });
			} }, [ic('trash')]);
			this.paneLog.appendChild(E('div', { 'class': 'hv-card' }, [
				E('div', { 'class': 'hv-h' }, [E('span', {}, 'Журнал'), E('div', { style: 'display:flex;gap:6px' }, [refreshBtn, clearBtn])]),
				this.logBox
			]));
		}
		rLogs().then(function (r) {
			self.logBox.textContent = (r && (r.log || r.logs)) || 'Журнал пуст';
		}).catch(function () {
			self.logBox.textContent = 'Не удалось загрузить журнал';
		});
	}
});
