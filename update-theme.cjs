const fs = require('fs');
const path = 'src/pages/doctor/ClinicDoctors.tsx';
let content = fs.readFileSync(path, 'utf8');

const class1 = 'className="gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:from-orange-600 hover:to-orange-700 font-black shadow-[0_0_15px_rgba(249,115,22,0.4)] border border-orange-400/50 px-6 py-2.5 h-auto text-sm transition-all hover:scale-105"';
const class1Repl = 'className={`gap-2 rounded-xl bg-gradient-to-r text-white font-black border px-6 py-2.5 h-auto text-sm transition-all hover:scale-105 ${isPharmacy ? "from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-[0_0_15px_rgba(16,185,129,0.4)] border-emerald-400/50" : "from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-[0_0_15px_rgba(249,115,22,0.4)] border-orange-400/50"}`}';
content = content.replace(class1, class1Repl);

const class2 = 'className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2"';
const class2Repl = 'className={`rounded-2xl text-white font-bold gap-2 ${isPharmacy ? "bg-emerald-500 hover:bg-emerald-600" : "bg-orange-500 hover:bg-orange-600"}`}';
content = content.replace(class2, class2Repl);

const class3 = 'border-slate-200 hover:border-orange-200 bg-white';
const class3Repl = '${isPharmacy ? "border-slate-200 hover:border-emerald-200 bg-white" : "border-slate-200 hover:border-orange-200 bg-white"}';
content = content.replace(class3, class3Repl);

const class4 = 'className="flex-1 text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white rounded-xl h-9 shadow-sm"';
const class4Repl = 'className={`flex-1 text-xs font-bold text-white rounded-xl h-9 shadow-sm ${isPharmacy ? "bg-emerald-500 hover:bg-emerald-600" : "bg-orange-500 hover:bg-orange-600"}`}';
content = content.replace(class4, class4Repl);

const class5 = 'className="flex-1 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black h-11 gap-2 shadow-lg shadow-orange-200"';
const class5Repl = 'className={`flex-1 rounded-2xl text-white font-black h-11 gap-2 shadow-lg ${isPharmacy ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200" : "bg-orange-500 hover:bg-orange-600 shadow-orange-200"}`}';
content = content.replace(class5, class5Repl);

const class6 = 'className="bg-gradient-to-l from-orange-500 to-orange-600 p-5 flex items-center justify-between"';
const class6Repl = 'className={`bg-gradient-to-l p-5 flex items-center justify-between ${isPharmacy ? "from-emerald-500 to-emerald-600" : "from-orange-500 to-orange-600"}`}';
content = content.replace(class6, class6Repl);

const class7 = 'className="text-orange-100 text-xs mt-0.5"';
const class7Repl = 'className={`text-xs mt-0.5 ${isPharmacy ? "text-emerald-100" : "text-orange-100"}`}';
content = content.replace(class7, class7Repl);

const class8 = 'file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100';
const class8Repl = '${isPharmacy ? "file:bg-emerald-50 file:text-emerald-600 hover:file:bg-emerald-100" : "file:bg-orange-50 file:text-orange-600 hover:file:bg-orange-100"}';
content = content.replace(class8, class8Repl);

content = content.replace(/className=\"([^\"{}]*)focus-visible:border-orange-400([^\"{}]*)\"/g, 'className={`$1${isPharmacy ? "focus-visible:border-emerald-400" : "focus-visible:border-orange-400"}$2`}');

fs.writeFileSync(path, content, 'utf8');
console.log('Update complete!');
