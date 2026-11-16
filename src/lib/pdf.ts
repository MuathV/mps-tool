import { getFontEmbedCSS, toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

/** يصغّر محتوى الصفحة عند الحاجة حتى لا يتجاوز مساحة A4 ولا ينقسم بين صفحتين */
function fitPage(page: HTMLElement) {
  const box = page.querySelector<HTMLElement>('[data-fit]');
  const inner = page.querySelector<HTMLElement>('[data-fit-inner]');
  if (!box || !inner) return;
  inner.style.transform = '';
  inner.style.width = '';
  const avail = box.clientHeight;
  const need = inner.scrollHeight;
  if (need > avail) {
    const k = Math.max(0.6, avail / need);
    inner.style.transform = `scale(${k})`;
    inner.style.width = `${100 / k}%`;
    // ثبّت المحاذاة إلى اليمين في اتجاه RTL
    inner.style.marginRight = '0';
  }
}

export function safeFileName(job: string, date: string) {
  const clean = (t: string) =>
    t
      .trim()
      .replace(/[\\/:*?"<>|]+/g, '')
      .replace(/\s+/g, '-') || 'وظيفة';
  return `MPS_${clean(job)}_${clean(date)}.pdf`;
}

export async function exportReportPdf(container: HTMLElement, fileName: string) {
  await document.fonts.ready;
  const pages = Array.from(container.querySelectorAll<HTMLElement>('.report-page'));
  pages.forEach(fitPage);
  // مهلة قصيرة لاكتمال التخطيط (setTimeout بدلاً من rAF كي لا يتوقف في التبويبات الخلفية)
  await new Promise((r) => setTimeout(r, 120));

  const fontEmbedCSS = await getFontEmbedCSS(pages[0]);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
  pdf.setProperties({ title: fileName.replace(/\.pdf$/, ''), subject: 'تقرير تشخيص الإثراء الوظيفي (MPS)', creator: 'أداة تشخيص الإثراء الوظيفي' });

  for (let i = 0; i < pages.length; i++) {
    const png = await toPng(pages[i], {
      pixelRatio: 3,
      backgroundColor: '#ffffff',
      fontEmbedCSS,
      cacheBust: false,
    });
    if (i > 0) pdf.addPage('a4', 'portrait');
    pdf.addImage(png, 'PNG', 0, 0, 210, 297, undefined, 'FAST');
  }
  pdf.save(fileName);
}
