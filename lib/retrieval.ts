export function vectorize(text: string, size = 64): number[] {
  const v = Array(size).fill(0); const tokens = text.toLowerCase().replace(/[^a-z0-9\s]/g,' ').split(/\s+/).filter(Boolean);
  for (const token of tokens) { let h=0; for (let i=0;i<token.length;i++) h=(h*31+token.charCodeAt(i))>>>0; v[h%size] += 1; }
  const norm=Math.sqrt(v.reduce((s,x)=>s+x*x,0))||1; return v.map(x=>x/norm);
}
export function similarity(a:number[], b:number[]) { let s=0; for(let i=0;i<Math.min(a.length,b.length);i++) s+=a[i]*b[i]; return s; }
